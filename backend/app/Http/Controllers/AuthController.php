<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Register success',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không chính xác.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request, ResendEmailService $emailService)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);
        $successMessage = 'Đức Chính Jewelry đã gửi mật khẩu mới đến email của bạn. Vui lòng kiểm tra hộp thư.';

        $user = User::query()
            ->where('email', $validated['email'])
            ->where('role', 'customer')
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'Email này chưa được đăng ký trong hệ thống.',
                'errors' => [
                    'email' => ['Email này chưa được đăng ký trong hệ thống.'],
                ],
            ], 404);
        }

        $temporaryPassword = Str::random(12);
        $oldPassword = $user->password;
        $oldMustChangePassword = $user->must_change_password;

        $user->forceFill([
            'password' => Hash::make($temporaryPassword),
            'must_change_password' => true,
        ])->save();

        try {
            $emailService->sendTemporaryPassword(
                $user->email,
                $user->name,
                $temporaryPassword
            );
        } catch (Throwable $exception) {
            report($exception);

            $user->forceFill([
                'password' => $oldPassword,
                'must_change_password' => $oldMustChangePassword,
            ])->save();

            $message = str_contains($exception->getMessage(), 'You can only send testing emails')
                ? 'Resend đang ở chế độ test nên chỉ gửi được tới email chủ tài khoản Resend. Hãy xác minh domain trong Resend và đổi RESEND_FROM_ADDRESS sang email thuộc domain đó.'
                : 'Chưa thể gửi email khôi phục mật khẩu. Vui lòng kiểm tra cấu hình Resend hoặc thử lại sau.';

            return response()->json([
                'message' => $message,
            ], 502);
        }

        return response()->json([
            'message' => $successMessage,
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không đúng.'],
            ]);
        }

        if (Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Mật khẩu mới phải khác mật khẩu hiện tại.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ])->save();

        $currentToken = $request->user()->currentAccessToken();

        if ($currentToken) {
            $request->user()->tokens()
                ->where('id', '!=', $currentToken->id)
                ->delete();
        }

        return response()->json([
            'message' => 'Đổi mật khẩu thành công.',
            'user' => $user->fresh(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout success',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'address_detail' => ['nullable', 'string', 'max:500'],
            'province_code' => ['nullable', 'string', 'exists:provinces,code'],
            'ward_code' => ['nullable', 'string', 'exists:wards,code'],
        ]);

        $location = $this->resolveLocation(
            $validated['province_code'] ?? null,
            $validated['ward_code'] ?? null
        );

        $request->user()->update([
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? $this->formatAddress(
                $validated['address_detail'] ?? null,
                $location['ward_name'],
                $location['province_name']
            ),
            'address_detail' => $validated['address_detail'] ?? null,
            'province_code' => $location['province_code'],
            'province_name' => $location['province_name'],
            'ward_code' => $location['ward_code'],
            'ward_name' => $location['ward_name'],
        ]);

        return response()->json([
            'message' => 'Profile updated',
            'user' => $request->user()->fresh(),
        ]);
    }

    private function resolveLocation(?string $provinceCode, ?string $wardCode): array
    {
        $province = $provinceCode
            ? DB::table('provinces')->where('code', $provinceCode)->first()
            : null;
        $ward = $wardCode
            ? DB::table('wards')->where('code', $wardCode)->first()
            : null;

        if ($ward && $province && $ward->province_code !== $province->code) {
            throw ValidationException::withMessages([
                'ward_code' => ['Phường/xã không thuộc tỉnh/thành đã chọn.'],
            ]);
        }

        return [
            'province_code' => $province?->code,
            'province_name' => $province?->full_name,
            'ward_code' => $ward?->code,
            'ward_name' => $ward?->full_name,
        ];
    }

    private function formatAddress(?string $detail, ?string $wardName, ?string $provinceName): ?string
    {
        $parts = array_filter([$detail, $wardName, $provinceName]);

        return $parts === [] ? null : implode(', ', $parts);
    }
}

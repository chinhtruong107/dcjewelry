<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use App\Services\ResendEmailService;
use Illuminate\Http\Request;
use Throwable;

class CustomerEngagementController extends Controller
{
    public function contact(Request $request, ResendEmailService $emailService)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ]);

        $contactMessage = ContactMessage::create([
            ...$validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($emailService->canSendContactNotification()) {
            try {
                $emailService->sendContactNotification($contactMessage);
                $contactMessage->forceFill(['notified_at' => now()])->save();
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return response()->json([
            'message' => 'Đức Chính Jewelry đã nhận được tin nhắn. Đội ngũ tư vấn sẽ liên hệ lại sớm nhất.',
            'reference' => 'LH-'.str_pad((string) $contactMessage->id, 6, '0', STR_PAD_LEFT),
        ], 201);
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'source' => ['sometimes', 'string', 'max:100'],
        ]);

        $subscriber = NewsletterSubscriber::firstOrNew([
            'email' => mb_strtolower(trim($validated['email'])),
        ]);

        $wasSubscribed = $subscriber->exists && $subscriber->status === 'subscribed';

        if (! $wasSubscribed) {
            $subscriber->fill([
                'status' => 'subscribed',
                'source' => $validated['source'] ?? 'website_footer',
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ])->save();
        }

        return response()->json([
            'message' => $wasSubscribed
                ? 'Email này đã có trong danh sách nhận tin của Đức Chính Jewelry.'
                : 'Đăng ký thành công. Những câu chuyện mới sẽ được gửi riêng đến bạn.',
            'already_subscribed' => $wasSubscribed,
        ], $wasSubscribed ? 200 : 201);
    }
}

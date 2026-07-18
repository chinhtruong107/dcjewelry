<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category', $request->string('category'));
            })
            ->when($request->boolean('best_seller'), function ($query) {
                $query->where('is_best_seller', true);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search');

                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $product = Product::create($this->productData($request));

        return response()->json($product, 201);
    }

    public function show($id)
    {
        return Product::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($this->productData($request, true, $product));

        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $this->deleteStoredImage($product->getRawImagePath());
        $product->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }

    private function productData(Request $request, bool $partial = false, ?Product $product = null): array
    {
        $data = $this->validatedData($request, $partial);
        unset($data['image_file'], $data['image_data']);

        if ($request->hasFile('image_file')) {
            $this->deleteStoredImage($product?->getRawImagePath());
            $data['image'] = $request->file('image_file')->store('products', 'public');
        }

        if ($request->filled('image_data')) {
            $data['image'] = $this->storeImageData((string) $request->string('image_data'), $product, $data['image'] ?? null);
        }

        return $data;
    }

    private function storeImageData(string $imageData, ?Product $product = null, ?string $requestedPath = null): string
    {
        if (! preg_match('/^data:image\/(?:jpeg|jpg|png|webp);base64,/', $imageData)) {
            abort(422, 'Dữ liệu ảnh không hợp lệ.');
        }

        $binary = base64_decode(preg_replace('/^data:image\/(?:jpeg|jpg|png|webp);base64,/', '', $imageData), true);

        if ($binary === false) {
            abort(422, 'Không thể đọc dữ liệu ảnh.');
        }

        $targetPath = $product?->getRawImagePath() ?: $requestedPath;

        if (! $targetPath || str_starts_with($targetPath, 'http://') || str_starts_with($targetPath, 'https://')) {
            $targetPath = 'products/product-'.($product?->id ?? uniqid()).'.jpg';
        }

        $targetPath = ltrim(str_replace('/storage/', '', $targetPath), '/');
        Storage::disk('public')->put($targetPath, $binary);

        return $targetPath;
    }

    private function deleteStoredImage(?string $path): void
    {
        if (! $path || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return;
        }

        $path = ltrim(str_replace('/storage/', '', $path), '/');

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function validatedData(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'price' => [$required, 'integer', 'min:0'],
            'image' => ['nullable', 'string'],
            'image_data' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'description' => ['nullable', 'string'],
            'category' => [$required, 'string', 'max:255'],
            'is_best_seller' => ['sometimes', 'boolean'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'warranty_months' => ['sometimes', 'integer', 'min:1', 'max:120'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ]);
    }
}

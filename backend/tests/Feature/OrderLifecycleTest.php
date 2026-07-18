<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderLifecycleTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_checkout_calculates_totals_and_cancel_restores_stock(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'must_change_password' => false]);
        $product = Product::create([
            'name' => 'Dây chuyền vàng 18K',
            'price' => 300000,
            'category' => 'Dây chuyền',
            'stock' => 5,
            'status' => 'active',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/orders', [
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '0389794445',
                'address' => '12 Tràng Tiền, Hà Nội',
            ],
            'items' => [[
                'id' => $product->id,
                'quantity' => 2,
            ]],
            'payment_method' => 'cod',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('subtotal', 600000)
            ->assertJsonPath('shipping_fee', 0)
            ->assertJsonPath('tax', 48000)
            ->assertJsonPath('discount', 30000)
            ->assertJsonPath('total', 618000);

        $orderId = $response->json('id');
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 3]);

        $this->patchJson("/api/orders/{$orderId}/cancel")
            ->assertOk()
            ->assertJsonPath('status', 'cancelled');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 5]);
    }

    public function test_user_cannot_read_another_customers_order(): void
    {
        $owner = User::factory()->create(['role' => 'customer']);
        $otherUser = User::factory()->create(['role' => 'customer']);
        $product = Product::create([
            'name' => 'Bông tai Moissanite',
            'price' => 500000,
            'category' => 'Bông tai',
            'stock' => 2,
            'status' => 'active',
        ]);

        Sanctum::actingAs($owner);
        $orderId = $this->postJson('/api/orders', [
            'customer' => ['name' => $owner->name, 'email' => $owner->email, 'phone' => '0389794445', 'address' => 'Hà Nội'],
            'items' => [['id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'cod',
        ])->assertCreated()->json('id');

        Sanctum::actingAs($otherUser);
        $this->getJson("/api/orders/{$orderId}")->assertForbidden();
    }
}

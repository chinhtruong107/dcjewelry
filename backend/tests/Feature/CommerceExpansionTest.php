<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommerceExpansionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_is_persisted_and_can_be_merged_into_customer_cart(): void
    {
        $product = $this->product();
        $guestToken = 'guest-cart-token-1234567890';

        $this->withHeader('X-Cart-Token', $guestToken)
            ->postJson('/api/cart/items', ['product_id' => $product->id, 'quantity' => 2])
            ->assertCreated()
            ->assertJsonPath('items.0.quantity', 2);

        $user = User::factory()->create(['role' => 'customer', 'must_change_password' => false]);
        Sanctum::actingAs($user);

        $this->postJson('/api/cart/merge', ['guest_token' => $guestToken])
            ->assertOk()
            ->assertJsonPath('items.0.id', $product->id)
            ->assertJsonPath('items.0.quantity', 2);

        $this->assertDatabaseMissing('carts', ['guest_token' => $guestToken]);
        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
    }

    public function test_admin_can_create_demo_shipment_and_customer_can_request_return(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'must_change_password' => false]);
        $admin = User::factory()->create(['role' => 'admin', 'must_change_password' => false]);
        $product = $this->product();

        Sanctum::actingAs($customer);
        $orderId = $this->postJson('/api/orders', [
            'customer' => ['name' => $customer->name, 'email' => $customer->email, 'phone' => '0389794445', 'address' => 'Hà Nội'],
            'items' => [['id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'cod',
        ])->assertCreated()->assertJsonPath('items.0.warranty_months', 12)->json('id');

        Sanctum::actingAs($admin, ['admin']);
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => 'processing'])->assertOk();
        $shipment = $this->postJson("/api/admin/orders/{$orderId}/shipment", ['carrier' => 'ghn'])
            ->assertOk()
            ->assertJsonPath('status', 'shipping')
            ->assertJsonPath('shipping_carrier', 'ghn');
        $this->assertStringStartsWith('GHN-DEMO-', $shipment->json('tracking_number'));
        $this->getJson('/api/shipments/track/'.$shipment->json('tracking_number'))
            ->assertOk()
            ->assertJsonPath('is_demo', true);
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => 'completed', 'payment_status' => 'paid'])
            ->assertOk()
            ->assertJsonPath('status', 'completed');

        Sanctum::actingAs($customer);
        $order = Order::with('items')->findOrFail($orderId);
        $this->getJson('/api/certificates/'.$order->items->first()->certificate_code)
            ->assertOk()
            ->assertJsonPath('warranty_months', 12);
        $this->postJson('/api/return-requests', [
            'order_id' => $order->id,
            'order_item_id' => $order->items->first()->id,
            'type' => 'return',
            'reason' => 'Sản phẩm không vừa kích thước.',
        ])->assertCreated()->assertJsonPath('status', 'pending');
    }

    public function test_momo_is_no_longer_accepted_at_checkout(): void
    {
        $product = $this->product();

        $this->postJson('/api/orders', [
            'customer' => ['name' => 'Khách thử', 'email' => 'guest@example.com', 'phone' => '0389794445', 'address' => 'Hà Nội'],
            'items' => [['id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'momo',
        ])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
    }

    public function test_shipping_and_warranty_migration_can_be_reapplied_safely(): void
    {
        $migration = require database_path('migrations/2026_07_18_000002_add_shipping_and_warranty_fields.php');

        $migration->up();

        $this->assertTrue(Schema::hasColumn('products', 'warranty_months'));
        $this->assertTrue(Schema::hasColumn('orders', 'tracking_number'));
        $this->assertTrue(Schema::hasColumn('order_items', 'certificate_code'));
        $this->assertTrue(Schema::hasTable('shipment_events'));
    }

    private function product(): Product
    {
        return Product::create([
            'name' => 'Nhẫn vàng 18K',
            'price' => 1200000,
            'category' => 'Nhẫn',
            'stock' => 10,
            'warranty_months' => 12,
            'status' => 'active',
        ]);
    }
}

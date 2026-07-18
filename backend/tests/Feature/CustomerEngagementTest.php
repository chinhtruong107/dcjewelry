<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class CustomerEngagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_form_persists_a_real_message(): void
    {
        Config::set('services.resend.contact_to', null);

        $response = $this->postJson('/api/contact-messages', [
            'name' => 'Nguyễn Minh Anh',
            'email' => 'minhanh@example.com',
            'subject' => 'Tư vấn dây chuyền',
            'message' => 'Tôi muốn được tư vấn mẫu dây chuyền phù hợp để làm quà tặng.',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('reference', 'LH-000001');

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'minhanh@example.com',
            'subject' => 'Tư vấn dây chuyền',
            'status' => 'new',
        ]);
    }

    public function test_contact_form_rejects_invalid_payload(): void
    {
        $this->postJson('/api/contact-messages', [
            'name' => '',
            'email' => 'not-an-email',
            'subject' => '',
            'message' => 'ngắn',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);
    }

    public function test_newsletter_subscription_is_idempotent(): void
    {
        $this->postJson('/api/newsletter-subscriptions', [
            'email' => 'Client@Example.com',
            'source' => 'website_footer',
        ])->assertCreated()->assertJsonPath('already_subscribed', false);

        $this->postJson('/api/newsletter-subscriptions', [
            'email' => 'client@example.com',
            'source' => 'website_footer',
        ])->assertOk()->assertJsonPath('already_subscribed', true);

        $this->assertDatabaseCount('newsletter_subscribers', 1);
        $this->assertDatabaseHas('newsletter_subscribers', [
            'email' => 'client@example.com',
            'status' => 'subscribed',
        ]);
    }
}

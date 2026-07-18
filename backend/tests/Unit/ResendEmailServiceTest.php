<?php

namespace Tests\Unit;

use App\Services\ResendEmailService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class ResendEmailServiceTest extends TestCase
{
    public function test_it_sends_temporary_password_email_through_resend(): void
    {
        Config::set('services.resend.key', 're_test_key');
        Config::set('services.resend.from', 'Duc Chinh Jewelry <hello@example.com>');

        Http::fake([
            'api.resend.com/emails' => Http::response(['id' => 'email_123'], 200),
        ]);

        app(ResendEmailService::class)->sendTemporaryPassword(
            'customer@example.com',
            'Nguyen Van A',
            'TempPass123'
        );

        Http::assertSent(function ($request) {
            $payload = $request->data();

            return $request->url() === 'https://api.resend.com/emails'
                && $request->hasHeader('Authorization', 'Bearer re_test_key')
                && $payload['from'] === 'Duc Chinh Jewelry <hello@example.com>'
                && $payload['to'] === ['customer@example.com']
                && $payload['subject'] === 'Mật khẩu mới cho tài khoản Đức Chính Jewelry'
                && str_contains($payload['text'], 'TempPass123');
        });
    }

    public function test_it_throws_resend_error_message_when_request_fails(): void
    {
        Config::set('services.resend.key', 're_test_key');
        Config::set('services.resend.from', 'Duc Chinh Jewelry <hello@example.com>');

        Http::fake([
            'api.resend.com/emails' => Http::response(['message' => 'Domain is not verified.'], 403),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Resend email request failed with status 403: Domain is not verified.');

        app(ResendEmailService::class)->sendTemporaryPassword(
            'customer@example.com',
            'Nguyen Van A',
            'TempPass123'
        );
    }
}

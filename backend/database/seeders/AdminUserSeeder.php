<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@ducchinhjewelry.local')],
            [
                'name' => env('ADMIN_NAME', 'Admin'),
                'phone' => env('ADMIN_PHONE'),
                'address' => env('ADMIN_ADDRESS'),
                'role' => 'admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', '123456')),
                'email_verified_at' => now(),
            ]
        );
    }
}

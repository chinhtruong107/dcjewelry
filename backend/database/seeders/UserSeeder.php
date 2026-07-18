<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('../frontend/data/users.json');

        if (! File::exists($path)) {
            $this->command?->warn("User seed file not found: {$path}");

            return;
        }

        $users = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'phone' => $user['phone'] ?? null,
                    'address' => $user['address'] ?? null,
                    'password' => Hash::make($user['password']),
                ]
            );
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VietnameseAdministrativeUnitSeeder extends Seeder
{
    public function run(): void
    {
        $this->importDatasetIfNeeded();
        $this->backfillAddresses();
    }

    private function importDatasetIfNeeded(): void
    {
        if (DB::table('provinces')->count() > 0 && DB::table('wards')->count() > 0) {
            return;
        }

        $path = database_path('data/vietnamese-provinces/mysql_ImportData_vn_units.sql');

        if (! file_exists($path)) {
            $this->command?->warn("Vietnamese provinces dataset not found: {$path}");

            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::unprepared(file_get_contents($path));
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    private function backfillAddresses(): void
    {
        $provinces = DB::table('provinces')
            ->select('code', 'name', 'full_name', 'code_name')
            ->get();

        if ($provinces->isEmpty()) {
            return;
        }

        DB::table('users')
            ->whereNull('province_code')
            ->whereNotNull('address')
            ->orderBy('id')
            ->each(function ($user) use ($provinces) {
                $province = $this->guessProvince($user->address, $provinces);

                if (! $province) {
                    return;
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'address_detail' => $user->address,
                        'province_code' => $province->code,
                        'province_name' => $province->full_name,
                    ]);
            });

        DB::table('orders')
            ->where(function ($query) {
                $query
                    ->whereNull('customer_province_code')
                    ->orWhereNull('recipient_province_code');
            })
            ->orderBy('id')
            ->each(function ($order) use ($provinces) {
                $updates = [];
                $customerProvince = $this->guessProvince($order->customer_address, $provinces);

                if ($customerProvince && ! $order->customer_province_code) {
                    $updates['customer_address_detail'] = $order->customer_address;
                    $updates['customer_province_code'] = $customerProvince->code;
                    $updates['customer_province_name'] = $customerProvince->full_name;
                }

                if ($order->recipient_address && ! $order->recipient_province_code) {
                    $recipientProvince = $this->guessProvince($order->recipient_address, $provinces);

                    if ($recipientProvince) {
                        $updates['recipient_address_detail'] = $order->recipient_address;
                        $updates['recipient_province_code'] = $recipientProvince->code;
                        $updates['recipient_province_name'] = $recipientProvince->full_name;
                    }
                }

                if ($updates !== []) {
                    DB::table('orders')
                        ->where('id', $order->id)
                        ->update($updates);
                }
            });
    }

    private function guessProvince(?string $address, Collection $provinces): ?object
    {
        if (! $address) {
            return null;
        }

        $normalizedAddress = $this->normalize($address);
        $aliases = [
            '79' => ['ho chi minh', 'hcm', 'tp hcm', 'tp. hcm', 'sai gon', 'sai gon', 'chi minh'],
            '48' => ['da nang', 'da n?ng', 'nang'],
            '01' => ['ha noi', 'ha n?i', 'hanoi'],
            '56' => ['khanh hoa', 'nha trang'],
            '68' => ['lam dong', 'da lat', 'lat'],
            '38' => ['thanh hoa'],
        ];

        foreach ($aliases as $provinceCode => $provinceAliases) {
            foreach ($provinceAliases as $alias) {
                if (str_contains($normalizedAddress, $this->normalize($alias))) {
                    return $provinces->firstWhere('code', $provinceCode);
                }
            }
        }

        foreach ($provinces as $province) {
            $names = array_filter([
                $province->name,
                $province->full_name,
                $province->code_name ? str_replace('_', ' ', $province->code_name) : null,
            ]);

            foreach ($names as $name) {
                if (str_contains($normalizedAddress, $this->normalize($name))) {
                    return $province;
                }
            }
        }

        return null;
    }

    private function normalize(string $value): string
    {
        return Str::of($value)
            ->ascii()
            ->lower()
            ->replaceMatches('/[^a-z0-9?]+/', ' ')
            ->squish()
            ->toString();
    }
}

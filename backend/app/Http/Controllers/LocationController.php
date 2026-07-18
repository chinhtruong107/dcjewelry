<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    public function provinces()
    {
        return response()->json(
            DB::table('provinces')
                ->select('code', 'name', 'full_name', 'code_name')
                ->orderBy('code')
                ->get()
        );
    }

    public function wards(string $provinceCode)
    {
        abort_unless(
            DB::table('provinces')->where('code', $provinceCode)->exists(),
            404
        );

        return response()->json(
            DB::table('wards')
                ->select('code', 'name', 'full_name', 'province_code', 'code_name')
                ->where('province_code', $provinceCode)
                ->orderBy('name')
                ->get()
        );
    }
}

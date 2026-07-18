<?php

namespace App\Http\Controllers;

use App\Models\DonHang;
use Illuminate\Http\Request;

class DonHangController extends Controller
{
    public function index()
    {
        return DonHang::all();
    }

    public function store(Request $request)
    {
        $donHang = DonHang::create($request->all());

        return response()->json($donHang, 201);
    }

    public function show($id)
    {
        return DonHang::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $donHang = DonHang::findOrFail($id);
        $donHang->update($request->all());

        return response()->json($donHang);
    }

    public function destroy($id)
    {
        DonHang::findOrFail($id)->delete();

        return response()->json(['message' => 'Đã xoá']);
    }
}

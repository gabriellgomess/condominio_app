<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Subaccount;
use Illuminate\Http\Request;

class SubaccountController extends Controller
{
    public function index(Request $request)
    {
        $query = Subaccount::query();
        if ($request->has('condominium_id')) {
            $query->where('condominium_id', $request->integer('condominium_id'));
        }
        return response()->json($query->orderBy('name')->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'condominium_id' => 'required|exists:condominiums,id',
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $sub = Subaccount::create($data);
        return response()->json(['success' => true, 'data' => $sub], 201);
    }

    public function show(Subaccount $subaccount)
    {
        return response()->json($subaccount);
    }

    public function update(Request $request, Subaccount $subaccount)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $subaccount->update($data);
        return response()->json(['success' => true, 'data' => $subaccount]);
    }

    public function destroy(Subaccount $subaccount)
    {
        $subaccount->delete();
        return response()->json(['success' => true]);
    }
}
















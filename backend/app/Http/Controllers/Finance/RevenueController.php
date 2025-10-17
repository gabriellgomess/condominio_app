<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Revenue;
use Illuminate\Http\Request;

class RevenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Revenue::query();
        if ($request->has('condominium_id')) {
            $query->where('condominium_id', $request->integer('condominium_id'));
        }
        if ($request->has('competency_date')) {
            $query->whereDate('competency_date', $request->date('competency_date'));
        }
        return response()->json($query->orderByDesc('competency_date')->paginate(50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'condominium_id' => 'required|exists:condominiums,id',
            'subaccount_id' => 'nullable|exists:subaccounts,id',
            'source' => 'required|in:cota,po',
            'destination' => 'required|in:cota,po',
            'type' => 'required|in:fixa,variavel',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'competency_date' => 'required|date',
            'amount' => 'required|numeric',
            'is_forecast' => 'boolean',
            'meta' => 'array',
        ]);

        $rev = Revenue::create($data);
        return response()->json(['success' => true, 'data' => $rev], 201);
    }

    public function show(Revenue $revenue)
    {
        return response()->json($revenue);
    }

    public function update(Request $request, Revenue $revenue)
    {
        $data = $request->validate([
            'subaccount_id' => 'nullable|exists:subaccounts,id',
            'source' => 'in:cota,po',
            'destination' => 'in:cota,po',
            'type' => 'in:fixa,variavel',
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'competency_date' => 'date',
            'amount' => 'numeric',
            'is_forecast' => 'boolean',
            'meta' => 'array',
        ]);

        $revenue->update($data);
        return response()->json(['success' => true, 'data' => $revenue]);
    }

    public function destroy(Revenue $revenue)
    {
        $revenue->delete();
        return response()->json(['success' => true]);
    }
}






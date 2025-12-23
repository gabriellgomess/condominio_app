<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Se não houver filtro de condomínio, retornar todos os contratos
        $query = Contract::query();

        if ($request->has('condominium_id')) {
            $query->where('condominium_id', $request->condominium_id);
        }

        $contracts = $query->orderBy('end_date', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'condominium_id' => 'required|exists:condominiums,id',
            'contract_type' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'adjustment_index' => 'nullable|string|max:255',
            'termination_notice_date' => 'nullable|date',
            'notice_period_days' => 'nullable|integer|in:30,60,90',
            'auto_renew' => 'nullable|boolean',
            'contract_value' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,expired,terminated',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $contract = Contract::create([
            'condominium_id' => $request->condominium_id,
            'contract_type' => $request->contract_type,
            'company_name' => $request->company_name,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'adjustment_index' => $request->adjustment_index,
            'termination_notice_date' => $request->termination_notice_date,
            'notice_period_days' => $request->notice_period_days ?? 30,
            'auto_renew' => $request->auto_renew ?? true,
            'contract_value' => $request->contract_value,
            'status' => $request->status ?? 'active',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contrato criado com sucesso',
            'data' => $contract
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $contract = Contract::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $contract
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'condominium_id' => 'required|exists:condominiums,id',
            'contract_type' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'adjustment_index' => 'nullable|string|max:255',
            'termination_notice_date' => 'nullable|date',
            'notice_period_days' => 'nullable|integer|in:30,60,90',
            'auto_renew' => 'nullable|boolean',
            'contract_value' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,expired,terminated',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        $contract = Contract::where('condominium_id', $request->condominium_id)
            ->findOrFail($id);

        $contract->update([
            'condominium_id' => $request->condominium_id,
            'contract_type' => $request->contract_type,
            'company_name' => $request->company_name,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'adjustment_index' => $request->adjustment_index,
            'termination_notice_date' => $request->termination_notice_date,
            'notice_period_days' => $request->notice_period_days ?? 30,
            'auto_renew' => $request->auto_renew ?? true,
            'contract_value' => $request->contract_value,
            'status' => $request->status ?? 'active',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contrato atualizado com sucesso',
            'data' => $contract
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contract = Contract::findOrFail($id);

        $contract->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contrato excluído com sucesso'
        ]);
    }
}

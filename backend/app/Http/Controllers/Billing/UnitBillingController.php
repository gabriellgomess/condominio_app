<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\UnitBilling;
use App\Models\MonthlyFee;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitBillingController extends Controller
{
    /**
     * Lista todas as cobranças
     */
    public function index(Request $request)
    {
        $query = UnitBilling::with(['monthlyFee.condominium', 'unit.block', 'payments']);

        // Filtro por mensalidade
        if ($request->has('monthly_fee_id')) {
            $query->where('monthly_fee_id', $request->monthly_fee_id);
        }

        // Filtro por unidade
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por condomínio (via relação)
        if ($request->has('condominium_id')) {
            $query->whereHas('monthlyFee', function ($q) use ($request) {
                $q->where('condominium_id', $request->condominium_id);
            });
        }

        // Filtro de vencidos
        if ($request->has('overdue') && $request->overdue) {
            $query->overdue();
        }

        // Ordenação
        $query->orderBy('due_date', 'desc');

        $unitBillings = $query->paginate(50);

        // Adiciona atributos calculados
        $unitBillings->getCollection()->transform(function ($billing) {
            $billing->balance = $billing->balance;
            $billing->is_overdue = $billing->is_overdue;
            $billing->days_overdue = $billing->days_overdue;
            return $billing;
        });

        return response()->json($unitBillings);
    }

    /**
     * Exibe uma cobrança específica
     */
    public function show($id)
    {
        $unitBilling = UnitBilling::with(['monthlyFee.condominium', 'unit.block', 'payments'])
            ->findOrFail($id);

        $unitBilling->balance = $unitBilling->balance;
        $unitBilling->is_overdue = $unitBilling->is_overdue;
        $unitBilling->days_overdue = $unitBilling->days_overdue;

        return response()->json($unitBilling);
    }

    /**
     * Cria uma nova cobrança
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'monthly_fee_id' => 'required|exists:monthly_fees,id',
            'unit_id' => 'required|exists:units,id',
            'ideal_fraction' => 'nullable|numeric|min:0',
            'base_amount' => 'required|numeric|min:0',
            'additional_charges' => 'nullable|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'barcode' => 'nullable|string',
            'digitable_line' => 'nullable|string',
            'our_number' => 'nullable|string',
            'due_date' => 'required|date',
            'status' => 'nullable|in:pending,paid,overdue,partially_paid,cancelled',
            'payment_date' => 'nullable|date',
            'amount_paid' => 'nullable|numeric|min:0',
            'late_fee' => 'nullable|numeric|min:0',
            'interest' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Preparar dados, convertendo strings vazias em null ou 0 conforme apropriado
        $data = $request->all();

        // Campos numéricos que podem ser vazios devem ser 0
        $numericFields = ['ideal_fraction', 'additional_charges', 'discounts', 'amount_paid', 'late_fee', 'interest'];
        foreach ($numericFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = 0;
            }
        }

        // Campos de texto vazios devem ser null
        $textFields = ['barcode', 'digitable_line', 'our_number', 'notes'];
        foreach ($textFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $unitBilling = UnitBilling::create($data);

        return response()->json($unitBilling, 201);
    }

    /**
     * Atualiza uma cobrança
     */
    public function update(Request $request, $id)
    {
        $unitBilling = UnitBilling::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'monthly_fee_id' => 'sometimes|required|exists:monthly_fees,id',
            'unit_id' => 'sometimes|required|exists:units,id',
            'ideal_fraction' => 'nullable|numeric|min:0',
            'base_amount' => 'sometimes|required|numeric|min:0',
            'additional_charges' => 'nullable|numeric|min:0',
            'discounts' => 'nullable|numeric|min:0',
            'total_amount' => 'sometimes|required|numeric|min:0',
            'barcode' => 'nullable|string',
            'digitable_line' => 'nullable|string',
            'our_number' => 'nullable|string',
            'due_date' => 'sometimes|required|date',
            'status' => 'nullable|in:pending,paid,overdue,partially_paid,cancelled',
            'payment_date' => 'nullable|date',
            'amount_paid' => 'nullable|numeric|min:0',
            'late_fee' => 'nullable|numeric|min:0',
            'interest' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Preparar dados, convertendo strings vazias em null ou 0 conforme apropriado
        $data = $request->all();

        // Campos numéricos que podem ser vazios devem ser 0
        $numericFields = ['ideal_fraction', 'additional_charges', 'discounts', 'amount_paid', 'late_fee', 'interest'];
        foreach ($numericFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = 0;
            }
        }

        // Campos de texto vazios devem ser null
        $textFields = ['barcode', 'digitable_line', 'our_number', 'notes'];
        foreach ($textFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        $unitBilling->update($data);

        return response()->json($unitBilling);
    }

    /**
     * Remove uma cobrança
     */
    public function destroy($id)
    {
        $unitBilling = UnitBilling::findOrFail($id);
        $unitBilling->delete();

        return response()->json(['message' => 'Cobrança excluída com sucesso']);
    }

    /**
     * Gera cobranças para todas as unidades de um condomínio
     */
    public function generateBillings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'monthly_fee_id' => 'required|exists:monthly_fees,id',
            'units' => 'required|array',
            'units.*.unit_id' => 'required|exists:units,id',
            'units.*.ideal_fraction' => 'nullable|numeric|min:0',
            'units.*.additional_charges' => 'nullable|numeric|min:0',
            'units.*.discounts' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $monthlyFee = MonthlyFee::findOrFail($request->monthly_fee_id);
        $billings = [];

        foreach ($request->units as $unitData) {
            // Calcula o valor base pela fração ideal
            $idealFraction = $unitData['ideal_fraction'] ?? 0;
            $baseAmount = $monthlyFee->base_value * $idealFraction;

            // Calcula o valor total
            $additionalCharges = $unitData['additional_charges'] ?? 0;
            $discounts = $unitData['discounts'] ?? 0;
            $totalAmount = $baseAmount + $additionalCharges - $discounts;

            $billing = UnitBilling::create([
                'monthly_fee_id' => $monthlyFee->id,
                'unit_id' => $unitData['unit_id'],
                'ideal_fraction' => $idealFraction,
                'base_amount' => $baseAmount,
                'additional_charges' => $additionalCharges,
                'discounts' => $discounts,
                'total_amount' => $totalAmount,
                'due_date' => $monthlyFee->due_date,
                'status' => 'pending',
            ]);

            $billings[] = $billing;
        }

        return response()->json([
            'message' => 'Cobranças geradas com sucesso',
            'count' => count($billings),
            'billings' => $billings,
        ], 201);
    }

    /**
     * Atualiza o status de uma cobrança
     */
    public function updateStatus($id)
    {
        $unitBilling = UnitBilling::findOrFail($id);
        $unitBilling->updateStatus();

        return response()->json([
            'message' => 'Status atualizado com sucesso',
            'billing' => $unitBilling,
        ]);
    }
}

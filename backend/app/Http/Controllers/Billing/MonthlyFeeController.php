<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\MonthlyFee;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MonthlyFeeController extends Controller
{
    /**
     * Lista todas as mensalidades
     */
    public function index(Request $request)
    {
        $query = MonthlyFee::with(['condominium', 'unitBillings']);

        // Filtro por condomínio
        if ($request->has('condominium_id')) {
            $query->where('condominium_id', $request->condominium_id);
        }

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por mês de referência
        if ($request->has('reference_month')) {
            $query->whereDate('reference_month', $request->reference_month);
        }

        // Filtro por ano
        if ($request->has('year')) {
            $query->whereYear('reference_month', $request->year);
        }

        // Ordenação
        $query->orderBy('reference_month', 'desc');

        $monthlyFees = $query->paginate(50);

        // Adiciona atributos calculados
        $monthlyFees->getCollection()->transform(function ($fee) {
            $fee->total_expected = $fee->total_expected;
            $fee->total_collected = $fee->total_collected;
            $fee->total_pending = $fee->total_pending;
            $fee->paid_units_count = $fee->paid_units_count;
            $fee->overdue_units_count = $fee->overdue_units_count;
            return $fee;
        });

        return response()->json($monthlyFees);
    }

    /**
     * Exibe uma mensalidade específica
     */
    public function show($id)
    {
        $monthlyFee = MonthlyFee::with(['condominium', 'unitBillings.unit', 'unitBillings.payments'])
            ->findOrFail($id);

        $monthlyFee->total_expected = $monthlyFee->total_expected;
        $monthlyFee->total_collected = $monthlyFee->total_collected;
        $monthlyFee->total_pending = $monthlyFee->total_pending;
        $monthlyFee->paid_units_count = $monthlyFee->paid_units_count;
        $monthlyFee->overdue_units_count = $monthlyFee->overdue_units_count;

        return response()->json($monthlyFee);
    }

    /**
     * Cria uma nova mensalidade
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'condominium_id' => 'required|exists:condominiums,id',
            'reference_month' => 'required|date',
            'base_value' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'issue_date' => 'nullable|date',
            'status' => 'nullable|in:draft,issued,closed,cancelled',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $monthlyFee = MonthlyFee::create($request->all());

        return response()->json($monthlyFee, 201);
    }

    /**
     * Atualiza uma mensalidade
     */
    public function update(Request $request, $id)
    {
        $monthlyFee = MonthlyFee::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'condominium_id' => 'sometimes|required|exists:condominiums,id',
            'reference_month' => 'sometimes|required|date',
            'base_value' => 'sometimes|required|numeric|min:0',
            'due_date' => 'sometimes|required|date',
            'issue_date' => 'nullable|date',
            'status' => 'nullable|in:draft,issued,closed,cancelled',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $monthlyFee->update($request->all());

        return response()->json($monthlyFee);
    }

    /**
     * Remove uma mensalidade
     */
    public function destroy($id)
    {
        $monthlyFee = MonthlyFee::findOrFail($id);
        $monthlyFee->delete();

        return response()->json(['message' => 'Mensalidade excluída com sucesso']);
    }

    /**
     * Retorna estatísticas de uma mensalidade
     */
    public function statistics($id)
    {
        $monthlyFee = MonthlyFee::with(['unitBillings'])->findOrFail($id);

        $statistics = [
            'total_units' => $monthlyFee->unitBillings()->count(),
            'paid_units' => $monthlyFee->unitBillings()->where('status', 'paid')->count(),
            'overdue_units' => $monthlyFee->unitBillings()->whereIn('status', ['overdue', 'pending'])->count(),
            'partially_paid_units' => $monthlyFee->unitBillings()->where('status', 'partially_paid')->count(),
            'cancelled_units' => $monthlyFee->unitBillings()->where('status', 'cancelled')->count(),
            'total_expected' => $monthlyFee->unitBillings()->sum('total_amount'),
            'total_collected' => $monthlyFee->unitBillings()->sum('amount_paid'),
            'total_pending' => $monthlyFee->unitBillings()->sum('total_amount') - $monthlyFee->unitBillings()->sum('amount_paid'),
            'total_late_fee' => $monthlyFee->unitBillings()->sum('late_fee'),
            'total_interest' => $monthlyFee->unitBillings()->sum('interest'),
            'collection_rate' => $monthlyFee->unitBillings()->count() > 0
                ? ($monthlyFee->unitBillings()->where('status', 'paid')->count() / $monthlyFee->unitBillings()->count()) * 100
                : 0,
        ];

        return response()->json($statistics);
    }
}

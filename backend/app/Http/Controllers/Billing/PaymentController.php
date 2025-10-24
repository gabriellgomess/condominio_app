<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UnitBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Lista todos os pagamentos
     */
    public function index(Request $request)
    {
        $query = Payment::with(['unitBilling.unit', 'unitBilling.monthlyFee.condominium']);

        // Filtro por cobrança
        if ($request->has('unit_billing_id')) {
            $query->where('unit_billing_id', $request->unit_billing_id);
        }

        // Filtro por método de pagamento
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filtro por data de pagamento
        if ($request->has('payment_date')) {
            $query->whereDate('payment_date', $request->payment_date);
        }

        // Filtro por período
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('payment_date', [$request->start_date, $request->end_date]);
        }

        // Filtro por origem
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Filtro por condomínio (via relação)
        if ($request->has('condominium_id')) {
            $query->whereHas('unitBilling.monthlyFee', function ($q) use ($request) {
                $q->where('condominium_id', $request->condominium_id);
            });
        }

        // Ordenação
        $query->orderBy('payment_date', 'desc');

        $payments = $query->paginate(50);

        return response()->json($payments);
    }

    /**
     * Exibe um pagamento específico
     */
    public function show($id)
    {
        $payment = Payment::with(['unitBilling.unit', 'unitBilling.monthlyFee.condominium'])
            ->findOrFail($id);

        return response()->json($payment);
    }

    /**
     * Cria um novo pagamento
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'unit_billing_id' => 'required|exists:unit_billings,id',
            'payment_date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:bank_slip,transfer,pix,credit_card,debit_card,cash,other',
            'reference' => 'nullable|string',
            'bank_reference' => 'nullable|string',
            'source' => 'nullable|in:manual,bank_file,api',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment = Payment::create($request->all());

        return response()->json($payment, 201);
    }

    /**
     * Atualiza um pagamento
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'unit_billing_id' => 'sometimes|required|exists:unit_billings,id',
            'payment_date' => 'sometimes|required|date',
            'amount_paid' => 'sometimes|required|numeric|min:0',
            'payment_method' => 'sometimes|required|in:bank_slip,transfer,pix,credit_card,debit_card,cash,other',
            'reference' => 'nullable|string',
            'bank_reference' => 'nullable|string',
            'source' => 'nullable|in:manual,bank_file,api',
            'notes' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payment->update($request->all());

        return response()->json($payment);
    }

    /**
     * Remove um pagamento
     */
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Pagamento excluído com sucesso']);
    }

    /**
     * Retorna estatísticas de pagamentos por período
     */
    public function statistics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'condominium_id' => 'nullable|exists:condominiums,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $query = Payment::whereBetween('payment_date', [$request->start_date, $request->end_date]);

        if ($request->has('condominium_id')) {
            $query->whereHas('unitBilling.monthlyFee', function ($q) use ($request) {
                $q->where('condominium_id', $request->condominium_id);
            });
        }

        $statistics = [
            'total_payments' => $query->count(),
            'total_amount' => $query->sum('amount_paid'),
            'by_method' => [
                'bank_slip' => $query->clone()->where('payment_method', 'bank_slip')->sum('amount_paid'),
                'transfer' => $query->clone()->where('payment_method', 'transfer')->sum('amount_paid'),
                'pix' => $query->clone()->where('payment_method', 'pix')->sum('amount_paid'),
                'credit_card' => $query->clone()->where('payment_method', 'credit_card')->sum('amount_paid'),
                'debit_card' => $query->clone()->where('payment_method', 'debit_card')->sum('amount_paid'),
                'cash' => $query->clone()->where('payment_method', 'cash')->sum('amount_paid'),
                'other' => $query->clone()->where('payment_method', 'other')->sum('amount_paid'),
            ],
            'by_source' => [
                'manual' => $query->clone()->where('source', 'manual')->sum('amount_paid'),
                'bank_file' => $query->clone()->where('source', 'bank_file')->sum('amount_paid'),
                'api' => $query->clone()->where('source', 'api')->sum('amount_paid'),
            ],
        ];

        return response()->json($statistics);
    }
}

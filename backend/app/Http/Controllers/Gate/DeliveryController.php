<?php

namespace App\Http\Controllers\Gate;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    /**
     * Lista todas as entregas
     */
    public function index(Request $request)
    {
        $query = Delivery::with(['unit', 'receivedByUser', 'deliveredToUser'])
            ->orderBy('created_at', 'desc');

        // Filtrar por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtrar por unidade
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        // Filtrar por tipo
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Buscar por código
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('delivery_code', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%")
                  ->orWhere('sender', 'like', "%{$search}%");
            });
        }

        $deliveries = $query->paginate(20);

        return response()->json($deliveries);
    }

    /**
     * Registra uma nova entrega
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'unit_id' => 'required|exists:units,id',
            'recipient_name' => 'required|string|max:255',
            'type' => 'required|in:package,letter,document,other',
            'sender' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery = Delivery::create([
            'unit_id' => $request->unit_id,
            'recipient_name' => $request->recipient_name,
            'delivery_code' => Delivery::generateUniqueCode(),
            'type' => $request->type,
            'sender' => $request->sender,
            'description' => $request->description,
            'status' => 'pending',
            'received_by' => Auth::id(),
            'received_at' => now(),
            'notes' => $request->notes,
        ]);

        $delivery->load(['unit', 'receivedByUser']);

        return response()->json([
            'message' => 'Entrega registrada com sucesso!',
            'delivery' => $delivery,
        ], 201);
    }

    /**
     * Exibe uma entrega específica
     */
    public function show($id)
    {
        $delivery = Delivery::with(['unit', 'receivedByUser', 'deliveredToUser'])
            ->findOrFail($id);

        return response()->json($delivery);
    }

    /**
     * Busca entrega por código
     */
    public function findByCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery = Delivery::with(['unit', 'receivedByUser', 'deliveredToUser'])
            ->where('delivery_code', strtoupper($request->code))
            ->first();

        if (!$delivery) {
            return response()->json(['message' => 'Código de entrega não encontrado.'], 404);
        }

        return response()->json($delivery);
    }

    /**
     * Registra a retirada de uma entrega
     */
    public function collect(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'delivery_code' => 'required|string|size:8',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery = Delivery::findOrFail($id);

        // Verificar se o código está correto
        if ($delivery->delivery_code !== strtoupper($request->delivery_code)) {
            return response()->json(['message' => 'Código de entrega inválido.'], 400);
        }

        // Verificar se já foi coletada
        if ($delivery->status !== 'pending') {
            return response()->json(['message' => 'Esta entrega já foi coletada ou devolvida.'], 400);
        }

        // Marcar como coletada
        $delivery->markAsCollected(Auth::id());

        // Adicionar notas se fornecidas
        if ($request->filled('notes')) {
            $delivery->update(['notes' => $request->notes]);
        }

        $delivery->load(['unit', 'receivedByUser', 'deliveredToUser']);

        return response()->json([
            'message' => 'Entrega coletada com sucesso!',
            'delivery' => $delivery,
        ]);
    }

    /**
     * Atualiza uma entrega
     */
    public function update(Request $request, $id)
    {
        $delivery = Delivery::findOrFail($id);

        // Não permitir atualizar entregas já coletadas
        if ($delivery->status !== 'pending') {
            return response()->json(['message' => 'Não é possível atualizar entregas já coletadas.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'unit_id' => 'sometimes|exists:units,id',
            'recipient_name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:package,letter,document,other',
            'sender' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $delivery->update($request->only([
            'unit_id',
            'recipient_name',
            'type',
            'sender',
            'description',
            'notes',
        ]));

        $delivery->load(['unit', 'receivedByUser', 'deliveredToUser']);

        return response()->json([
            'message' => 'Entrega atualizada com sucesso!',
            'delivery' => $delivery,
        ]);
    }

    /**
     * Remove uma entrega
     */
    public function destroy($id)
    {
        $delivery = Delivery::findOrFail($id);

        // Não permitir deletar entregas já coletadas
        if ($delivery->status === 'collected') {
            return response()->json(['message' => 'Não é possível deletar entregas já coletadas.'], 400);
        }

        $delivery->delete();

        return response()->json(['message' => 'Entrega removida com sucesso!']);
    }

    /**
     * Lista estatísticas de entregas
     */
    public function stats()
    {
        $stats = [
            'total' => Delivery::count(),
            'pending' => Delivery::where('status', 'pending')->count(),
            'collected' => Delivery::where('status', 'collected')->count(),
            'returned' => Delivery::where('status', 'returned')->count(),
            'today' => Delivery::whereDate('received_at', today())->count(),
            'this_week' => Delivery::whereBetween('received_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => Delivery::whereMonth('received_at', now()->month)->count(),
        ];

        return response()->json($stats);
    }
}

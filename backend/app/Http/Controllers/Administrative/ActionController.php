<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\Action;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ActionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Action::query();

        // Filtrar por tipo
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filtrar por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtrar por prioridade
        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        // Busca por título ou responsável
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('responsible', 'like', '%' . $request->search . '%');
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'end_date');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $actions = $query->get();

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:maintenance_general,maintenance_plumbing,maintenance_electrical,maintenance_painting,maintenance_garden,maintenance_cleaning,maintenance_security,improvement,inspection,other',
            'description' => 'nullable|string',
            'responsible' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'actual_start_date' => 'nullable|date',
            'actual_end_date' => 'nullable|date|after_or_equal:actual_start_date',
            'status' => 'required|in:pending,in_progress,completed,cancelled',
            'priority' => 'required|in:low,medium,high,urgent',
            'estimated_cost' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $action = Action::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Ação criada com sucesso',
            'data' => $action
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $action = Action::find($id);

        if (!$action) {
            return response()->json([
                'success' => false,
                'message' => 'Ação não encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $action
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $action = Action::find($id);

        if (!$action) {
            return response()->json([
                'success' => false,
                'message' => 'Ação não encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:maintenance_general,maintenance_plumbing,maintenance_electrical,maintenance_painting,maintenance_garden,maintenance_cleaning,maintenance_security,improvement,inspection,other',
            'description' => 'nullable|string',
            'responsible' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'actual_start_date' => 'nullable|date',
            'actual_end_date' => 'nullable|date',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'estimated_cost' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $action->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Ação atualizada com sucesso',
            'data' => $action
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $action = Action::find($id);

        if (!$action) {
            return response()->json([
                'success' => false,
                'message' => 'Ação não encontrada'
            ], 404);
        }

        $action->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ação excluída com sucesso'
        ]);
    }

    /**
     * Get overdue actions
     */
    public function overdue()
    {
        $actions = Action::whereNotNull('end_date')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereRaw('end_date < CURDATE()')
            ->orderBy('end_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $total = Action::count();
        $pending = Action::where('status', 'pending')->count();
        $inProgress = Action::where('status', 'in_progress')->count();
        $completed = Action::where('status', 'completed')->count();
        $overdue = Action::whereNotNull('end_date')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereRaw('end_date < CURDATE()')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'in_progress' => $inProgress,
                'completed' => $completed,
                'overdue' => $overdue
            ]
        ]);
    }
}

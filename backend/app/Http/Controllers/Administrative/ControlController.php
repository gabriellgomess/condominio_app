<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\Control;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ControlController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Control::query();

        // Filtrar por tipo de controle
        if ($request->has('control_type') && $request->control_type) {
            $query->where('control_type', $request->control_type);
        }

        // Filtrar por status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Busca por nome
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'validity_date');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Atualizar status de todos os controles antes de retornar
        $controls = $query->get();
        foreach ($controls as $control) {
            $control->updateStatus();
            $control->save();
        }

        return response()->json([
            'success' => true,
            'data' => $controls
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'control_type' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'validity_date' => 'nullable|date',
            'periodicity' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'specifications' => 'nullable',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $control = Control::create($request->all());
        $control->updateStatus();
        $control->save();

        return response()->json([
            'success' => true,
            'message' => 'Controle criado com sucesso',
            'data' => $control
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $control = Control::find($id);

        if (!$control) {
            return response()->json([
                'success' => false,
                'message' => 'Controle não encontrado'
            ], 404);
        }

        $control->updateStatus();
        $control->save();

        return response()->json([
            'success' => true,
            'data' => $control
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $control = Control::find($id);

        if (!$control) {
            return response()->json([
                'success' => false,
                'message' => 'Controle não encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'control_type' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'validity_date' => 'nullable|date',
            'periodicity' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'specifications' => 'nullable',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $control->update($request->all());
        $control->updateStatus();
        $control->save();

        return response()->json([
            'success' => true,
            'message' => 'Controle atualizado com sucesso',
            'data' => $control
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $control = Control::find($id);

        if (!$control) {
            return response()->json([
                'success' => false,
                'message' => 'Controle não encontrado'
            ], 404);
        }

        $control->delete();

        return response()->json([
            'success' => true,
            'message' => 'Controle excluído com sucesso'
        ]);
    }

    /**
     * Get controls expiring soon
     */
    public function expiring(Request $request)
    {
        $days = $request->get('days', 30);

        $controls = Control::whereNotNull('validity_date')
            ->whereRaw('DATEDIFF(validity_date, CURDATE()) <= ?', [$days])
            ->whereRaw('DATEDIFF(validity_date, CURDATE()) >= 0')
            ->orderBy('validity_date', 'asc')
            ->get();

        foreach ($controls as $control) {
            $control->updateStatus();
            $control->save();
        }

        return response()->json([
            'success' => true,
            'data' => $controls
        ]);
    }

    /**
     * Get expired controls
     */
    public function expired()
    {
        $controls = Control::whereNotNull('validity_date')
            ->whereRaw('validity_date < CURDATE()')
            ->orderBy('validity_date', 'desc')
            ->get();

        foreach ($controls as $control) {
            $control->updateStatus();
            $control->save();
        }

        return response()->json([
            'success' => true,
            'data' => $controls
        ]);
    }
}

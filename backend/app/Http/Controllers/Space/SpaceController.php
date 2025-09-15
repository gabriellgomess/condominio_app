<?php

namespace App\Http\Controllers\Space;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, $condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = \App\Models\Condominium::findOrFail($condominium_id);

            $query = \App\Models\Space::where('condominium_id', $condominium_id)
                ->with(['condominium', 'unit']);

            // Filtrar por unidade se fornecido
            if ($request->has('unit_id') && !empty($request->unit_id)) {
                $query->where('unit_id', $request->unit_id);
            }

            // Aplicar filtro de busca se fornecido
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('number', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhere('space_type', 'LIKE', "%{$search}%")
                        ->orWhere('location', 'LIKE', "%{$search}%");
                });
            }

            $spaces = $query->orderBy('number')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Espaços encontrados',
                'data' => $spaces
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar espaços',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = \App\Models\Condominium::findOrFail($condominium_id);

            // Validação dos dados
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'number' => 'required|string|max:50',
                'space_type' => 'required|string|max:50',
                'location' => 'nullable|string|max:100',
                'area' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'status' => 'required|in:available,occupied,reserved,maintenance',
                'description' => 'nullable|string|max:500',
                'climate_controlled' => 'boolean',
                'reservable' => 'boolean',
                'unit_id' => 'nullable|exists:units,id',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar se já existe um espaço com o mesmo número no condomínio
            $existingSpace = \App\Models\Space::where('condominium_id', $condominium_id)
                ->where('number', $request->number)
                ->first();

            if ($existingSpace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe um espaço com este número neste condomínio'
                ], 409);
            }

            // Criar o espaço
            $spaceData = $request->all();
            $spaceData['condominium_id'] = $condominium_id;

            $space = \App\Models\Space::create($spaceData);

            // Carregar relacionamentos
            $space->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Espaço criado com sucesso',
                'data' => $space
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar espaço',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $space = \App\Models\Space::with(['condominium', 'unit'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Espaço encontrado',
                'data' => $space
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Espaço não encontrado',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $space = \App\Models\Space::findOrFail($id);

            // Validação dos dados
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'number' => 'sometimes|required|string|max:50',
                'space_type' => 'sometimes|required|string|max:50',
                'location' => 'nullable|string|max:100',
                'area' => 'nullable|numeric|min:0',
                'height' => 'nullable|numeric|min:0',
                'status' => 'sometimes|required|in:available,occupied,reserved,maintenance',
                'description' => 'nullable|string|max:500',
                'climate_controlled' => 'boolean',
                'reservable' => 'boolean',
                'unit_id' => 'nullable|exists:units,id',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar se já existe outro espaço com o mesmo número no mesmo condomínio
            if ($request->has('number') && $request->number !== $space->number) {
                $existingSpace = \App\Models\Space::where('condominium_id', $space->condominium_id)
                    ->where('number', $request->number)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingSpace) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Já existe outro espaço com este número neste condomínio'
                    ], 409);
                }
            }

            // Atualizar o espaço
            $space->update($request->all());

            // Carregar relacionamentos
            $space->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Espaço atualizado com sucesso',
                'data' => $space
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar espaço',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $space = \App\Models\Space::findOrFail($id);
            $space->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Espaço excluído com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir espaço',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\StorageUnit;

use App\Http\Controllers\Controller;
use App\Models\StorageUnit;
use App\Models\Condominium;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Depósitos",
 *     description="Endpoints para gerenciamento de depósitos"
 * )
 */
class StorageUnitController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/storage-units",
     *     summary="Listar depósitos de um condomínio",
     *     description="Retorna lista de depósitos de um condomínio específico",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="condominium_id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="unit_id",
     *         in="query",
     *         description="Filtrar por unidade",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Termo de busca",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de depósitos",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Depósitos encontrados"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="number", type="string", example="D-01"),
     *                 @OA\Property(property="size", type="string", example="medium"),
     *                 @OA\Property(property="location", type="string", example="subsolo"),
     *                 @OA\Property(property="status", type="string", example="available")
     *             ))
     *         )
     *     )
     * )
     */
    public function index(Request $request, $condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = Condominium::findOrFail($condominium_id);

            $query = StorageUnit::where('condominium_id', $condominium_id)
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
                        ->orWhere('type', 'LIKE', "%{$search}%")
                        ->orWhere('location', 'LIKE', "%{$search}%");
                });
            }

            $storageUnits = $query->orderBy('number')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Depósitos encontrados',
                'data' => $storageUnits
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar depósitos',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums/{condominium_id}/storage-units",
     *     summary="Criar novo depósito",
     *     description="Cria um novo depósito em um condomínio",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="condominium_id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="number", type="string", example="D-01", description="Número do depósito"),
     *             @OA\Property(property="size", type="string", example="medium", description="Tamanho do depósito"),
     *             @OA\Property(property="location", type="string", example="subsolo", description="Localização do depósito"),
     *             @OA\Property(property="unit_id", type="integer", example=1, description="ID da unidade (opcional)"),
     *             @OA\Property(property="description", type="string", example="Depósito no subsolo próximo ao elevador", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status do depósito")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Depósito criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Depósito criado com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request, $condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = Condominium::findOrFail($condominium_id);

            $validator = Validator::make($request->all(), [
                'number' => 'required|string|max:50',
                'type' => 'required|in:storage,box,cellar,attic',
                'location' => 'nullable|string|max:100',
                'area' => 'nullable|numeric|min:1',
                'height' => 'nullable|numeric|min:0.5',
                'unit_id' => 'nullable|exists:units,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,reserved,maintenance',
                'climate_controlled' => 'boolean',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $storageData = $validator->validated();
            $storageData['condominium_id'] = $condominium_id;

            // Verificar se a unidade pertence ao condomínio
            if (isset($storageData['unit_id'])) {
                $unit = Unit::where('id', $storageData['unit_id'])
                    ->where('condominium_id', $condominium_id)
                    ->first();
                if (!$unit) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unidade não pertence ao condomínio especificado'
                    ], 422);
                }
            }

            // Verificar se já existe depósito com o mesmo número no condomínio
            $existingStorageUnit = StorageUnit::where('condominium_id', $condominium_id)
                ->where('number', $storageData['number'])
                ->first();

            if ($existingStorageUnit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe um depósito com este número neste condomínio'
                ], 422);
            }

            $storageUnit = StorageUnit::create($storageData);
            $storageUnit->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Depósito criado com sucesso',
                'data' => $storageUnit
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar depósito',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/storage-units/{id}",
     *     summary="Obter depósito",
     *     description="Retorna detalhes de um depósito específico",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do depósito",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Depósito encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Depósito encontrado"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $storageUnit = StorageUnit::with(['condominium', 'unit'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Depósito encontrado',
                'data' => $storageUnit
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Depósito não encontrado',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/storage-units/{id}",
     *     summary="Atualizar depósito",
     *     description="Atualiza um depósito existente",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do depósito",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="number", type="string", example="D-01", description="Número do depósito"),
     *             @OA\Property(property="size", type="string", example="medium", description="Tamanho do depósito"),
     *             @OA\Property(property="location", type="string", example="subsolo", description="Localização do depósito"),
     *             @OA\Property(property="unit_id", type="integer", example=1, description="ID da unidade (opcional)"),
     *             @OA\Property(property="description", type="string", example="Depósito no subsolo próximo ao elevador", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status do depósito")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Depósito atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Depósito atualizado com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $storageUnit = StorageUnit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'number' => 'required|string|max:50',
                'type' => 'required|in:storage,box,cellar,attic',
                'location' => 'nullable|string|max:100',
                'area' => 'nullable|numeric|min:1',
                'height' => 'nullable|numeric|min:0.5',
                'unit_id' => 'nullable|exists:units,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,reserved,maintenance',
                'climate_controlled' => 'boolean',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $storageData = $validator->validated();

            // Verificar se a unidade pertence ao condomínio
            if (isset($storageData['unit_id'])) {
                $unit = Unit::where('id', $storageData['unit_id'])
                    ->where('condominium_id', $storageUnit->condominium_id)
                    ->first();
                if (!$unit) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unidade não pertence ao condomínio do depósito'
                    ], 422);
                }
            }

            // Verificar se já existe depósito com o mesmo número (exceto o atual)
            $existingStorageUnit = StorageUnit::where('condominium_id', $storageUnit->condominium_id)
                ->where('number', $storageData['number'])
                ->where('id', '!=', $id)
                ->first();

            if ($existingStorageUnit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe um depósito com este número neste condomínio'
                ], 422);
            }

            $storageUnit->update($storageData);
            $storageUnit->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Depósito atualizado com sucesso',
                'data' => $storageUnit
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar depósito',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/storage-units/{id}",
     *     summary="Excluir depósito",
     *     description="Exclui um depósito existente",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do depósito",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Depósito excluído com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Depósito excluído com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $storageUnit = StorageUnit::findOrFail($id);
            $storageUnit->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Depósito excluído com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir depósito',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/storage-units/stats",
     *     summary="Estatísticas dos depósitos",
     *     description="Retorna estatísticas dos depósitos de um condomínio",
     *     tags={"Depósitos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="condominium_id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estatísticas dos depósitos",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Estatísticas dos depósitos"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total", type="integer", example=30),
     *                 @OA\Property(property="available", type="integer", example=8),
     *                 @OA\Property(property="occupied", type="integer", example=20),
     *                 @OA\Property(property="reserved", type="integer", example=1),
     *                 @OA\Property(property="maintenance", type="integer", example=1)
     *             )
     *         )
     *     )
     * )
     */
    public function stats($condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = Condominium::findOrFail($condominium_id);

            $stats = [
                'total' => StorageUnit::where('condominium_id', $condominium_id)->count(),
                'available' => StorageUnit::where('condominium_id', $condominium_id)->where('status', 'available')->count(),
                'occupied' => StorageUnit::where('condominium_id', $condominium_id)->where('status', 'occupied')->count(),
                'reserved' => StorageUnit::where('condominium_id', $condominium_id)->where('status', 'reserved')->count(),
                'maintenance' => StorageUnit::where('condominium_id', $condominium_id)->where('status', 'maintenance')->count(),
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Estatísticas dos depósitos',
                'data' => $stats
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar estatísticas dos depósitos',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

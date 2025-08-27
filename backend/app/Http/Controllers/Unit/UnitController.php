<?php

namespace App\Http\Controllers\Unit;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\Condominium;
use App\Models\Block;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Unidades",
 *     description="Endpoints para gerenciamento de unidades"
 * )
 */
class UnitController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/units",
     *     summary="Listar unidades de um condomínio",
     *     description="Retorna lista de unidades de um condomínio específico",
     *     tags={"Unidades"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="condominium_id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="block_id",
     *         in="query",
     *         description="Filtrar por bloco",
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
     *         description="Lista de unidades",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Unidades encontradas"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="number", type="string", example="101"),
     *                 @OA\Property(property="floor", type="integer", example=1),
     *                 @OA\Property(property="type", type="string", example="apartment"),
     *                 @OA\Property(property="bedrooms", type="integer", example=3),
     *                 @OA\Property(property="bathrooms", type="integer", example=2),
     *                 @OA\Property(property="area", type="number", example=85.5),
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

            $query = Unit::where('condominium_id', $condominium_id)
                ->with(['condominium', 'block']);

            // Filtrar por bloco se fornecido
            if ($request->has('block_id') && !empty($request->block_id)) {
                $query->where('block_id', $request->block_id);
            }

            // Aplicar filtro de busca se fornecido
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('number', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhere('type', 'LIKE', "%{$search}%");
                });
            }

            $units = $query->orderBy('number')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Unidades encontradas',
                'data' => $units
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar unidades',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums/{condominium_id}/units",
     *     summary="Criar nova unidade",
     *     description="Cria uma nova unidade em um condomínio",
     *     tags={"Unidades"},
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
     *             @OA\Property(property="number", type="string", example="101", description="Número da unidade"),
     *             @OA\Property(property="floor", type="integer", example=1, description="Andar"),
     *             @OA\Property(property="type", type="string", example="apartment", description="Tipo da unidade"),
     *             @OA\Property(property="bedrooms", type="integer", example=3, description="Número de quartos"),
     *             @OA\Property(property="bathrooms", type="integer", example=2, description="Número de banheiros"),
     *             @OA\Property(property="area", type="number", example=85.5, description="Área em m²"),
     *             @OA\Property(property="block_id", type="integer", example=1, description="ID do bloco (opcional)"),
     *             @OA\Property(property="description", type="string", example="Apartamento com vista para o mar", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status da unidade")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Unidade criada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Unidade criada com sucesso"),
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
                'floor' => 'required|integer|min:0',
                'type' => 'required|in:apartment,house,commercial,studio,penthouse',
                'bedrooms' => 'nullable|integer|min:0',
                'bathrooms' => 'nullable|integer|min:0',
                'area' => 'nullable|numeric|min:1',
                'block_id' => 'nullable|exists:blocks,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,maintenance,reserved'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $unitData = $validator->validated();
            $unitData['condominium_id'] = $condominium_id;

            // Verificar se o bloco pertence ao condomínio
            if (isset($unitData['block_id'])) {
                $block = Block::where('id', $unitData['block_id'])
                    ->where('condominium_id', $condominium_id)
                    ->first();
                if (!$block) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Bloco não pertence ao condomínio especificado'
                    ], 422);
                }
            }

            // Verificar se já existe unidade com o mesmo número no condomínio/bloco
            $existingUnit = Unit::where('condominium_id', $condominium_id)
                ->where('number', $unitData['number'])
                ->where('block_id', $unitData['block_id'] ?? null)
                ->first();

            if ($existingUnit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma unidade com este número neste bloco/condomínio'
                ], 422);
            }

            $unit = Unit::create($unitData);

            return response()->json([
                'status' => 'success',
                'message' => 'Unidade criada com sucesso',
                'data' => [
                    'id' => $unit->id,
                    'number' => $unit->number,
                    'floor' => $unit->floor,
                    'type' => $unit->type,
                    'bedrooms' => $unit->bedrooms,
                    'bathrooms' => $unit->bathrooms,
                    'area' => $unit->area,
                    'condominium_id' => $unit->condominium_id,
                    'block_id' => $unit->block_id,
                    'description' => $unit->description,
                    'status' => $unit->status,
                    'active' => $unit->active,
                    'created_at' => $unit->created_at,
                    'updated_at' => $unit->updated_at
                ]
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar unidade',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/units/{id}",
     *     summary="Obter unidade",
     *     description="Retorna detalhes de uma unidade específica",
     *     tags={"Unidades"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da unidade",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Unidade encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Unidade encontrada"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $unit = Unit::with(['condominium', 'block', 'parkingSpaces', 'storageUnits'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Unidade encontrada',
                'data' => $unit
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unidade não encontrada',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/units/{id}",
     *     summary="Atualizar unidade",
     *     description="Atualiza uma unidade existente",
     *     tags={"Unidades"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da unidade",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="number", type="string", example="101", description="Número da unidade"),
     *             @OA\Property(property="floor", type="integer", example=1, description="Andar"),
     *             @OA\Property(property="type", type="string", example="apartment", description="Tipo da unidade"),
     *             @OA\Property(property="bedrooms", type="integer", example=3, description="Número de quartos"),
     *             @OA\Property(property="bathrooms", type="integer", example=2, description="Número de banheiros"),
     *             @OA\Property(property="area", type="number", example=85.5, description="Área em m²"),
     *             @OA\Property(property="block_id", type="integer", example=1, description="ID do bloco (opcional)"),
     *             @OA\Property(property="description", type="string", example="Apartamento com vista para o mar", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status da unidade")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Unidade atualizada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Unidade atualizada com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $unit = Unit::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'number' => 'required|string|max:50',
                'floor' => 'required|integer|min:0',
                'type' => 'required|in:apartment,house,commercial,studio,penthouse',
                'bedrooms' => 'required|integer|min:0',
                'bathrooms' => 'required|integer|min:1',
                'area' => 'required|numeric|min:1',
                'block_id' => 'nullable|exists:blocks,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,maintenance,reserved'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $unitData = $validator->validated();

            // Verificar se o bloco pertence ao condomínio
            if (isset($unitData['block_id'])) {
                $block = Block::where('id', $unitData['block_id'])
                    ->where('condominium_id', $unit->condominium_id)
                    ->first();
                if (!$block) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Bloco não pertence ao condomínio da unidade'
                    ], 422);
                }
            }

            // Verificar se já existe unidade com o mesmo número (exceto a atual)
            $existingUnit = Unit::where('condominium_id', $unit->condominium_id)
                ->where('number', $unitData['number'])
                ->where('block_id', $unitData['block_id'] ?? null)
                ->where('id', '!=', $id)
                ->first();

            if ($existingUnit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma unidade com este número neste bloco/condomínio'
                ], 422);
            }

            $unit->update($unitData);
            $unit->load(['condominium', 'block']);

            return response()->json([
                'status' => 'success',
                'message' => 'Unidade atualizada com sucesso',
                'data' => $unit
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar unidade',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/units/{id}",
     *     summary="Excluir unidade",
     *     description="Exclui uma unidade existente",
     *     tags={"Unidades"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da unidade",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Unidade excluída com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Unidade excluída com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $unit = Unit::findOrFail($id);

            // Verificar se há vagas de garagem ou depósitos vinculados
            $hasRelatedItems = $unit->parkingSpaces()->count() > 0 || $unit->storageUnits()->count() > 0;

            if ($hasRelatedItems) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Não é possível excluir a unidade pois há vagas de garagem ou depósitos vinculados a ela'
                ], 422);
            }

            $unit->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Unidade excluída com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir unidade',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\Block;

use App\Http\Controllers\Controller;
use App\Models\Block;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Blocos",
 *     description="Endpoints para gerenciamento de blocos/torres"
 * )
 */
class BlockController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/blocks",
     *     summary="Listar blocos de um condomínio",
     *     description="Retorna lista de blocos de um condomínio específico",
     *     tags={"Blocos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="condominium_id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
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
     *         description="Lista de blocos",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Blocos encontrados"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Bloco A"),
     *                 @OA\Property(property="description", type="string", example="Bloco residencial"),
     *                 @OA\Property(property="floors", type="integer", example=10),
     *                 @OA\Property(property="units_per_floor", type="integer", example=4),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="condominium_id", type="integer", example=1)
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

            $query = Block::where('condominium_id', $condominium_id)
                ->with('condominium');

            // Aplicar filtro de busca se fornecido
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            $blocks = $query->orderBy('name')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Blocos encontrados',
                'data' => $blocks
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar blocos',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums/{condominium_id}/blocks",
     *     summary="Criar novo bloco",
     *     description="Cria um novo bloco em um condomínio",
     *     tags={"Blocos"},
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
     *             @OA\Property(property="name", type="string", example="Bloco A", description="Nome do bloco"),
     *             @OA\Property(property="description", type="string", example="Bloco residencial", description="Descrição"),
     *             @OA\Property(property="floors", type="integer", example=10, description="Número de andares"),
     *             @OA\Property(property="units_per_floor", type="integer", example=4, description="Unidades por andar"),
     *             @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Bloco criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Bloco criado com sucesso"),
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
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'floors' => 'required|integer|min:1',
                'units_per_floor' => 'required|integer|min:1',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $blockData = $validator->validated();
            $blockData['condominium_id'] = $condominium_id;
            $blockData['active'] = $blockData['active'] ?? true;

            $block = Block::create($blockData);

            // Retornar apenas os dados essenciais do bloco
            return response()->json([
                'status' => 'success',
                'message' => 'Bloco criado com sucesso',
                'data' => [
                    'id' => $block->id,
                    'name' => $block->name,
                    'description' => $block->description,
                    'floors' => $block->floors,
                    'units_per_floor' => $block->units_per_floor,
                    'active' => $block->active,
                    'condominium_id' => $block->condominium_id,
                    'created_at' => $block->created_at,
                    'updated_at' => $block->updated_at
                ]
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar bloco',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/blocks/{id}",
     *     summary="Obter bloco",
     *     description="Retorna detalhes de um bloco específico",
     *     tags={"Blocos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do bloco",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bloco encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Bloco encontrado"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $block = Block::with(['condominium', 'units'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Bloco encontrado',
                'data' => $block
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bloco não encontrado',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/blocks/{id}",
     *     summary="Atualizar bloco",
     *     description="Atualiza um bloco existente",
     *     tags={"Blocos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do bloco",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Bloco A", description="Nome do bloco"),
     *             @OA\Property(property="description", type="string", example="Bloco residencial", description="Descrição"),
     *             @OA\Property(property="floors", type="integer", example=10, description="Número de andares"),
     *             @OA\Property(property="units_per_floor", type="integer", example=4, description="Unidades por andar"),
     *             @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bloco atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Bloco atualizado com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $block = Block::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'floors' => 'required|integer|min:1',
                'units_per_floor' => 'required|integer|min:1',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $block->update($validator->validated());

            return response()->json([
                'status' => 'success',
                'message' => 'Bloco atualizado com sucesso',
                'data' => [
                    'id' => $block->id,
                    'name' => $block->name,
                    'description' => $block->description,
                    'floors' => $block->floors,
                    'units_per_floor' => $block->units_per_floor,
                    'active' => $block->active,
                    'condominium_id' => $block->condominium_id,
                    'created_at' => $block->created_at,
                    'updated_at' => $block->updated_at
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar bloco',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/blocks/{id}",
     *     summary="Excluir bloco",
     *     description="Exclui um bloco existente",
     *     tags={"Blocos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do bloco",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bloco excluído com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Bloco excluído com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $block = Block::findOrFail($id);

            // Verificar se há unidades vinculadas
            if ($block->units()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Não é possível excluir o bloco pois há unidades vinculadas a ele'
                ], 422);
            }

            $block->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Bloco excluído com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir bloco',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/blocks/{id}/stats",
     *     summary="Obter estatísticas do bloco",
     *     description="Retorna estatísticas de um bloco específico",
     *     tags={"Blocos"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do bloco",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estatísticas do bloco",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Estatísticas do bloco"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total_units", type="integer", example=40),
     *                 @OA\Property(property="occupied_units", type="integer", example=35),
     *                 @OA\Property(property="available_units", type="integer", example=5),
     *                 @OA\Property(property="maintenance_units", type="integer", example=0)
     *             )
     *         )
     *     )
     * )
     */
    public function stats($id)
    {
        try {
            $block = Block::findOrFail($id);
            $stats = $block->getStats();

            return response()->json([
                'status' => 'success',
                'message' => 'Estatísticas do bloco',
                'data' => $stats
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao obter estatísticas do bloco',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\ParkingSpace;

use App\Http\Controllers\Controller;
use App\Models\ParkingSpace;
use App\Models\Condominium;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Vagas de Garagem",
 *     description="Endpoints para gerenciamento de vagas de garagem"
 * )
 */
class ParkingSpaceController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/parking-spaces",
     *     summary="Listar vagas de garagem de um condomínio",
     *     description="Retorna lista de vagas de garagem de um condomínio específico",
     *     tags={"Vagas de Garagem"},
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
     *         description="Lista de vagas de garagem",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Vagas de garagem encontradas"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="number", type="string", example="G-01"),
     *                 @OA\Property(property="type", type="string", example="covered"),
     *                 @OA\Property(property="size", type="string", example="standard"),
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

            $query = ParkingSpace::where('condominium_id', $condominium_id)
                                 ->with(['condominium', 'unit']);

            // Filtrar por unidade se fornecido
            if ($request->has('unit_id') && !empty($request->unit_id)) {
                $query->where('unit_id', $request->unit_id);
            }

            // Aplicar filtro de busca se fornecido
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('number', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('type', 'LIKE', "%{$search}%")
                      ->orWhere('size', 'LIKE', "%{$search}%");
                });
            }

            $parkingSpaces = $query->orderBy('number')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Vagas de garagem encontradas',
                'data' => $parkingSpaces
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar vagas de garagem',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums/{condominium_id}/parking-spaces",
     *     summary="Criar nova vaga de garagem",
     *     description="Cria uma nova vaga de garagem em um condomínio",
     *     tags={"Vagas de Garagem"},
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
     *             @OA\Property(property="number", type="string", example="G-01", description="Número da vaga"),
     *             @OA\Property(property="type", type="string", example="covered", description="Tipo da vaga"),
     *             @OA\Property(property="size", type="string", example="standard", description="Tamanho da vaga"),
     *             @OA\Property(property="unit_id", type="integer", example=1, description="ID da unidade (opcional)"),
     *             @OA\Property(property="description", type="string", example="Vaga coberta próxima ao elevador", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status da vaga")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Vaga de garagem criada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Vaga de garagem criada com sucesso"),
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
                'type' => 'required|in:covered,uncovered,garage,motorcycle',
                'size' => 'required|in:compact,standard,large,motorcycle',
                'unit_id' => 'nullable|exists:units,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,reserved,maintenance'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $parkingData = $validator->validated();
            $parkingData['condominium_id'] = $condominium_id;

            // Verificar se a unidade pertence ao condomínio
            if (isset($parkingData['unit_id'])) {
                $unit = Unit::where('id', $parkingData['unit_id'])
                           ->where('condominium_id', $condominium_id)
                           ->first();
                if (!$unit) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unidade não pertence ao condomínio especificado'
                    ], 422);
                }
            }

            // Verificar se já existe vaga com o mesmo número no condomínio
            $existingParkingSpace = ParkingSpace::where('condominium_id', $condominium_id)
                                                ->where('number', $parkingData['number'])
                                                ->first();

            if ($existingParkingSpace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma vaga de garagem com este número neste condomínio'
                ], 422);
            }

            $parkingSpace = ParkingSpace::create($parkingData);
            $parkingSpace->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Vaga de garagem criada com sucesso',
                'data' => $parkingSpace
            ], 201);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar vaga de garagem',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/parking-spaces/{id}",
     *     summary="Obter vaga de garagem",
     *     description="Retorna detalhes de uma vaga de garagem específica",
     *     tags={"Vagas de Garagem"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da vaga de garagem",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vaga de garagem encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Vaga de garagem encontrada"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $parkingSpace = ParkingSpace::with(['condominium', 'unit'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Vaga de garagem encontrada',
                'data' => $parkingSpace
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vaga de garagem não encontrada',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/parking-spaces/{id}",
     *     summary="Atualizar vaga de garagem",
     *     description="Atualiza uma vaga de garagem existente",
     *     tags={"Vagas de Garagem"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da vaga de garagem",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="number", type="string", example="G-01", description="Número da vaga"),
     *             @OA\Property(property="type", type="string", example="covered", description="Tipo da vaga"),
     *             @OA\Property(property="size", type="string", example="standard", description="Tamanho da vaga"),
     *             @OA\Property(property="unit_id", type="integer", example=1, description="ID da unidade (opcional)"),
     *             @OA\Property(property="description", type="string", example="Vaga coberta próxima ao elevador", description="Descrição"),
     *             @OA\Property(property="status", type="string", example="available", description="Status da vaga")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vaga de garagem atualizada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Vaga de garagem atualizada com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $parkingSpace = ParkingSpace::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'number' => 'required|string|max:50',
                'type' => 'required|in:covered,uncovered,garage,motorcycle',
                'size' => 'required|in:compact,standard,large,motorcycle',
                'unit_id' => 'nullable|exists:units,id',
                'description' => 'nullable|string',
                'status' => 'required|in:available,occupied,reserved,maintenance'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $parkingData = $validator->validated();

            // Verificar se a unidade pertence ao condomínio
            if (isset($parkingData['unit_id'])) {
                $unit = Unit::where('id', $parkingData['unit_id'])
                           ->where('condominium_id', $parkingSpace->condominium_id)
                           ->first();
                if (!$unit) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Unidade não pertence ao condomínio da vaga de garagem'
                    ], 422);
                }
            }

            // Verificar se já existe vaga com o mesmo número (exceto a atual)
            $existingParkingSpace = ParkingSpace::where('condominium_id', $parkingSpace->condominium_id)
                                                ->where('number', $parkingData['number'])
                                                ->where('id', '!=', $id)
                                                ->first();

            if ($existingParkingSpace) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma vaga de garagem com este número neste condomínio'
                ], 422);
            }

            $parkingSpace->update($parkingData);
            $parkingSpace->load(['condominium', 'unit']);

            return response()->json([
                'status' => 'success',
                'message' => 'Vaga de garagem atualizada com sucesso',
                'data' => $parkingSpace
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar vaga de garagem',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/parking-spaces/{id}",
     *     summary="Excluir vaga de garagem",
     *     description="Exclui uma vaga de garagem existente",
     *     tags={"Vagas de Garagem"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da vaga de garagem",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vaga de garagem excluída com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Vaga de garagem excluída com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $parkingSpace = ParkingSpace::findOrFail($id);
            $parkingSpace->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Vaga de garagem excluída com sucesso'
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir vaga de garagem',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/parking-spaces/stats",
     *     summary="Estatísticas das vagas de garagem",
     *     description="Retorna estatísticas das vagas de garagem de um condomínio",
     *     tags={"Vagas de Garagem"},
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
     *         description="Estatísticas das vagas de garagem",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Estatísticas das vagas de garagem"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="total", type="integer", example=50),
     *                 @OA\Property(property="available", type="integer", example=10),
     *                 @OA\Property(property="occupied", type="integer", example=35),
     *                 @OA\Property(property="reserved", type="integer", example=3),
     *                 @OA\Property(property="maintenance", type="integer", example=2)
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
                'total' => ParkingSpace::where('condominium_id', $condominium_id)->count(),
                'available' => ParkingSpace::where('condominium_id', $condominium_id)->where('status', 'available')->count(),
                'occupied' => ParkingSpace::where('condominium_id', $condominium_id)->where('status', 'occupied')->count(),
                'reserved' => ParkingSpace::where('condominium_id', $condominium_id)->where('status', 'reserved')->count(),
                'maintenance' => ParkingSpace::where('condominium_id', $condominium_id)->where('status', 'maintenance')->count(),
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Estatísticas das vagas de garagem',
                'data' => $stats
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar estatísticas das vagas de garagem',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers\Condominium;

use App\Http\Controllers\Controller;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;



/**
 * @OA\Tag(
 *     name="Condomínios",
 *     description="Endpoints para gerenciamento de condomínios"
 * )
 */
class CondominiumController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums",
     *     summary="Listar condomínios",
     *     description="Retorna lista de condomínios com paginação",
     *     tags={"Condomínios"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número da página",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Itens por página",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Termo de busca",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="city",
     *         in="query",
     *         description="Filtrar por cidade",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="state",
     *         in="query",
     *         description="Filtrar por estado",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de condomínios",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Condomínios listados com sucesso"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Residencial Jardim das Flores"),
     *                 @OA\Property(property="address", type="string", example="Rua das Flores, 123"),
     *                 @OA\Property(property="city", type="string", example="São Paulo"),
     *                 @OA\Property(property="state", type="string", example="SP"),
     *                 @OA\Property(property="zip_code", type="string", example="01234-567"),
     *                 @OA\Property(property="phone", type="string", example="(11) 1234-5678"),
     *                 @OA\Property(property="email", type="string", example="admin@jardimflores.com"),
     *                 @OA\Property(property="description", type="string", example="Condomínio residencial"),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )),
     *             @OA\Property(property="pagination", type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(property="total", type="integer", example=75),
     *                 @OA\Property(property="from", type="integer", example=1),
     *                 @OA\Property(property="to", type="integer", example=15)
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Condominium::query();

            // Filtros
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            }

            if ($request->filled('city')) {
                $query->byCity($request->city);
            }

            if ($request->filled('state')) {
                $query->byState($request->state);
            }

            // Apenas condomínios ativos
            $query->active();

            // Ordenação
            $query->orderBy('name');

            // Paginação
            $perPage = $request->get('per_page', 15);
            $condominiums = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Condomínios listados com sucesso',
                'data' => $condominiums->items(),
                'pagination' => [
                    'current_page' => $condominiums->currentPage(),
                    'last_page' => $condominiums->lastPage(),
                    'per_page' => $condominiums->perPage(),
                    'total' => $condominiums->total(),
                    'from' => $condominiums->firstItem(),
                    'to' => $condominiums->lastItem(),
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao listar condomínios',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums",
     *     summary="Criar condomínio",
     *     description="Cria um novo condomínio",
     *     tags={"Condomínios"},
     *     security={{ "sanctum": {} }},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "address", "city", "state", "zip_code"},
     *             @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
     *             @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
     *             @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
     *             @OA\Property(property="state", type="string", example="SP", description="Estado"),
     *             @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
     *             @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
     *             @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
     *             @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Condomínio criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Condomínio criado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Residencial Jardim das Flores"),
     *                 @OA\Property(property="address", type="string", example="Rua das Flores, 123"),
     *                 @OA\Property(property="city", type="string", example="São Paulo"),
     *                 @OA\Property(property="state", type="string", example="SP"),
     *                 @OA\Property(property="zip_code", type="string", example="01234-567"),
     *                 @OA\Property(property="phone", type="string", example="(11) 1234-5678"),
     *                 @OA\Property(property="email", type="string", example="admin@jardimflores.com"),
     *                 @OA\Property(property="description", type="string", example="Condomínio residencial"),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Erro de validação"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'address' => 'required|string|max:500',
                'city' => 'required|string|max:100',
                'state' => 'required|string|max:2',
                'zip_code' => 'required|string|max:10',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'description' => 'nullable|string|max:1000',
            ], [
                'name.required' => 'O nome do condomínio é obrigatório.',
                'address.required' => 'O endereço é obrigatório.',
                'city.required' => 'A cidade é obrigatória.',
                'state.required' => 'O estado é obrigatório.',
                'zip_code.required' => 'O CEP é obrigatório.',
                'email.email' => 'O e-mail deve ser válido.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $condominium = Condominium::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Condomínio criado com sucesso',
                'data' => $condominium
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar condomínio',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/condominiums/{id}",
     *     summary="Obter condomínio",
     *     description="Retorna detalhes de um condomínio específico",
     *     tags={"Condomínios"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Condomínio encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Condomínio encontrado"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Residencial Jardim das Flores"),
     *                 @OA\Property(property="address", type="string", example="Rua das Flores, 123"),
     *                 @OA\Property(property="city", type="string", example="São Paulo"),
     *                 @OA\Property(property="state", type="string", example="SP"),
     *                 @OA\Property(property="zip_code", type="string", example="01234-567"),
     *                 @OA\Property(property="phone", type="string", example="(11) 1234-5678"),
     *                 @OA\Property(property="email", type="string", example="admin@jardimflores.com"),
     *                 @OA\Property(property="description", type="string", example="Condomínio residencial"),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time"),
     *                 @OA\Property(property="blocks", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="units", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="parking_spaces", type="array", @OA\Items(type="object")),
     *                 @OA\Property(property="storage_units", type="array", @OA\Items(type="object"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Condomínio não encontrado"
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $condominium = Condominium::with(['blocks', 'units', 'parkingSpaces', 'storageUnits'])
                ->find($id);

            if (!$condominium) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Condomínio não encontrado'
                ], 404);
            }

            // Adicionar estatísticas
            $condominium->stats = $condominium->getStats();

            return response()->json([
                'status' => 'success',
                'message' => 'Condomínio encontrado',
                'data' => $condominium
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar condomínio',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/condominiums/{id}",
     *     summary="Atualizar condomínio",
     *     description="Atualiza um condomínio existente",
     *     tags={"Condomínios"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
     *             @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
     *             @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
     *             @OA\Property(property="state", type="string", example="SP", description="Estado"),
     *             @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
     *             @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
     *             @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
     *             @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição"),
     *             @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Condomínio atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Condomínio atualizado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Residencial Jardim das Flores"),
     *                 @OA\Property(property="address", type="string", example="Rua das Flores, 123"),
     *                 @OA\Property(property="city", type="string", example="São Paulo"),
     *                 @OA\Property(property="state", type="string", example="SP"),
     *                 @OA\Property(property="zip_code", type="string", example="01234-567"),
     *                 @OA\Property(property="phone", type="string", example="(11) 1234-5678"),
     *                 @OA\Property(property="email", type="string", example="admin@jardimflores.com"),
     *                 @OA\Property(property="description", type="string", example="Condomínio residencial"),
     *                 @OA\Property(property="active", type="boolean", example=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Condomínio não encontrado"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $condominium = Condominium::find($id);

            if (!$condominium) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Condomínio não encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'address' => 'sometimes|required|string|max:500',
                'city' => 'sometimes|required|string|max:100',
                'state' => 'sometimes|required|string|max:2',
                'zip_code' => 'sometimes|required|string|max:10',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'description' => 'nullable|string|max:1000',
                'active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $condominium->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Condomínio atualizado com sucesso',
                'data' => $condominium
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar condomínio',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/condominiums/{id}",
     *     summary="Excluir condomínio",
     *     description="Exclui um condomínio (soft delete)",
     *     tags={"Condomínios"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID do condomínio",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Condomínio excluído com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Condomínio excluído com sucesso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Condomínio não encontrado"
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $condominium = Condominium::find($id);

            if (!$condominium) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Condomínio não encontrado'
                ], 404);
            }

            // Soft delete - apenas desativar
            $condominium->update(['active' => false]);

            return response()->json([
                'status' => 'success',
                'message' => 'Condomínio excluído com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir condomínio',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

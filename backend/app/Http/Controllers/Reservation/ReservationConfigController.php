<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\ReservationConfig;
use App\Models\Space;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Configurações de Reserva",
 *     description="Endpoints para gerenciamento de configurações de reserva"
 * )
 */
class ReservationConfigController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/reservation-configs",
     *     summary="Listar configurações de reserva de um condomínio",
     *     description="Retorna lista de configurações de reserva de um condomínio específico",
     *     tags={"Configurações de Reserva"},
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
     *         description="Configurações encontradas",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Configurações encontradas"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="space_id", type="integer", example=1),
     *                 @OA\Property(property="available_days", type="array", example={"monday", "tuesday", "wednesday"}),
     *                 @OA\Property(property="start_time", type="string", example="08:00"),
     *                 @OA\Property(property="end_time", type="string", example="22:00"),
     *                 @OA\Property(property="active", type="boolean", example=true)
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

            $query = ReservationConfig::where('condominium_id', $condominium_id)
                ->with(['space', 'condominium']);

            // Filtrar apenas configurações ativas se solicitado
            if ($request->has('active_only') && $request->active_only) {
                $query->where('active', true);
            }

            $configs = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Configurações encontradas',
                'data' => $configs
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar configurações',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/condominiums/{condominium_id}/reservation-configs",
     *     summary="Criar nova configuração de reserva",
     *     description="Cria uma nova configuração de reserva para um espaço",
     *     tags={"Configurações de Reserva"},
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
     *             required={"space_id", "available_days", "start_time", "end_time"},
     *             @OA\Property(property="space_id", type="integer", example=1),
     *             @OA\Property(property="available_days", type="array", example={"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}),
     *             @OA\Property(property="start_time", type="string", example="08:00"),
     *             @OA\Property(property="end_time", type="string", example="22:00"),
     *             @OA\Property(property="duration_minutes", type="integer", example=60),
     *             @OA\Property(property="min_advance_hours", type="integer", example=24),
     *             @OA\Property(property="max_advance_days", type="integer", example=30),
     *             @OA\Property(property="max_reservations_per_day", type="integer", example=5),
     *             @OA\Property(property="max_reservations_per_user_per_month", type="integer", example=2),
     *             @OA\Property(property="hourly_rate", type="number", example=50.00),
     *             @OA\Property(property="daily_rate", type="number", example=200.00),
     *             @OA\Property(property="description", type="string", example="Regras de reserva do salão de festas"),
     *             @OA\Property(property="active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Configuração criada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Configuração criada com sucesso"),
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

            // Validação dos dados
            $validator = Validator::make($request->all(), [
                'space_id' => 'required|exists:spaces,id',
                'available_days' => 'required|array|min:1',
                'available_days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'duration_minutes' => 'nullable|integer|min:15|max:1440',
                'min_advance_hours' => 'nullable|integer|min:1|max:168',
                'max_advance_days' => 'nullable|integer|min:1|max:365',
                'max_reservations_per_day' => 'nullable|integer|min:1',
                'max_reservations_per_user_per_month' => 'nullable|integer|min:1',
                'hourly_rate' => 'nullable|numeric|min:0',
                'daily_rate' => 'nullable|numeric|min:0',
                'description' => 'nullable|string|max:1000',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar se o espaço pertence ao condomínio e é reservável
            $space = Space::where('id', $request->space_id)
                ->where('condominium_id', $condominium_id)
                ->where('reservable', true)
                ->first();

            if (!$space) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Espaço não encontrado ou não é reservável'
                ], 404);
            }

            // Verificar se já existe uma configuração ativa para este espaço
            $existingConfig = ReservationConfig::where('space_id', $request->space_id)
                ->where('condominium_id', $condominium_id)
                ->where('active', true)
                ->first();

            if ($existingConfig) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma configuração ativa para este espaço'
                ], 409);
            }

            // Criar a configuração
            $configData = $request->all();
            $configData['condominium_id'] = $condominium_id;

            $config = ReservationConfig::create($configData);

            // Carregar relacionamentos
            $config->load(['space', 'condominium']);

            return response()->json([
                'status' => 'success',
                'message' => 'Configuração criada com sucesso',
                'data' => $config
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar configuração',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/reservation-configs/{id}",
     *     summary="Obter configuração específica",
     *     description="Retorna dados de uma configuração específica",
     *     tags={"Configurações de Reserva"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da configuração",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Configuração encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Configuração encontrada"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function show(string $id)
    {
        try {
            $config = ReservationConfig::with(['space', 'condominium'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Configuração encontrada',
                'data' => $config
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Configuração não encontrada',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/reservation-configs/{id}",
     *     summary="Atualizar configuração",
     *     description="Atualiza dados de uma configuração",
     *     tags={"Configurações de Reserva"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da configuração",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="available_days", type="array", example={"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}),
     *             @OA\Property(property="start_time", type="string", example="08:00"),
     *             @OA\Property(property="end_time", type="string", example="22:00"),
     *             @OA\Property(property="duration_minutes", type="integer", example=60),
     *             @OA\Property(property="min_advance_hours", type="integer", example=24),
     *             @OA\Property(property="max_advance_days", type="integer", example=30),
     *             @OA\Property(property="max_reservations_per_day", type="integer", example=5),
     *             @OA\Property(property="max_reservations_per_user_per_month", type="integer", example=2),
     *             @OA\Property(property="hourly_rate", type="number", example=50.00),
     *             @OA\Property(property="daily_rate", type="number", example=200.00),
     *             @OA\Property(property="description", type="string", example="Regras de reserva do salão de festas"),
     *             @OA\Property(property="active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Configuração atualizada com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Configuração atualizada com sucesso"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, string $id)
    {
        try {
            $config = ReservationConfig::findOrFail($id);

            // Validação dos dados
            $validator = Validator::make($request->all(), [
                'available_days' => 'sometimes|required|array|min:1',
                'available_days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'duration_minutes' => 'nullable|integer|min:15|max:1440',
                'min_advance_hours' => 'nullable|integer|min:1|max:168',
                'max_advance_days' => 'nullable|integer|min:1|max:365',
                'max_reservations_per_day' => 'nullable|integer|min:1',
                'max_reservations_per_user_per_month' => 'nullable|integer|min:1',
                'hourly_rate' => 'nullable|numeric|min:0',
                'daily_rate' => 'nullable|numeric|min:0',
                'description' => 'nullable|string|max:1000',
                'active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Atualizar a configuração
            $config->update($request->all());

            // Carregar relacionamentos
            $config->load(['space', 'condominium']);

            return response()->json([
                'status' => 'success',
                'message' => 'Configuração atualizada com sucesso',
                'data' => $config
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar configuração',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/reservation-configs/{id}",
     *     summary="Excluir configuração",
     *     description="Exclui uma configuração",
     *     tags={"Configurações de Reserva"},
     *     security={{ "sanctum": {} }},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID da configuração",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Configuração excluída com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Configuração excluída com sucesso")
     *         )
     *     )
     * )
     */
    public function destroy(string $id)
    {
        try {
            $config = ReservationConfig::findOrFail($id);
            $config->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Configuração excluída com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir configuração',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/condominiums/{condominium_id}/reservable-spaces",
     *     summary="Listar espaços reserváveis de um condomínio",
     *     description="Retorna lista de espaços reserváveis que ainda não têm configuração ativa",
     *     tags={"Configurações de Reserva"},
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
     *         description="Espaços reserváveis encontrados",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Espaços reserváveis encontrados"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="number", type="string", example="SF-01"),
     *                 @OA\Property(property="space_type", type="string", example="party_hall"),
     *                 @OA\Property(property="location", type="string", example="área de lazer"),
     *                 @OA\Property(property="reservable", type="boolean", example=true)
     *             ))
     *         )
     *     )
     * )
     */
    public function getReservableSpaces($condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = Condominium::findOrFail($condominium_id);

            // Buscar configurações de reserva ativas com seus espaços
            $configs = ReservationConfig::where('condominium_id', $condominium_id)
                ->where('active', true)
                ->with(['space'])
                ->get();

            \Log::info('getReservableSpaces', [
                'condominium_id' => $condominium_id,
                'configs_count' => $configs->count(),
                'configs' => $configs->map(function ($c) {
                    return [
                        'config_id' => $c->id,
                        'space_id' => $c->space_id,
                        'space_type' => $c->space->space_type ?? null,
                        'space' => $c->space ? $c->space->toArray() : null
                    ];
                })
            ]);

            // Formatar dados para o mobile app
            $formattedSpaces = $configs->map(function ($config) {
                $space = $config->space;

                if (!$space) {
                    \Log::warning('Config sem espaço', ['config_id' => $config->id]);
                    return null;
                }

                return [
                    'id' => $config->id,
                    'space_id' => $space->id,
                    'name' => $space->type_name, // Usa o accessor do model Space
                    'number' => $space->number,
                    'location' => $space->location,
                    'description' => $config->description ?? $space->description,
                    'max_capacity' => $config->max_reservations_per_day ?? 0,
                    'available_days' => $config->available_days,
                    'start_time' => $config->start_time->format('H:i'),
                    'end_time' => $config->end_time->format('H:i'),
                    'duration_minutes' => $config->duration_minutes,
                    'min_advance_hours' => $config->min_advance_hours,
                    'max_advance_days' => $config->max_advance_days,
                    'hourly_rate' => $config->hourly_rate,
                    'daily_rate' => $config->daily_rate,
                ];
            })->filter(); // Remove nulls

            \Log::info('getReservableSpaces - Dados formatados', [
                'formatted_count' => $formattedSpaces->count(),
                'formatted_data' => $formattedSpaces->values()->toArray()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Espaços reserváveis encontrados',
                'data' => $formattedSpaces->values() // Re-index array
            ], 200);
        } catch (\Throwable $th) {
            \Log::error('Erro em getReservableSpaces', [
                'message' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar espaços reserváveis',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

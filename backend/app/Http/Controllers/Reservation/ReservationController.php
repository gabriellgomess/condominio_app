<?php

namespace App\Http\Controllers\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationConfig;
use App\Models\Space;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Reservas",
 *     description="Endpoints para gerenciamento de reservas"
 * )
 */
class ReservationController extends Controller
{
    /**
     * Listar reservas de um condomínio
     */
    public function index(Request $request, $condominium_id)
    {
        try {
            // Verificar se o condomínio existe
            $condominium = Condominium::findOrFail($condominium_id);

            $query = Reservation::where('condominium_id', $condominium_id)
                ->with(['space', 'user', 'unit']);

            // Filtros
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('space_id') && !empty($request->space_id)) {
                $query->where('space_id', $request->space_id);
            }

            if ($request->has('user_id') && !empty($request->user_id)) {
                $query->where('user_id', $request->user_id);
            }

            // Filtro por data
            if ($request->has('start_date') && !empty($request->start_date)) {
                $query->whereDate('reservation_date', '>=', $request->start_date);
            }

            if ($request->has('end_date') && !empty($request->end_date)) {
                $query->whereDate('reservation_date', '<=', $request->end_date);
            }

            // Busca por texto
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('contact_name', 'LIKE', "%{$search}%")
                        ->orWhere('event_type', 'LIKE', "%{$search}%")
                        ->orWhere('event_description', 'LIKE', "%{$search}%");
                });
            }

            $reservations = $query->orderBy('reservation_date', 'desc')
                ->orderBy('start_time', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Reservas encontradas',
                'data' => $reservations
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar reservas',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Criar nova reserva com verificação de conflitos
     */
    public function store(Request $request)
    {
        try {
            // Validação dos dados
            $validator = Validator::make($request->all(), [
                'space_id' => 'required|exists:spaces,id',
                'reservation_date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'contact_name' => 'required|string|max:255',
                'contact_phone' => 'required|string|max:20',
                'contact_email' => 'nullable|email|max:255',
                'event_type' => 'nullable|string|max:255',
                'event_description' => 'nullable|string|max:1000',
                'expected_guests' => 'nullable|integer|min:1',
                'user_notes' => 'nullable|string|max:1000',
                'unit_id' => 'nullable|exists:units,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar espaço e suas configurações
            $space = Space::with('activeReservationConfig')->findOrFail($request->space_id);
            $config = $space->activeReservationConfig;

            if (!$config) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este espaço não está configurado para reservas'
                ], 400);
            }

            // Verificar se o espaço é reservável
            if (!$space->reservable) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este espaço não está disponível para reservas'
                ], 400);
            }

            // Verificar regras de antecedência
            $reservationDate = Carbon::parse($request->reservation_date);
            $now = now();

            $hoursUntilReservation = $now->diffInHours($reservationDate->copy()->setTimeFromTimeString($request->start_time));

            if ($hoursUntilReservation < $config->min_advance_hours) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Reserva deve ser feita com pelo menos {$config->min_advance_hours} horas de antecedência"
                ], 400);
            }

            if ($reservationDate->diffInDays($now) > $config->max_advance_days) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Reserva deve ser feita com no máximo {$config->max_advance_days} dias de antecedência"
                ], 400);
            }

            // Verificar se o dia da semana está disponível
            $dayOfWeek = strtolower($reservationDate->format('l'));
            if (!in_array($dayOfWeek, $config->available_days)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este espaço não está disponível no dia da semana selecionado'
                ], 400);
            }

            // Verificar se o horário está dentro do período permitido
            $startTime = Carbon::createFromFormat('H:i', $request->start_time);
            $endTime = Carbon::createFromFormat('H:i', $request->end_time);
            $configStartTime = Carbon::createFromFormat('H:i', $config->start_time->format('H:i'));
            $configEndTime = Carbon::createFromFormat('H:i', $config->end_time->format('H:i'));

            if ($startTime->lt($configStartTime) || $endTime->gt($configEndTime)) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Horário deve estar entre {$config->start_time->format('H:i')} e {$config->end_time->format('H:i')}"
                ], 400);
            }

            // Verificar duração mínima
            $durationMinutes = $startTime->diffInMinutes($endTime);
            if ($durationMinutes < $config->duration_minutes) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Duração mínima da reserva é de {$config->duration_minutes} minutos"
                ], 400);
            }

            // Verificar conflitos de horário
            $hasConflict = Reservation::hasConflict(
                $request->space_id,
                $request->reservation_date,
                $request->start_time,
                $request->end_time
            );

            if ($hasConflict) {
                $conflicts = Reservation::getConflictingReservations(
                    $request->space_id,
                    $request->reservation_date,
                    $request->start_time,
                    $request->end_time
                );

                return response()->json([
                    'status' => 'error',
                    'message' => 'Já existe uma reserva neste horário',
                    'conflicts' => $conflicts->map(function ($conflict) {
                        return [
                            'id' => $conflict->id,
                            'contact_name' => $conflict->contact_name,
                            'start_time' => $conflict->start_time->format('H:i'),
                            'end_time' => $conflict->end_time->format('H:i'),
                            'status' => $conflict->status_label
                        ];
                    })
                ], 409);
            }

            // Criar a reserva
            $reservationData = $request->all();
            $reservationData['condominium_id'] = $space->condominium_id;
            $reservationData['user_id'] = Auth::id();
            $reservationData['duration_minutes'] = $durationMinutes;
            $reservationData['status'] = Reservation::STATUS_PENDING;

            $reservation = Reservation::create($reservationData);

            // Calcular valor total
            $totalAmount = $reservation->calculateTotalAmount();
            if ($totalAmount > 0) {
                $reservation->update(['total_amount' => $totalAmount]);
            }

            // Carregar relacionamentos
            $reservation->load(['space', 'user', 'unit', 'condominium']);

            return response()->json([
                'status' => 'success',
                'message' => 'Reserva criada com sucesso',
                'data' => $reservation
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar reserva',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Obter reserva específica
     */
    public function show(string $id)
    {
        try {
            $reservation = Reservation::with(['space', 'user', 'unit', 'condominium'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Reserva encontrada',
                'data' => $reservation
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reserva não encontrada',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * Atualizar reserva
     */
    public function update(Request $request, string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);

            // Verificar se o usuário pode editar esta reserva
            if ($reservation->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Você não tem permissão para editar esta reserva'
                ], 403);
            }

            // Verificar se a reserva pode ser editada
            if (!$reservation->canBeCancelled()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Esta reserva não pode mais ser editada'
                ], 400);
            }

            // Atualizar a reserva
            $reservation->update($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Reserva atualizada com sucesso',
                'data' => $reservation
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar reserva',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar reserva
     */
    public function destroy(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);

            // Verificar se o usuário pode cancelar esta reserva
            if ($reservation->user_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Você não tem permissão para cancelar esta reserva'
                ], 403);
            }

            // Verificar se a reserva pode ser cancelada
            if (!$reservation->canBeCancelled()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Esta reserva não pode mais ser cancelada'
                ], 400);
            }

            // Cancelar a reserva
            $reservation->cancel('Cancelada pelo usuário');

            return response()->json([
                'status' => 'success',
                'message' => 'Reserva cancelada com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao cancelar reserva',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar disponibilidade de um espaço
     */
    public function checkAvailability(Request $request, $space_id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data é obrigatória',
                    'errors' => $validator->errors()
                ], 422);
            }

            $space = Space::with('activeReservationConfig')->findOrFail($space_id);
            $config = $space->activeReservationConfig;

            \Log::info('CheckAvailability', [
                'space_id' => $space_id,
                'space' => $space->toArray(),
                'config' => $config ? $config->toArray() : null
            ]);

            if (!$config) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este espaço não está configurado para reservas',
                    'debug' => [
                        'space_id' => $space_id,
                        'space_reservable' => $space->reservable,
                        'has_any_config' => $space->reservationConfigs()->count(),
                        'has_active_config' => $space->reservationConfigs()->where('active', true)->count()
                    ]
                ], 400);
            }

            $date = Carbon::parse($request->date);
            $dayOfWeek = strtolower($date->format('l'));

            // Verificar se o dia está disponível
            if (!in_array($dayOfWeek, $config->available_days)) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Espaço não disponível neste dia',
                    'data' => [
                        'available' => false,
                        'reason' => 'Dia da semana não disponível'
                    ]
                ], 200);
            }

            // Buscar reservas existentes nesta data
            $existingReservations = Reservation::where('space_id', $space_id)
                ->whereDate('reservation_date', $request->date)
                ->whereIn('status', [Reservation::STATUS_PENDING, Reservation::STATUS_CONFIRMED])
                ->orderBy('start_time')
                ->get(['start_time', 'end_time', 'contact_name', 'status']);

            return response()->json([
                'status' => 'success',
                'message' => 'Disponibilidade verificada',
                'data' => [
                    'available' => true,
                    'config' => [
                        'start_time' => $config->start_time->format('H:i'),
                        'end_time' => $config->end_time->format('H:i'),
                        'duration_minutes' => $config->duration_minutes,
                        'hourly_rate' => $config->hourly_rate,
                        'daily_rate' => $config->daily_rate
                    ],
                    'existing_reservations' => $existingReservations->map(function ($reservation) {
                        return [
                            'start_time' => $reservation->start_time->format('H:i'),
                            'end_time' => $reservation->end_time->format('H:i'),
                            'contact_name' => $reservation->contact_name,
                            'status' => $reservation->status
                        ];
                    })
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao verificar disponibilidade',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmar reserva (apenas administradores)
     */
    public function confirm(string $id)
    {
        try {
            $reservation = Reservation::findOrFail($id);

            if (!$reservation->canBeConfirmed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Esta reserva não pode ser confirmada'
                ], 400);
            }

            $reservation->confirm();

            return response()->json([
                'status' => 'success',
                'message' => 'Reserva confirmada com sucesso',
                'data' => $reservation
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao confirmar reserva',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Obter configurações de disponibilidade para um espaço
     */
    public function getAvailabilityConfig(Request $request, $spaceId)
    {
        try {
            $space = Space::findOrFail($spaceId);
            
            // Buscar configuração ativa para o espaço
            $config = ReservationConfig::where('space_id', $spaceId)
                ->where('active', true)
                ->first();

            if (!$config) {
                // Retornar configuração padrão se não houver configuração específica
                $config = ReservationConfig::getDefaultConfig($spaceId, $space->condominium_id);
            } else {
                $config = $config->toArray();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Configuração de disponibilidade obtida',
                'data' => $config
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao obter configuração de disponibilidade',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

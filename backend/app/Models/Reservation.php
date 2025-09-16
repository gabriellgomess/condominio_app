<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Reservation extends Model
{
    use HasFactory;

    protected $table = 'reservations';

    // Status da reserva
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_REJECTED = 'rejected';

    // Status de pagamento
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_PARTIAL = 'partial';
    const PAYMENT_REFUNDED = 'refunded';

    protected $fillable = [
        'space_id',
        'condominium_id',
        'user_id',
        'unit_id',
        'reservation_date',
        'start_time',
        'end_time',
        'duration_minutes',
        'contact_name',
        'contact_phone',
        'contact_email',
        'event_type',
        'event_description',
        'expected_guests',
        'status',
        'total_amount',
        'paid_amount',
        'payment_status',
        'user_notes',
        'admin_notes',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
        'active'
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'expected_guests' => 'integer',
        'duration_minutes' => 'integer',
        'active' => 'boolean',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Relacionamento com espaço
     */
    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    /**
     * Relacionamento com condomínio
     */
    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    /**
     * Relacionamento com usuário
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento com unidade
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    public function scopeBySpace($query, $spaceId)
    {
        return $query->where('space_id', $spaceId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('reservation_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('reservation_date', [$startDate, $endDate]);
    }

    /**
     * Accessors
     */
    public function getStatusLabelAttribute()
    {
        $labels = [
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_CONFIRMED => 'Confirmada',
            self::STATUS_CANCELLED => 'Cancelada',
            self::STATUS_COMPLETED => 'Concluída',
            self::STATUS_REJECTED => 'Rejeitada',
        ];

        return $labels[$this->status] ?? $this->status;
    }

    public function getPaymentStatusLabelAttribute()
    {
        $labels = [
            self::PAYMENT_PENDING => 'Pendente',
            self::PAYMENT_PAID => 'Pago',
            self::PAYMENT_PARTIAL => 'Parcial',
            self::PAYMENT_REFUNDED => 'Reembolsado',
        ];

        return $labels[$this->payment_status] ?? $this->payment_status;
    }

    public function getFormattedDateAttribute()
    {
        return $this->reservation_date->format('d/m/Y');
    }

    public function getFormattedTimeRangeAttribute()
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    public function getDurationHoursAttribute()
    {
        return round($this->duration_minutes / 60, 1);
    }

    /**
     * Métodos de verificação
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isConfirmed()
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function isCancelled()
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function canBeCancelled()
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED])
            && $this->reservation_date->isFuture();
    }

    public function canBeConfirmed()
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verificar conflitos de horário
     */
    public static function hasConflict($spaceId, $date, $startTime, $endTime, $excludeId = null)
    {
        $query = self::where('space_id', $spaceId)
            ->whereDate('reservation_date', $date)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED])
            ->where(function ($q) use ($startTime, $endTime) {
                // Verifica se há sobreposição de horários
                $q->where(function ($subQ) use ($startTime, $endTime) {
                    // Novo horário começa antes do existente terminar E termina depois do existente começar
                    $subQ->where('start_time', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Obter reservas conflitantes
     */
    public static function getConflictingReservations($spaceId, $date, $startTime, $endTime, $excludeId = null)
    {
        $query = self::where('space_id', $spaceId)
            ->whereDate('reservation_date', $date)
            ->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            })
            ->with(['user', 'space']);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->get();
    }

    /**
     * Calcular valor total baseado na configuração do espaço
     */
    public function calculateTotalAmount()
    {
        $config = $this->space->activeReservationConfig;

        if (!$config) {
            return 0;
        }

        $amount = 0;

        // Calcular baseado na taxa por hora
        if ($config->hourly_rate) {
            $hours = $this->duration_minutes / 60;
            $amount = $config->hourly_rate * $hours;
        }
        // Ou baseado na taxa por dia (se for reserva de dia inteiro)
        elseif ($config->daily_rate && $this->duration_minutes >= 480) { // 8+ horas
            $amount = $config->daily_rate;
        }

        return $amount;
    }

    /**
     * Métodos de ação
     */
    public function confirm()
    {
        $this->update([
            'status' => self::STATUS_CONFIRMED,
            'confirmed_at' => now()
        ]);
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason
        ]);
    }

    public function complete()
    {
        $this->update([
            'status' => self::STATUS_COMPLETED
        ]);
    }

    public function reject($reason = null)
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'admin_notes' => $reason
        ]);
    }

    /**
     * Obter estatísticas de reservas
     */
    public static function getStats($condominiumId = null)
    {
        $query = self::query();

        if ($condominiumId) {
            $query->where('condominium_id', $condominiumId);
        }

        return [
            'total' => $query->count(),
            'pending' => (clone $query)->where('status', self::STATUS_PENDING)->count(),
            'confirmed' => (clone $query)->where('status', self::STATUS_CONFIRMED)->count(),
            'cancelled' => (clone $query)->where('status', self::STATUS_CANCELLED)->count(),
            'completed' => (clone $query)->where('status', self::STATUS_COMPLETED)->count(),
            'this_month' => (clone $query)->whereMonth('reservation_date', now()->month)->count(),
            'next_month' => (clone $query)->whereMonth('reservation_date', now()->addMonth()->month)->count(),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationConfig extends Model
{
    use HasFactory;

    protected $table = 'reservation_configs';

    protected $fillable = [
        'space_id',
        'condominium_id',
        'available_days',
        'start_time',
        'end_time',
        'duration_minutes',
        'min_advance_hours',
        'max_advance_days',
        'max_reservations_per_day',
        'max_reservations_per_user_per_month',
        'hourly_rate',
        'daily_rate',
        'active',
        'description'
    ];

    protected $casts = [
        'available_days' => 'array',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'hourly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'active' => 'boolean',
        'duration_minutes' => 'integer',
        'min_advance_hours' => 'integer',
        'max_advance_days' => 'integer',
        'max_reservations_per_day' => 'integer',
        'max_reservations_per_user_per_month' => 'integer',
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
     * Scope para configurações ativas
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para configurações de um condomínio
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope para configurações de um espaço
     */
    public function scopeBySpace($query, $spaceId)
    {
        return $query->where('space_id', $spaceId);
    }

    /**
     * Obter dias disponíveis formatados
     */
    public function getAvailableDaysFormattedAttribute()
    {
        $daysMap = [
            'monday' => 'Segunda-feira',
            'tuesday' => 'Terça-feira',
            'wednesday' => 'Quarta-feira',
            'thursday' => 'Quinta-feira',
            'friday' => 'Sexta-feira',
            'saturday' => 'Sábado',
            'sunday' => 'Domingo'
        ];

        return collect($this->available_days)->map(function ($day) use ($daysMap) {
            return $daysMap[$day] ?? $day;
        })->toArray();
    }

    /**
     * Obter horário formatado
     */
    public function getTimeRangeFormattedAttribute()
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }

    /**
     * Verificar se um dia da semana está disponível
     */
    public function isDayAvailable($dayOfWeek)
    {
        return in_array(strtolower($dayOfWeek), $this->available_days);
    }

    /**
     * Verificar se um horário está dentro do período disponível
     */
    public function isTimeAvailable($time)
    {
        $time = is_string($time) ? \Carbon\Carbon::createFromFormat('H:i', $time) : $time;
        return $time->between($this->start_time, $this->end_time);
    }

    /**
     * Obter configuração padrão para um espaço
     */
    public static function getDefaultConfig($spaceId, $condominiumId)
    {
        return [
            'space_id' => $spaceId,
            'condominium_id' => $condominiumId,
            'available_days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            'start_time' => '08:00',
            'end_time' => '22:00',
            'duration_minutes' => 60,
            'min_advance_hours' => 24,
            'max_advance_days' => 30,
            'max_reservations_per_day' => null,
            'max_reservations_per_user_per_month' => null,
            'hourly_rate' => null,
            'daily_rate' => null,
            'active' => true,
            'description' => null
        ];
    }
}

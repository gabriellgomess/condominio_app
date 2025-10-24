<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'recipient_name',
        'delivery_code',
        'type',
        'sender',
        'description',
        'status',
        'received_by',
        'received_at',
        'delivered_to',
        'collected_at',
        'notes',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'collected_at' => 'datetime',
    ];

    /**
     * Gera um código único para a entrega
     */
    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (self::where('delivery_code', $code)->exists());

        return $code;
    }

    /**
     * Relacionamento com unidade
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Relacionamento com usuário que recebeu
     */
    public function receivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Relacionamento com usuário que retirou
     */
    public function deliveredToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivered_to');
    }

    /**
     * Scope para entregas pendentes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para entregas coletadas
     */
    public function scopeCollected($query)
    {
        return $query->where('status', 'collected');
    }

    /**
     * Scope para buscar por unidade
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope para buscar por código
     */
    public function scopeByCode($query, $code)
    {
        return $query->where('delivery_code', $code);
    }

    /**
     * Marca a entrega como coletada
     */
    public function markAsCollected($userId): void
    {
        $this->update([
            'status' => 'collected',
            'delivered_to' => $userId,
            'collected_at' => now(),
        ]);
    }
}

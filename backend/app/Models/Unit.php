<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'units';

    protected $fillable = [
        'condominium_id',
        'block_id',
        'number',
        'type',
        'floor',
        'area',
        'bedrooms',
        'bathrooms',
        'status',
        'description',
        'active'
    ];

    protected $casts = [
        'floor' => 'integer',
        'area' => 'decimal:2',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'active' => 'boolean',
    ];

    /**
     * Relacionamento com condomínio
     */
    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    /**
     * Relacionamento com bloco
     */
    public function block(): BelongsTo
    {
        return $this->belongsTo(Block::class);
    }

    /**
     * Relacionamento com vagas de garagem
     */
    public function parkingSpaces(): HasMany
    {
        return $this->hasMany(ParkingSpace::class);
    }

    /**
     * Relacionamento com depósitos/box
     */
    public function spaces(): HasMany
    {
        return $this->hasMany(Space::class);
    }

    /**
     * Scope para unidades ativas
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para buscar por condomínio
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope para buscar por bloco
     */
    public function scopeByBlock($query, $blockId)
    {
        return $query->where('block_id', $blockId);
    }

    /**
     * Scope para buscar por status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para buscar por tipo
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Obter estatísticas da unidade
     */
    public function getStats()
    {
        return [
            'parking_spaces' => $this->parkingSpaces()->count(),
            'spaces' => $this->spaces()->count(),
            'total_area' => $this->area,
        ];
    }
}

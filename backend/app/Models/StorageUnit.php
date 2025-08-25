<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageUnit extends Model
{
    use HasFactory;

    protected $table = 'storage_units';

    protected $fillable = [
        'condominium_id',
        'unit_id',
        'number',
        'type',
        'location',
        'area',
        'height',
        'status',
        'description',
        'climate_controlled',
        'active'
    ];

    protected $casts = [
        'area' => 'decimal:2',
        'height' => 'decimal:2',
        'climate_controlled' => 'boolean',
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
     * Relacionamento com unidade
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Scope para depósitos ativos
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
     * Scope para buscar por unidade
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
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
     * Scope para depósitos disponíveis
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope para depósitos ocupados
     */
    public function scopeOccupied($query)
    {
        return $query->where('status', 'occupied');
    }

    /**
     * Scope para depósitos com controle climático
     */
    public function scopeClimateControlled($query)
    {
        return $query->where('climate_controlled', true);
    }
}

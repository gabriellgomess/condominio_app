<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Block extends Model
{
    use HasFactory;

    protected $table = 'blocks';

    protected $fillable = [
        'condominium_id',
        'name',
        'description',
        'floors',
        'units_per_floor',
        'active'
    ];

    protected $casts = [
        'floors' => 'integer',
        'units_per_floor' => 'integer',
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
     * Relacionamento com unidades
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    /**
     * Scope para blocos ativos
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
     * Obter estatísticas do bloco
     */
    public function getStats()
    {
        return [
            'total_units' => $this->units()->count(),
            'occupied_units' => $this->units()->where('status', 'occupied')->count(),
            'available_units' => $this->units()->where('status', 'available')->count(),
            'maintenance_units' => $this->units()->where('status', 'maintenance')->count(),
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Condominium extends Model
{
    use HasFactory;

    protected $table = 'condominiums';

    protected $fillable = [
        'name',
        'address',
        'number',
        'district',
        'city',
        'state',
        'zip_code',
        'phone',
        'email',
        'description',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Relacionamento com blocos
     */
    public function blocks(): HasMany
    {
        return $this->hasMany(Block::class);
    }

    /**
     * Relacionamento com unidades
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }

    /**
     * Relacionamento com vagas de garagem
     */
    public function parkingSpaces(): HasMany
    {
        return $this->hasMany(ParkingSpace::class);
    }

    /**
     * Relacionamento com espaços
     */
    public function spaces(): HasMany
    {
        return $this->hasMany(Space::class);
    }

    /**
     * Scope para condomínios ativos
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para buscar por cidade
     */
    public function scopeByCity($query, $city)
    {
        return $query->where('city', 'like', "%{$city}%");
    }

    /**
     * Scope para buscar por estado
     */
    public function scopeByState($query, $state)
    {
        return $query->where('state', 'like', "%{$state}%");
    }

    /**
     * Obter estatísticas do condomínio
     */
    public function getStats()
    {
        return [
            'total_blocks' => $this->blocks()->count(),
            'total_units' => $this->units()->count(),
            'total_parking_spaces' => $this->parkingSpaces()->count(),
            'total_spaces' => $this->spaces()->count(),
            'occupied_units' => $this->units()->where('status', 'occupied')->count(),
            'available_units' => $this->units()->where('status', 'available')->count(),
        ];
    }
}

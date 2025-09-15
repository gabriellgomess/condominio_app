<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Space extends Model
{
    use HasFactory;

    protected $table = 'spaces';

    protected $fillable = [
        'condominium_id',
        'unit_id',
        'number',
        'space_type',
        'location',
        'area',
        'height',
        'status',
        'description',
        'climate_controlled',
        'reservable',
        'active'
    ];

    protected $casts = [
        'area' => 'decimal:2',
        'height' => 'decimal:2',
        'climate_controlled' => 'boolean',
        'reservable' => 'boolean',
        'active' => 'boolean',
    ];

    // Constantes para tipos de espaço
    const TYPE_STORAGE = 'storage';
    const TYPE_BOX = 'box';
    const TYPE_CELLAR = 'cellar';
    const TYPE_ATTIC = 'attic';
    const TYPE_GAS_DEPOT = 'gas_depot';
    const TYPE_TRASH_DEPOT = 'trash_depot';
    const TYPE_GYM = 'gym';
    const TYPE_PARTY_HALL = 'party_hall';
    const TYPE_MEETING_ROOM = 'meeting_room';
    const TYPE_LAUNDRY = 'laundry';
    const TYPE_OTHER = 'other';

    // Constantes para status
    const STATUS_AVAILABLE = 'available';
    const STATUS_OCCUPIED = 'occupied';
    const STATUS_RESERVED = 'reserved';
    const STATUS_MAINTENANCE = 'maintenance';

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
     * Relacionamento com reservas (se implementado)
     */
    public function reservations()
    {
        return $this->hasMany(SpaceReservation::class);
    }

    /**
     * Scope para espaços ativos
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
        return $query->where('space_type', $type);
    }

    /**
     * Scope para espaços disponíveis
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE);
    }

    /**
     * Scope para espaços reserváveis
     */
    public function scopeReservable($query)
    {
        return $query->where('reservable', true);
    }

    /**
     * Accessor para nome do tipo
     */
    public function getTypeNameAttribute()
    {
        $types = [
            self::TYPE_STORAGE => 'Depósito',
            self::TYPE_BOX => 'Box',
            self::TYPE_CELLAR => 'Adega',
            self::TYPE_ATTIC => 'Sótão',
            self::TYPE_GAS_DEPOT => 'Depósito de Gás',
            self::TYPE_TRASH_DEPOT => 'Depósito de Lixo',
            self::TYPE_GYM => 'Academia',
            self::TYPE_PARTY_HALL => 'Salão de Festas',
            self::TYPE_MEETING_ROOM => 'Sala de Reuniões',
            self::TYPE_LAUNDRY => 'Lavanderia',
            self::TYPE_OTHER => 'Outros'
        ];

        return $types[$this->space_type] ?? 'Desconhecido';
    }

    /**
     * Accessor para nome do status
     */
    public function getStatusNameAttribute()
    {
        $statuses = [
            self::STATUS_AVAILABLE => 'Disponível',
            self::STATUS_OCCUPIED => 'Ocupado',
            self::STATUS_RESERVED => 'Reservado',
            self::STATUS_MAINTENANCE => 'Manutenção'
        ];

        return $statuses[$this->status] ?? 'Desconhecido';
    }

    /**
     * Obter todos os tipos disponíveis
     */
    public static function getTypes()
    {
        return [
            self::TYPE_STORAGE => 'Depósito',
            self::TYPE_BOX => 'Box',
            self::TYPE_CELLAR => 'Adega',
            self::TYPE_ATTIC => 'Sótão',
            self::TYPE_GAS_DEPOT => 'Depósito de Gás',
            self::TYPE_TRASH_DEPOT => 'Depósito de Lixo',
            self::TYPE_GYM => 'Academia',
            self::TYPE_PARTY_HALL => 'Salão de Festas',
            self::TYPE_MEETING_ROOM => 'Sala de Reuniões',
            self::TYPE_LAUNDRY => 'Lavanderia',
            self::TYPE_OTHER => 'Outros'
        ];
    }

    /**
     * Obter todos os status disponíveis
     */
    public static function getStatuses()
    {
        return [
            self::STATUS_AVAILABLE => 'Disponível',
            self::STATUS_OCCUPIED => 'Ocupado',
            self::STATUS_RESERVED => 'Reservado',
            self::STATUS_MAINTENANCE => 'Manutenção'
        ];
    }

    /**
     * Verificar se o espaço pode ser reservado
     */
    public function canBeReserved()
    {
        return $this->reservable && $this->status === self::STATUS_AVAILABLE;
    }

    /**
     * Verificar se o espaço está disponível
     */
    public function isAvailable()
    {
        return $this->status === self::STATUS_AVAILABLE;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visitor extends Model
{
    use HasFactory;

    protected $table = 'visitors';

    protected $fillable = [
        'condominium_id',
        'unit_id',
        'resident_id',
        'name',
        'document_type',
        'document_number',
        'phone',
        'document_photo_front',
        'document_photo_back',
        'vehicle_plate',
        'vehicle_model',
        'vehicle_color',
        'visitor_type',
        'purpose',
        'scheduled_date',
        'scheduled_time',
        'entry_date',
        'entry_time',
        'exit_date',
        'exit_time',
        'status',
        'notes',
        'authorized_by',
        'validated_by',
        'validated_at',
        'active',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'entry_date' => 'datetime',
        'exit_date' => 'datetime',
        'validated_at' => 'datetime',
        'active' => 'boolean',
    ];

    // Constantes para tipos de visitante
    const TYPE_PERSONAL = 'personal';        // Visitante pessoal
    const TYPE_SERVICE = 'service';          // Prestador de serviço
    const TYPE_DELIVERY = 'delivery';        // Entregador
    const TYPE_TAXI = 'taxi';                // Taxi/App
    const TYPE_OTHER = 'other';              // Outro

    // Constantes para tipos de documento
    const DOC_RG = 'rg';
    const DOC_CPF = 'cpf';
    const DOC_CNH = 'cnh';
    const DOC_OTHER = 'other';

    // Constantes para status
    const STATUS_PENDING = 'pending';        // Aguardando validação
    const STATUS_SCHEDULED = 'scheduled';    // Agendado e validado
    const STATUS_CHECKED_IN = 'checked_in';  // Visitante na portaria (entrada registrada)
    const STATUS_CHECKED_OUT = 'checked_out'; // Saída registrada
    const STATUS_CANCELLED = 'cancelled';    // Cancelado
    const STATUS_REJECTED = 'rejected';      // Rejeitado

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
     * Relacionamento com morador (quem cadastrou)
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Relacionamento com usuário que autorizou
     */
    public function authorizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorized_by');
    }

    /**
     * Relacionamento com usuário que validou (síndico/admin)
     */
    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Scope para visitantes ativos
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para visitantes por condomínio
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope para visitantes por status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para visitantes pendentes de validação
     */
    public function scopePendingValidation($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope para visitantes agendados
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Scope para visitantes que estão no condomínio (checked in)
     */
    public function scopeCheckedIn($query)
    {
        return $query->where('status', self::STATUS_CHECKED_IN);
    }

    /**
     * Accessor para nome do tipo de visitante
     */
    public function getVisitorTypeNameAttribute()
    {
        $types = [
            self::TYPE_PERSONAL => 'Visitante',
            self::TYPE_SERVICE => 'Prestador de Serviço',
            self::TYPE_DELIVERY => 'Entregador',
            self::TYPE_TAXI => 'Taxi/App',
            self::TYPE_OTHER => 'Outro',
        ];

        return $types[$this->visitor_type] ?? 'Desconhecido';
    }

    /**
     * Accessor para nome do status
     */
    public function getStatusNameAttribute()
    {
        $statuses = [
            self::STATUS_PENDING => 'Aguardando Validação',
            self::STATUS_SCHEDULED => 'Agendado',
            self::STATUS_CHECKED_IN => 'No Condomínio',
            self::STATUS_CHECKED_OUT => 'Saiu',
            self::STATUS_CANCELLED => 'Cancelado',
            self::STATUS_REJECTED => 'Rejeitado',
        ];

        return $statuses[$this->status] ?? 'Desconhecido';
    }

    /**
     * Obter todos os tipos de visitante disponíveis
     */
    public static function getVisitorTypes()
    {
        return [
            self::TYPE_PERSONAL => 'Visitante',
            self::TYPE_SERVICE => 'Prestador de Serviço',
            self::TYPE_DELIVERY => 'Entregador',
            self::TYPE_TAXI => 'Taxi/App',
            self::TYPE_OTHER => 'Outro',
        ];
    }

    /**
     * Obter todos os status disponíveis
     */
    public static function getStatuses()
    {
        return [
            self::STATUS_PENDING => 'Aguardando Validação',
            self::STATUS_SCHEDULED => 'Agendado',
            self::STATUS_CHECKED_IN => 'No Condomínio',
            self::STATUS_CHECKED_OUT => 'Saiu',
            self::STATUS_CANCELLED => 'Cancelado',
            self::STATUS_REJECTED => 'Rejeitado',
        ];
    }

    /**
     * Verificar se visitante pode fazer check-in
     */
    public function canCheckIn()
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Verificar se visitante pode fazer check-out
     */
    public function canCheckOut()
    {
        return $this->status === self::STATUS_CHECKED_IN;
    }
}

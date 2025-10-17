<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'condominium_id',
        'user_id',
        'title',
        'content',
        'priority',
        'status',
        'target_type',
        'target_ids',
        'published_at',
        'expires_at',
        'send_email',
        'send_notification',
        'attachments',
        'notes',
        'active'
    ];

    protected $casts = [
        'target_ids' => 'array',
        'attachments' => 'array',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'send_email' => 'boolean',
        'send_notification' => 'boolean',
        'active' => 'boolean',
    ];

    // Status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_ARCHIVED = 'archived';

    // Priority constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    // Target type constants
    const TARGET_ALL = 'all';
    const TARGET_BLOCK = 'block';
    const TARGET_UNIT = 'unit';
    const TARGET_SPECIFIC = 'specific';

    /**
     * Relacionamento com condomínio
     */
    public function condominium(): BelongsTo
    {
        return $this->belongsTo(Condominium::class);
    }

    /**
     * Relacionamento com usuário (autor)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para comunicados publicados
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope para comunicados ativos
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope para comunicados não expirados
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Scope para buscar por condomínio
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope para buscar por prioridade
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Verifica se o comunicado está expirado
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Verifica se o comunicado está publicado
     */
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    /**
     * Verifica se o comunicado é um rascunho
     */
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Verifica se o comunicado está arquivado
     */
    public function isArchived(): bool
    {
        return $this->status === self::STATUS_ARCHIVED;
    }

    /**
     * Retorna o badge de status formatado
     */
    public function getStatusBadgeAttribute(): string
    {
        $statuses = [
            self::STATUS_DRAFT => 'Rascunho',
            self::STATUS_PUBLISHED => 'Publicado',
            self::STATUS_ARCHIVED => 'Arquivado'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Retorna o badge de prioridade formatado
     */
    public function getPriorityBadgeAttribute(): string
    {
        $priorities = [
            self::PRIORITY_LOW => 'Baixa',
            self::PRIORITY_NORMAL => 'Normal',
            self::PRIORITY_HIGH => 'Alta',
            self::PRIORITY_URGENT => 'Urgente'
        ];

        return $priorities[$this->priority] ?? $this->priority;
    }

    /**
     * Retorna o tipo de destinatário formatado
     */
    public function getTargetTypeFormattedAttribute(): string
    {
        $types = [
            self::TARGET_ALL => 'Todos os moradores',
            self::TARGET_BLOCK => 'Bloco específico',
            self::TARGET_UNIT => 'Unidade específica',
            self::TARGET_SPECIFIC => 'Seleção específica'
        ];

        return $types[$this->target_type] ?? $this->target_type;
    }

    /**
     * Publica o comunicado
     */
    public function publish(): bool
    {
        $this->status = self::STATUS_PUBLISHED;
        $this->published_at = now();
        return $this->save();
    }

    /**
     * Arquiva o comunicado
     */
    public function archive(): bool
    {
        $this->status = self::STATUS_ARCHIVED;
        return $this->save();
    }

    /**
     * Retorna para rascunho
     */
    public function unpublish(): bool
    {
        $this->status = self::STATUS_DRAFT;
        $this->published_at = null;
        return $this->save();
    }
}

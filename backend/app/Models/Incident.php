<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Incident extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'condominium_id',
        'block_id',
        'user_id',
        'unit_id',
        'resident_id',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'location',
        'incident_date',
        'photos',
        'resolution',
        'resolved_at',
        'reported_by',
        'is_anonymous'
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'resolved_at' => 'datetime',
        'photos' => 'array',
        'is_anonymous' => 'boolean'
    ];

    protected $appends = ['photos_urls'];

    protected $dates = [
        'incident_date',
        'resolved_at',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    /**
     * Get the condominium that owns the incident
     */
    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }

    /**
     * Get the block related to the incident
     */
    public function block()
    {
        return $this->belongsTo(Block::class);
    }

    /**
     * Get the user who reported the incident
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the unit related to the incident
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Get the resident related to the incident
     */
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    /**
     * Get the type label
     */
    public function getTypeLabelAttribute()
    {
        $types = [
            'manutencao' => 'Manutenção',
            'seguranca' => 'Segurança',
            'ruido' => 'Ruído/Barulho',
            'limpeza' => 'Limpeza',
            'vizinhanca' => 'Vizinhança',
            'outros' => 'Outros'
        ];

        return $types[$this->type] ?? $this->type;
    }

    /**
     * Get the priority label
     */
    public function getPriorityLabelAttribute()
    {
        $priorities = [
            'baixa' => 'Baixa',
            'media' => 'Média',
            'alta' => 'Alta',
            'urgente' => 'Urgente'
        ];

        return $priorities[$this->priority] ?? $this->priority;
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute()
    {
        $statuses = [
            'aberta' => 'Aberta',
            'em_andamento' => 'Em Andamento',
            'resolvida' => 'Resolvida',
            'fechada' => 'Fechada'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get the priority color
     */
    public function getPriorityColorAttribute()
    {
        $colors = [
            'baixa' => 'green',
            'media' => 'yellow',
            'alta' => 'orange',
            'urgente' => 'red'
        ];

        return $colors[$this->priority] ?? 'gray';
    }

    /**
     * Get the status color
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'aberta' => 'red',
            'em_andamento' => 'yellow',
            'resolvida' => 'green',
            'fechada' => 'gray'
        ];

        return $colors[$this->status] ?? 'gray';
    }

    /**
     * Scope to filter by condominium
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to filter by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to get open incidents
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'aberta');
    }

    /**
     * Scope to get resolved incidents
     */
    public function scopeResolved($query)
    {
        return $query->where('status', 'resolvida');
    }

    /**
     * Scope to get recent incidents
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get full URLs for photos
     */
    public function getPhotosUrlsAttribute()
    {
        $photos = $this->photos;

        // Se não tem fotos, retorna array vazio
        if (!$photos) {
            return [];
        }

        // Se for string JSON, decodifica
        if (is_string($photos)) {
            $photos = json_decode($photos, true);
        }

        // Se não for array após decodificar, retorna vazio
        if (!is_array($photos)) {
            return [];
        }

        return array_map(function($photo) {
            // Se já é uma URL completa, retorna como está
            if (filter_var($photo, FILTER_VALIDATE_URL)) {
                return $photo;
            }
            // Remove barras escapadas
            $photo = str_replace('\\/', '/', $photo);
            // Gera a URL completa
            return url('storage/' . $photo);
        }, $photos);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'condominium_id',
        'reference_month',
        'base_value',
        'due_date',
        'issue_date',
        'status',
        'notes',
        'meta',
    ];

    protected $casts = [
        'reference_month' => 'date',
        'due_date' => 'date',
        'issue_date' => 'date',
        'base_value' => 'decimal:2',
        'meta' => 'array',
    ];

    /**
     * Relacionamento com condomínio
     */
    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }

    /**
     * Relacionamento com cobranças por unidade
     */
    public function unitBillings()
    {
        return $this->hasMany(UnitBilling::class);
    }

    /**
     * Calcula o total previsto de arrecadação
     */
    public function getTotalExpectedAttribute()
    {
        return $this->unitBillings()->sum('total_amount');
    }

    /**
     * Calcula o total arrecadado
     */
    public function getTotalCollectedAttribute()
    {
        return $this->unitBillings()->sum('amount_paid');
    }

    /**
     * Calcula o total pendente
     */
    public function getTotalPendingAttribute()
    {
        return $this->total_expected - $this->total_collected;
    }

    /**
     * Retorna quantidade de unidades adimplentes
     */
    public function getPaidUnitsCountAttribute()
    {
        return $this->unitBillings()->where('status', 'paid')->count();
    }

    /**
     * Retorna quantidade de unidades inadimplentes
     */
    public function getOverdueUnitsCountAttribute()
    {
        return $this->unitBillings()->whereIn('status', ['overdue', 'pending'])->count();
    }

    /**
     * Scope para filtrar por condomínio
     */
    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    /**
     * Scope para filtrar por status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por mês de referência
     */
    public function scopeByReferenceMonth($query, $month)
    {
        return $query->whereDate('reference_month', $month);
    }
}

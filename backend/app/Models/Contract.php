<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'condominium_id',
        'contract_type',
        'company_name',
        'description',
        'start_date',
        'end_date',
        'adjustment_index',
        'termination_notice_date',
        'notice_period_days',
        'auto_renew',
        'contract_value',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'termination_notice_date' => 'date',
        'contract_value' => 'decimal:2',
        'notice_period_days' => 'integer',
        'auto_renew' => 'boolean',
    ];

    // Calcula a data limite para enviar o ofício de não renovação
    public function getNoticeLimitDateAttribute()
    {
        if ($this->end_date && $this->notice_period_days) {
            return $this->end_date->copy()->subDays($this->notice_period_days);
        }
        return null;
    }

    // Adiciona o campo calculado na serialização
    protected $appends = ['notice_limit_date'];

    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }
}

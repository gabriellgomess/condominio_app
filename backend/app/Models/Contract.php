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
        'contract_value',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'termination_notice_date' => 'date',
        'contract_value' => 'decimal:2',
    ];

    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }
}

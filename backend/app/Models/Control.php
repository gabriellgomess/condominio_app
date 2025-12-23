<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Control extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'control_type',
        'name',
        'validity_date',
        'periodicity',
        'quantity',
        'specifications',
        'status',
        'notes'
    ];

    protected $casts = [
        'validity_date' => 'date',
        'specifications' => 'array'
    ];

    // Calcular status baseado na data de validade
    public function updateStatus()
    {
        if (!$this->validity_date) {
            $this->status = 'active';
            return;
        }

        $today = Carbon::today();
        $validityDate = Carbon::parse($this->validity_date);
        $daysUntilExpiry = $today->diffInDays($validityDate, false);

        if ($daysUntilExpiry < 0) {
            $this->status = 'expired';
        } elseif ($daysUntilExpiry <= 30) {
            $this->status = 'approaching';
        } else {
            $this->status = 'active';
        }
    }

    // Retornar dias até o vencimento
    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->validity_date) {
            return null;
        }

        $today = Carbon::today();
        $validityDate = Carbon::parse($this->validity_date);
        return $today->diffInDays($validityDate, false);
    }
}

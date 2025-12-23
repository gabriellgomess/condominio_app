<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Action extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'type',
        'description',
        'responsible',
        'start_date',
        'end_date',
        'actual_start_date',
        'actual_end_date',
        'status',
        'priority',
        'estimated_cost',
        'actual_cost',
        'notes'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2'
    ];

    // Verificar se está atrasada
    public function isOverdue()
    {
        if (!$this->end_date) {
            return false;
        }

        $today = Carbon::today();
        $endDate = Carbon::parse($this->end_date);

        return $this->status !== 'completed' && $this->status !== 'cancelled' && $endDate < $today;
    }

    // Calcular dias até o prazo
    public function getDaysUntilDeadline()
    {
        if (!$this->end_date) {
            return null;
        }

        $today = Carbon::today();
        $endDate = Carbon::parse($this->end_date);

        return $today->diffInDays($endDate, false);
    }

    // Calcular progresso (baseado em datas)
    public function getProgressPercentage()
    {
        if (!$this->start_date || !$this->end_date) {
            return 0;
        }

        $today = Carbon::today();
        $startDate = Carbon::parse($this->start_date);
        $endDate = Carbon::parse($this->end_date);

        if ($this->status === 'completed') {
            return 100;
        }

        if ($today < $startDate) {
            return 0;
        }

        if ($today > $endDate) {
            return 100;
        }

        $totalDays = $startDate->diffInDays($endDate);
        $daysPassed = $startDate->diffInDays($today);

        return $totalDays > 0 ? round(($daysPassed / $totalDays) * 100) : 0;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class UnitBilling extends Model
{
    use HasFactory;

    protected $fillable = [
        'monthly_fee_id',
        'unit_id',
        'ideal_fraction',
        'base_amount',
        'additional_charges',
        'discounts',
        'total_amount',
        'barcode',
        'digitable_line',
        'our_number',
        'due_date',
        'status',
        'payment_date',
        'amount_paid',
        'late_fee',
        'interest',
        'notes',
        'meta',
    ];

    protected $casts = [
        'ideal_fraction' => 'decimal:6',
        'base_amount' => 'decimal:2',
        'additional_charges' => 'decimal:2',
        'discounts' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'interest' => 'decimal:2',
        'meta' => 'array',
    ];

    /**
     * Relacionamento com mensalidade mensal
     */
    public function monthlyFee()
    {
        return $this->belongsTo(MonthlyFee::class);
    }

    /**
     * Relacionamento com unidade
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Relacionamento com pagamentos
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Calcula o saldo devedor
     */
    public function getBalanceAttribute()
    {
        $total = $this->total_amount + $this->late_fee + $this->interest;
        return $total - $this->amount_paid;
    }

    /**
     * Verifica se está vencido
     */
    public function getIsOverdueAttribute()
    {
        return $this->status !== 'paid'
            && $this->status !== 'cancelled'
            && Carbon::parse($this->due_date)->isPast();
    }

    /**
     * Verifica se está pago
     */
    public function getIsPaidAttribute()
    {
        return $this->status === 'paid';
    }

    /**
     * Calcula dias de atraso
     */
    public function getDaysOverdueAttribute()
    {
        if (!$this->is_overdue) {
            return 0;
        }
        return Carbon::parse($this->due_date)->diffInDays(Carbon::now());
    }

    /**
     * Atualiza o status com base na data de vencimento e pagamento
     */
    public function updateStatus()
    {
        if ($this->status === 'cancelled') {
            return;
        }

        if ($this->amount_paid >= $this->total_amount) {
            $this->status = 'paid';
        } elseif ($this->amount_paid > 0) {
            $this->status = 'partially_paid';
        } elseif ($this->is_overdue) {
            $this->status = 'overdue';
        } else {
            $this->status = 'pending';
        }

        $this->save();
    }

    /**
     * Scope para filtrar por mensalidade mensal
     */
    public function scopeByMonthlyFee($query, $monthlyFeeId)
    {
        return $query->where('monthly_fee_id', $monthlyFeeId);
    }

    /**
     * Scope para filtrar por unidade
     */
    public function scopeByUnit($query, $unitId)
    {
        return $query->where('unit_id', $unitId);
    }

    /**
     * Scope para filtrar por status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar vencidos
     */
    public function scopeOverdue($query)
    {
        return $query->whereIn('status', ['pending', 'partially_paid'])
            ->where('due_date', '<', Carbon::now());
    }

    /**
     * Scope para filtrar pagos
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Scope para filtrar pendentes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}

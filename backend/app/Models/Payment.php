<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_billing_id',
        'payment_date',
        'amount_paid',
        'payment_method',
        'reference',
        'bank_reference',
        'source',
        'notes',
        'meta',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount_paid' => 'decimal:2',
        'meta' => 'array',
    ];

    /**
     * Relacionamento com cobrança da unidade
     */
    public function unitBilling()
    {
        return $this->belongsTo(UnitBilling::class);
    }

    /**
     * Scope para filtrar por cobrança
     */
    public function scopeByUnitBilling($query, $unitBillingId)
    {
        return $query->where('unit_billing_id', $unitBillingId);
    }

    /**
     * Scope para filtrar por método de pagamento
     */
    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    /**
     * Scope para filtrar por data de pagamento
     */
    public function scopeByPaymentDate($query, $date)
    {
        return $query->whereDate('payment_date', $date);
    }

    /**
     * Scope para filtrar por período
     */
    public function scopeByPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('payment_date', [$startDate, $endDate]);
    }

    /**
     * Boot do model para atualizar a cobrança ao criar pagamento
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($payment) {
            $payment->updateUnitBilling();
        });

        static::updated(function ($payment) {
            $payment->updateUnitBilling();
        });

        static::deleted(function ($payment) {
            $payment->updateUnitBilling();
        });
    }

    /**
     * Atualiza o valor pago na cobrança da unidade
     */
    public function updateUnitBilling()
    {
        $unitBilling = $this->unitBilling;

        // Soma todos os pagamentos
        $totalPaid = $unitBilling->payments()->sum('amount_paid');

        // Atualiza o valor pago
        $unitBilling->amount_paid = $totalPaid;

        // Atualiza a data de pagamento (última data)
        $lastPayment = $unitBilling->payments()
            ->orderBy('payment_date', 'desc')
            ->first();

        if ($lastPayment) {
            $unitBilling->payment_date = $lastPayment->payment_date;
        }

        $unitBilling->save();

        // Atualiza o status
        $unitBilling->updateStatus();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revenue extends Model
{
    use HasFactory;

    protected $fillable = [
        'condominium_id',
        'subaccount_id',
        'category_id',
        'source',
        'destination',
        'type',
        'title',
        'description',
        'competency_date',
        'amount',
        'is_forecast',
        'meta',
    ];

    protected $casts = [
        'competency_date' => 'date',
        'amount' => 'decimal:2',
        'is_forecast' => 'boolean',
        'meta' => 'array',
    ];

    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }

    public function subaccount()
    {
        return $this->belongsTo(Subaccount::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}























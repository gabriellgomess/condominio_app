<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class SupplierPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'supplier_id',
        'title',
        'description',
        'services_offered',
        'image_path',
        'price',
        'contact_info',
        'instagram',
        'facebook',
        'whatsapp',
        'website',
        'catalog_url',
        'is_active',
        'expires_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'date',
        'price' => 'decimal:2'
    ];

    protected $appends = ['is_expired'];

    // Relacionamento com Supplier
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Verificar se a publicação está expirada
    public function getIsExpiredAttribute()
    {
        if (!$this->expires_at) {
            return false;
        }
        return Carbon::now()->gt($this->expires_at);
    }

    // Scope para publicações ativas
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            });
    }
}

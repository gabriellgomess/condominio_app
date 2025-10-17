<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;

    protected $fillable = [
        'condominium_id',
        'unit_id',
        'unit_status',

        // Dados do proprietário
        'owner_name',
        'owner_email',
        'owner_phone',
        'owner_cpf',
        'owner_user_id',
        'owner_status',
        'owner_notes',

        // Dados do inquilino
        'has_tenant',
        'tenant_name',
        'tenant_email',
        'tenant_phone',
        'tenant_cpf',
        'tenant_user_id',
        'tenant_status',
        'tenant_lease_start',
        'tenant_lease_end',
        'tenant_notes',

        // Informações gerais
        'total_residents',
        'notes',
        'active'
    ];

    protected $casts = [
        'has_tenant' => 'boolean',
        'total_residents' => 'integer',
        'active' => 'boolean',
        'tenant_lease_start' => 'date',
        'tenant_lease_end' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = ['owner', 'tenant'];

    // Relacionamentos
    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function ownerUser()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function tenantUser()
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    // Accessors para compatibilidade com frontend
    public function getOwnerAttribute()
    {
        return [
            'name' => $this->owner_name,
            'email' => $this->owner_email,
            'phone' => $this->owner_phone,
            'cpf' => $this->owner_cpf,
            'status' => $this->owner_status,
            'notes' => $this->owner_notes
        ];
    }

    public function getTenantAttribute()
    {
        return [
            'has_tenant' => $this->has_tenant,
            'name' => $this->tenant_name ?? '',
            'email' => $this->tenant_email ?? '',
            'phone' => $this->tenant_phone ?? '',
            'cpf' => $this->tenant_cpf ?? '',
            'status' => $this->tenant_status ?? 'inactive',
            'lease_start' => $this->tenant_lease_start?->format('Y-m-d') ?? '',
            'lease_end' => $this->tenant_lease_end?->format('Y-m-d') ?? '',
            'notes' => $this->tenant_notes ?? ''
        ];
    }

    // Mutators para receber dados do frontend
    public function setOwnerAttribute($value)
    {
        if (is_array($value)) {
            $this->owner_name = $value['name'] ?? '';
            $this->owner_email = $value['email'] ?? '';
            $this->owner_phone = $value['phone'] ?? '';
            $this->owner_cpf = $value['cpf'] ?? '';
            $this->owner_status = $value['status'] ?? 'active';
            $this->owner_notes = $value['notes'] ?? '';
        }
    }

    public function setTenantAttribute($value)
    {
        if (is_array($value)) {
            $this->has_tenant = $value['has_tenant'] ?? false;
            $this->tenant_name = $value['name'] ?? null;
            $this->tenant_email = $value['email'] ?? null;
            $this->tenant_phone = $value['phone'] ?? null;
            $this->tenant_cpf = $value['cpf'] ?? null;
            $this->tenant_status = $value['status'] ?? 'inactive';
            $this->tenant_lease_start = !empty($value['lease_start']) ? $value['lease_start'] : null;
            $this->tenant_lease_end = !empty($value['lease_end']) ? $value['lease_end'] : null;
            $this->tenant_notes = $value['notes'] ?? null;

            // Calcular total de moradores
            $this->total_residents = $this->has_tenant ? 2 : 1;
        }
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeWithTenant($query)
    {
        return $query->where('has_tenant', true);
    }

    public function scopeWithoutTenant($query)
    {
        return $query->where('has_tenant', false);
    }

    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('owner_name', 'LIKE', "%{$search}%")
                ->orWhere('owner_email', 'LIKE', "%{$search}%")
                ->orWhere('owner_phone', 'LIKE', "%{$search}%")
                ->orWhere('owner_cpf', 'LIKE', "%{$search}%")
                ->orWhere('tenant_name', 'LIKE', "%{$search}%")
                ->orWhere('tenant_email', 'LIKE', "%{$search}%")
                ->orWhere('tenant_phone', 'LIKE', "%{$search}%")
                ->orWhere('tenant_cpf', 'LIKE', "%{$search}%")
                ->orWhereHas('unit', function ($unitQuery) use ($search) {
                    $unitQuery->where('number', 'LIKE', "%{$search}%");
                });
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    // Constantes para tipos de fornecedor
    const TYPE_COMPANY = 'company';
    const TYPE_MEI = 'mei';
    const TYPE_INDIVIDUAL = 'individual';

    // Constantes para categorias
    const CATEGORY_GAS_SUPPLY = 'gas_supply';
    const CATEGORY_GATE_MAINTENANCE = 'gate_maintenance';
    const CATEGORY_INTERCOM_MAINTENANCE = 'intercom_maintenance';
    const CATEGORY_CLEANING = 'cleaning';
    const CATEGORY_RECEPTION = 'reception';
    const CATEGORY_ACCESS_CONTROL = 'access_control';
    const CATEGORY_GARDENING = 'gardening';
    const CATEGORY_ELEVATOR_MAINTENANCE = 'elevator_maintenance';
    const CATEGORY_GYM_MAINTENANCE = 'gym_maintenance';
    const CATEGORY_GUARANTEE_COMPANY = 'guarantee_company';
    const CATEGORY_CONDOMINIUM_ADMIN = 'condominium_admin';
    const CATEGORY_THIRD_PARTY_MANAGER = 'third_party_manager';
    const CATEGORY_PEST_CONTROL = 'pest_control';
    const CATEGORY_WATER_TANK_CLEANING = 'water_tank_cleaning';
    const CATEGORY_OTHER = 'other';

    // Constantes para status
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_PENDING = 'pending';
    const STATUS_BLOCKED = 'blocked';

    protected $fillable = [
        'condominium_id',
        'company_name',
        'trade_name',
        'cnpj',
        'cpf',
        'supplier_type',
        'category',
        'contact_name',
        'email',
        'phone',
        'mobile',
        'address',
        'number',
        'cep',
        'city',
        'state',
        'district',
        'services_description',
        'hourly_rate',
        'monthly_rate',
        'contract_start',
        'contract_end',
        'status',
        'evaluation',
        'notes',
        'documents',
        'emergency_contact',
        'availability',
        'active'
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'monthly_rate' => 'decimal:2',
        'contract_start' => 'date',
        'contract_end' => 'date',
        'evaluation' => 'decimal:1',
        'documents' => 'array',
        'availability' => 'array',
        'active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relacionamentos
    public function condominium()
    {
        return $this->belongsTo(Condominium::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true)->where('status', self::STATUS_ACTIVE);
    }

    public function scopeByCondominium($query, $condominiumId)
    {
        return $query->where('condominium_id', $condominiumId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('company_name', 'LIKE', "%{$search}%")
                ->orWhere('trade_name', 'LIKE', "%{$search}%")
                ->orWhere('contact_name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%")
                ->orWhere('phone', 'LIKE', "%{$search}%")
                ->orWhere('cnpj', 'LIKE', "%{$search}%")
                ->orWhere('cpf', 'LIKE', "%{$search}%")
                ->orWhere('services_description', 'LIKE', "%{$search}%");
        });
    }

    public function scopeWithContracts($query)
    {
        return $query->whereNotNull('contract_start');
    }

    // Relacionamento com publicações
    public function posts()
    {
        return $this->hasMany(SupplierPost::class);
    }

    // Publicações ativas
    public function activePosts()
    {
        return $this->posts()->active();
    }

    public function scopeContractExpiring($query, $days = 30)
    {
        return $query->whereNotNull('contract_end')
            ->where('contract_end', '<=', now()->addDays($days))
            ->where('contract_end', '>=', now());
    }

    // Accessors
    public function getSupplierTypeNameAttribute()
    {
        $types = [
            self::TYPE_COMPANY => 'Empresa',
            self::TYPE_MEI => 'MEI',
            self::TYPE_INDIVIDUAL => 'Pessoa Física'
        ];

        return $types[$this->supplier_type] ?? 'Desconhecido';
    }

    public function getCategoryNameAttribute()
    {
        $categories = [
            self::CATEGORY_GAS_SUPPLY => 'Fornecimento de gás',
            self::CATEGORY_GATE_MAINTENANCE => 'Manutenção de portões',
            self::CATEGORY_INTERCOM_MAINTENANCE => 'Manutenção de interfones',
            self::CATEGORY_CLEANING => 'Zeladoria e limpeza',
            self::CATEGORY_RECEPTION => 'Portaria',
            self::CATEGORY_ACCESS_CONTROL => 'Controle de acesso',
            self::CATEGORY_GARDENING => 'Jardinagem',
            self::CATEGORY_ELEVATOR_MAINTENANCE => 'Manutenção de elevadores',
            self::CATEGORY_GYM_MAINTENANCE => 'Manutenção da academia',
            self::CATEGORY_GUARANTEE_COMPANY => 'Empresa garantidora (taxas de administração)',
            self::CATEGORY_CONDOMINIUM_ADMIN => 'Administradora de condomínio',
            self::CATEGORY_THIRD_PARTY_MANAGER => 'Síndico terceirizado',
            self::CATEGORY_PEST_CONTROL => 'Dedetização / desinsetização / desratização',
            self::CATEGORY_WATER_TANK_CLEANING => 'Limpeza de reservatórios de água',
            self::CATEGORY_OTHER => 'Outros'
        ];

        return $categories[$this->category] ?? 'Outros';
    }

    public function getStatusNameAttribute()
    {
        $statuses = [
            self::STATUS_ACTIVE => 'Ativo',
            self::STATUS_INACTIVE => 'Inativo',
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_BLOCKED => 'Bloqueado'
        ];

        return $statuses[$this->status] ?? 'Desconhecido';
    }

    public function getFormattedCnpjAttribute()
    {
        if (!$this->cnpj) return null;

        $cnpj = preg_replace('/\D/', '', $this->cnpj);
        return preg_replace('/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/', '$1.$2.$3/$4-$5', $cnpj);
    }

    public function getFormattedCpfAttribute()
    {
        if (!$this->cpf) return null;

        $cpf = preg_replace('/\D/', '', $this->cpf);
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }

    public function getFormattedPhoneAttribute()
    {
        if (!$this->phone) return null;

        $phone = preg_replace('/\D/', '', $this->phone);
        if (strlen($phone) === 11) {
            return preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-$3', $phone);
        } elseif (strlen($phone) === 10) {
            return preg_replace('/(\d{2})(\d{4})(\d{4})/', '($1) $2-$3', $phone);
        }

        return $this->phone;
    }

    public function getIsContractActiveAttribute()
    {
        if (!$this->contract_start || !$this->contract_end) {
            return false;
        }

        $now = now();
        return $now->between($this->contract_start, $this->contract_end);
    }

    public function getContractDaysRemainingAttribute()
    {
        if (!$this->contract_end) {
            return null;
        }

        $now = now();
        if ($now->gt($this->contract_end)) {
            return 0;
        }

        return $now->diffInDays($this->contract_end);
    }

    // Métodos estáticos para obter listas
    public static function getSupplierTypes()
    {
        return [
            self::TYPE_COMPANY => 'Empresa',
            self::TYPE_MEI => 'MEI',
            self::TYPE_INDIVIDUAL => 'Pessoa Física'
        ];
    }

    public static function getCategories()
    {
        return [
            self::CATEGORY_GAS_SUPPLY => 'Fornecimento de gás',
            self::CATEGORY_GATE_MAINTENANCE => 'Manutenção de portões',
            self::CATEGORY_INTERCOM_MAINTENANCE => 'Manutenção de interfones',
            self::CATEGORY_CLEANING => 'Zeladoria e limpeza',
            self::CATEGORY_RECEPTION => 'Portaria',
            self::CATEGORY_ACCESS_CONTROL => 'Controle de acesso',
            self::CATEGORY_GARDENING => 'Jardinagem',
            self::CATEGORY_ELEVATOR_MAINTENANCE => 'Manutenção de elevadores',
            self::CATEGORY_GYM_MAINTENANCE => 'Manutenção da academia',
            self::CATEGORY_GUARANTEE_COMPANY => 'Empresa garantidora (taxas de administração)',
            self::CATEGORY_CONDOMINIUM_ADMIN => 'Administradora de condomínio',
            self::CATEGORY_THIRD_PARTY_MANAGER => 'Síndico terceirizado',
            self::CATEGORY_PEST_CONTROL => 'Dedetização / desinsetização / desratização',
            self::CATEGORY_WATER_TANK_CLEANING => 'Limpeza de reservatórios de água',
            self::CATEGORY_OTHER => 'Outros'
        ];
    }

    public static function getStatuses()
    {
        return [
            self::STATUS_ACTIVE => 'Ativo',
            self::STATUS_INACTIVE => 'Inativo',
            self::STATUS_PENDING => 'Pendente',
            self::STATUS_BLOCKED => 'Bloqueado'
        ];
    }

    // Métodos para estatísticas
    public static function getEvaluationStats($condominiumId = null)
    {
        $query = self::query();

        if ($condominiumId) {
            $query->byCondominium($condominiumId);
        }

        $evaluatedSuppliers = $query->whereNotNull('evaluation')
            ->where('evaluation', '>', 0)
            ->get();

        $totalEvaluated = $evaluatedSuppliers->count();

        if ($totalEvaluated === 0) {
            return [
                'average' => 0,
                'total_evaluated' => 0,
                'total_suppliers' => $query->count(),
                'distribution' => [
                    5 => 0,
                    4 => 0,
                    3 => 0,
                    2 => 0,
                    1 => 0
                ]
            ];
        }

        $average = $evaluatedSuppliers->avg('evaluation');

        // Distribuição por estrelas
        $distribution = [
            5 => $evaluatedSuppliers->where('evaluation', 5)->count(),
            4 => $evaluatedSuppliers->where('evaluation', 4)->count(),
            3 => $evaluatedSuppliers->where('evaluation', 3)->count(),
            2 => $evaluatedSuppliers->where('evaluation', 2)->count(),
            1 => $evaluatedSuppliers->where('evaluation', 1)->count()
        ];

        return [
            'average' => round($average, 1),
            'total_evaluated' => $totalEvaluated,
            'total_suppliers' => $query->count(),
            'distribution' => $distribution,
            'percentage_evaluated' => round(($totalEvaluated / $query->count()) * 100, 1)
        ];
    }

    public static function getCategoryStats($condominiumId = null)
    {
        $query = self::query();

        if ($condominiumId) {
            $query->byCondominium($condominiumId);
        }

        $stats = [];
        foreach (self::getCategories() as $key => $name) {
            $categoryQuery = clone $query;
            $categorySuppliers = $categoryQuery->where('category', $key)->get();

            $stats[$key] = [
                'name' => $name,
                'total' => $categorySuppliers->count(),
                'active' => $categorySuppliers->where('status', self::STATUS_ACTIVE)->count(),
                'average_evaluation' => $categorySuppliers->whereNotNull('evaluation')
                    ->where('evaluation', '>', 0)
                    ->avg('evaluation') ?: 0
            ];
        }

        return $stats;
    }
}

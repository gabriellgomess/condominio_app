<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Constantes para níveis de acesso
    const ACCESS_LEVEL_ADMINISTRADOR = 'administrador';
    const ACCESS_LEVEL_SINDICO = 'sindico';
    const ACCESS_LEVEL_MORADOR = 'morador';
    const ACCESS_LEVEL_FUNCIONARIO = 'funcionario';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'access_level',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Verifica se o usuário é administrador
     */
    public function isAdministrador(): bool
    {
        return $this->access_level === self::ACCESS_LEVEL_ADMINISTRADOR;
    }

    /**
     * Verifica se o usuário é síndico
     */
    public function isSindico(): bool
    {
        return $this->access_level === self::ACCESS_LEVEL_SINDICO;
    }

    /**
     * Verifica se o usuário é morador
     */
    public function isMorador(): bool
    {
        return $this->access_level === self::ACCESS_LEVEL_MORADOR;
    }

    /**
     * Verifica se o usuário é funcionário
     */
    public function isFuncionario(): bool
    {
        return $this->access_level === self::ACCESS_LEVEL_FUNCIONARIO;
    }

    /**
     * Verifica se o usuário tem acesso administrativo (admin ou síndico)
     */
    public function hasAdminAccess(): bool
    {
        return in_array($this->access_level, [
            self::ACCESS_LEVEL_ADMINISTRADOR,
            self::ACCESS_LEVEL_SINDICO
        ]);
    }

    /**
     * Obtém o nome legível do nível de acesso
     */
    public function getAccessLevelNameAttribute(): string
    {
        $levels = [
            self::ACCESS_LEVEL_ADMINISTRADOR => 'Administrador',
            self::ACCESS_LEVEL_SINDICO => 'Síndico',
            self::ACCESS_LEVEL_MORADOR => 'Morador',
            self::ACCESS_LEVEL_FUNCIONARIO => 'Funcionário'
        ];

        return $levels[$this->access_level] ?? 'Desconhecido';
    }
}

# Sistema de Reset de Senha - API Laravel

Este documento descreve a implementação do sistema de "Esqueci minha senha" na API Laravel.

## Visão Geral

O sistema permite que usuários solicitem reset de senha através de email, recebam um token único e seguro, e redefinam sua senha usando esse token.

## Funcionalidades

- ✅ **Solicitar Reset**: Usuário informa email e recebe token
- ✅ **Verificar Token**: Valida se o token é válido e não expirou
- ✅ **Redefinir Senha**: Define nova senha usando token válido
- ✅ **Segurança**: Tokens expiram em 60 minutos
- ✅ **Validação**: Senha deve ter mínimo 6 caracteres e confirmação

## Endpoints da API

### 1. Solicitar Reset de Senha

**POST** `/api/forgot-password`

Solicita o reset de senha para um email específico.

#### Request Body
```json
{
    "email": "usuario@email.com"
}
```

#### Respostas

**200 - Sucesso**
```json
{
    "status": "success",
    "message": "Email de reset de senha enviado com sucesso",
    "data": {
        "email": "usuario@email.com",
        "token": "abc123def456...",
        "reset_url": "http://localhost:8000/reset-password?token=abc123def456..."
    }
}
```

**404 - Email não encontrado**
```json
{
    "status": "error",
    "message": "Email não encontrado no sistema"
}
```

**400 - Erro de validação**
```json
{
    "status": "error",
    "message": "Erro de validação",
    "erros": {
        "email": ["O campo e-mail é obrigatório."]
    }
}
```

### 2. Verificar Token de Reset

**POST** `/api/verify-reset-token`

Verifica se um token de reset é válido e não expirou.

#### Request Body
```json
{
    "token": "abc123def456...",
    "email": "usuario@email.com"
}
```

#### Respostas

**200 - Token válido**
```json
{
    "status": "success",
    "message": "Token válido",
    "data": {
        "email": "usuario@email.com",
        "valid": true
    }
}
```

**404 - Token inválido ou expirado**
```json
{
    "status": "error",
    "message": "Token inválido ou expirado"
}
```

### 3. Redefinir Senha

**POST** `/api/reset-password`

Redefine a senha do usuário usando o token de reset.

#### Request Body
```json
{
    "token": "abc123def456...",
    "email": "usuario@email.com",
    "password": "novaSenha123",
    "password_confirmation": "novaSenha123"
}
```

#### Respostas

**200 - Senha redefinida**
```json
{
    "status": "success",
    "message": "Senha redefinida com sucesso"
}
```

**400 - Erro de validação**
```json
{
    "status": "error",
    "message": "Erro de validação",
    "erros": {
        "password": ["A confirmação de senha não confere."]
    }
}
```

**404 - Token inválido ou expirado**
```json
{
    "status": "error",
    "message": "Token inválido ou expirado"
}
```

## Como Testar via Swagger

### Passo a Passo

1. **Acesse o Swagger**: `http://localhost:8000/api/documentation`

2. **Solicitar Reset**:
   - Endpoint: `POST /api/forgot-password`
   - Body: `{"email": "morador@condominio.com"}`
   - Execute e copie o token retornado

3. **Verificar Token** (opcional):
   - Endpoint: `POST /api/verify-reset-token`
   - Body: `{"token": "token_copiado", "email": "morador@condominio.com"}`
   - Confirme que retorna "Token válido"

4. **Redefinir Senha**:
   - Endpoint: `POST /api/reset-password`
   - Body: `{"token": "token_copiado", "email": "morador@condominio.com", "password": "novaSenha123", "password_confirmation": "novaSenha123"}`
   - Confirme que retorna "Senha redefinida com sucesso"

5. **Testar Login**:
   - Endpoint: `POST /api/login`
   - Body: `{"email": "morador@condominio.com", "password": "novaSenha123"}`
   - Confirme que o login funciona com a nova senha

## Implementação Técnica

### Banco de Dados

A tabela `password_reset_tokens` já existe e armazena:
- `email`: Email do usuário (chave primária)
- `token`: Token único de 64 caracteres
- `created_at`: Timestamp de criação

### Segurança

- **Expiração**: Tokens expiram em 60 minutos
- **Unicidade**: Cada email pode ter apenas um token ativo
- **Validação**: Senha deve ter mínimo 6 caracteres
- **Confirmação**: Senha deve ser confirmada
- **Limpeza**: Tokens usados são removidos automaticamente

### Fluxo de Funcionamento

1. **Solicitação**: Usuário informa email
2. **Validação**: Verifica se email existe no sistema
3. **Geração**: Cria token único de 64 caracteres
4. **Armazenamento**: Salva token no banco com timestamp
5. **Resposta**: Retorna token e URL para testes
6. **Verificação**: Frontend pode verificar se token é válido
7. **Reset**: Usuário define nova senha com token
8. **Limpeza**: Token é removido após uso

## Configuração de Email

### Atual (Desenvolvimento)
- **Driver**: `log` (emails são logados em `storage/logs/laravel.log`)
- **Token**: Retornado na resposta para testes

### Produção
Para ativar envio real de emails:

1. **Configurar .env**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
MAIL_ENCRYPTION=tls
```

2. **Descomentar no código**:
```php
// Em forgotPassword()
Mail::to($email)->send(new ResetPasswordMail($user, $resetUrl));
```

3. **Criar Mailable**:
```bash
php artisan make:mail ResetPasswordMail
```

## Exemplos de Uso

### Frontend - Solicitar Reset
```javascript
const requestReset = async (email) => {
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Mostrar mensagem de sucesso
            console.log('Token:', data.data.token);
            console.log('URL:', data.data.reset_url);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
};
```

### Frontend - Verificar Token
```javascript
const verifyToken = async (token, email) => {
    try {
        const response = await fetch('/api/verify-reset-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, email })
        });
        
        const data = await response.json();
        return data.status === 'success';
    } catch (error) {
        return false;
    }
};
```

### Frontend - Redefinir Senha
```javascript
const resetPassword = async (token, email, password, passwordConfirmation) => {
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Redirecionar para login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
};
```

## Troubleshooting

### Problemas Comuns

1. **Token não encontrado**:
   - Verifique se o email está correto
   - Confirme se o token não expirou (60 minutos)
   - Verifique se o token foi copiado completamente

2. **Senha não confirma**:
   - Certifique-se de que `password` e `password_confirmation` são idênticos
   - Senha deve ter mínimo 6 caracteres

3. **Email não encontrado**:
   - Verifique se o usuário existe no sistema
   - Use um dos emails de teste: `morador@condominio.com`

### Logs

Para debug, verifique:
- `storage/logs/laravel.log` (emails em modo log)
- Console do navegador (erros de frontend)
- Resposta da API (status e mensagens)

## Próximos Passos

1. **Implementar Frontend**: Criar páginas de reset de senha
2. **Configurar Email**: Ativar envio real de emails
3. **Personalizar Templates**: Criar emails personalizados
4. **Adicionar Rate Limiting**: Limitar tentativas de reset
5. **Implementar Notificações**: Alertar usuário sobre mudança de senha

## Suporte

Para dúvidas sobre o sistema de reset de senha:
- Consulte este documento
- Verifique os logs do Laravel
- Teste via Swagger primeiro
- Entre em contato com a equipe de desenvolvimento


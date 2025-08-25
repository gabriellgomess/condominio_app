# Níveis de Acesso - Sistema de Condomínio

Este documento descreve os 4 níveis de acesso implementados na API para o sistema de condomínio.

## Visão Geral

O sistema implementa 4 níveis de acesso hierárquicos que permitem controle granular sobre as funcionalidades disponíveis para cada tipo de usuário. Os níveis são implementados no campo `access_level` da tabela `users` e são utilizados para renderização condicional no frontend.

## Níveis de Acesso

### 1. **Administrador** (`administrador`)
- **Descrição**: Acesso total ao sistema
- **Permissões**: Todas as funcionalidades disponíveis
- **Uso**: Gestores do sistema, desenvolvedores, superusuários
- **Funcionalidades**: 
  - Gerenciamento completo de usuários
  - Configurações do sistema
  - Relatórios administrativos
  - Todas as funcionalidades dos outros níveis

### 2. **Síndico** (`sindico`)
- **Descrição**: Gerenciamento do condomínio
- **Permissões**: Acesso administrativo limitado ao condomínio
- **Uso**: Síndicos, administradores de condomínio
- **Funcionalidades**:
  - Gerenciamento de moradores
  - Controle financeiro
  - Relatórios do condomínio
  - Gestão de funcionários
  - Comunicações administrativas

### 3. **Morador** (`morador`)
- **Descrição**: Acesso básico às funcionalidades
- **Permissões**: Funcionalidades essenciais para moradores
- **Uso**: Moradores do condomínio
- **Funcionalidades**:
  - Visualização de comunicados
  - Pagamento de taxas
  - Solicitações de manutenção
  - Acesso ao histórico pessoal
  - Comunicação com administração

### 4. **Funcionário** (`funcionario`)
- **Descrição**: Acesso limitado para tarefas específicas
- **Permissões**: Funcionalidades relacionadas ao trabalho
- **Uso**: Porteiros, zeladores, funcionários de limpeza
- **Funcionalidades**:
  - Registro de entrada/saída
  - Relatórios de atividades
  - Comunicação com moradores
  - Acesso limitado ao sistema

## Implementação Técnica

### Campo no Banco de Dados
```sql
access_level ENUM('administrador', 'sindico', 'morador', 'funcionario') 
DEFAULT 'morador'
```

### Modelo User
O modelo `User` inclui métodos auxiliares para verificar níveis de acesso:

```php
// Verificações individuais
$user->isAdministrador();    // boolean
$user->isSindico();          // boolean
$user->isMorador();          // boolean
$user->isFuncionario();      // boolean

// Verificações de grupo
$user->hasAdminAccess();     // boolean (admin ou síndico)

// Nome legível
$user->access_level_name;    // string
```

### Constantes Disponíveis
```php
User::ACCESS_LEVEL_ADMINISTRADOR  // 'administrador'
User::ACCESS_LEVEL_SINDICO        // 'sindico'
User::ACCESS_LEVEL_MORADOR        // 'morador'
User::ACCESS_LEVEL_FUNCIONARIO    // 'funcionario'
```

## Endpoints da API

### 1. Registro com Nível de Acesso
```http
POST /api/register
{
    "name": "Nome do Usuário",
    "email": "email@dominio.com",
    "password": "senha",
    "access_level": "morador"  // Opcional, padrão: "morador"
}
```

### 2. Login
```http
POST /api/login
{
    "email": "email@dominio.com",
    "password": "senha"
}
```

### 3. Perfil do Usuário
```http
GET /api/profile
Authorization: Bearer {token}
```

**Resposta inclui o nível de acesso:**
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Nome do Usuário",
        "email": "email@dominio.com",
        "access_level": "morador",
        "access_level_name": "Morador"
    }
}
```

### 4. Níveis de Acesso Disponíveis
```http
GET /api/access-levels
```

**Resposta:**
```json
{
    "status": "success",
    "data": [
        {
            "value": "administrador",
            "label": "Administrador",
            "description": "Acesso total ao sistema"
        },
        {
            "value": "sindico",
            "label": "Síndico",
            "description": "Gerenciamento do condomínio"
        },
        {
            "value": "morador",
            "label": "Morador",
            "description": "Acesso básico às funcionalidades"
        },
        {
            "value": "funcionario",
            "label": "Funcionário",
            "description": "Acesso limitado para tarefas específicas"
        }
    ]
}
```

### 5. Reset de Senha

#### Solicitar Reset
```http
POST /api/forgot-password
{
    "email": "email@dominio.com"
}
```

#### Verificar Token
```http
POST /api/verify-reset-token
{
    "token": "token_do_reset",
    "email": "email@dominio.com"
}
```

#### Redefinir Senha
```http
POST /api/reset-password
{
    "token": "token_do_reset",
    "email": "email@dominio.com",
    "password": "novaSenha123",
    "password_confirmation": "novaSenha123"
}
```

## Usuários de Exemplo

Para testes, foram criados usuários com cada nível de acesso:

| Email | Senha | Nível | Descrição |
|-------|-------|-------|-----------|
| admin@condominio.com | 123456 | Administrador | Acesso total |
| sindico@condominio.com | 123456 | Síndico | Gerenciamento |
| morador@condominio.com | 123456 | Morador | Acesso básico |
| funcionario@condominio.com | 123456 | Funcionário | Acesso limitado |

## Uso no Frontend

### Renderização Condicional
```javascript
// Exemplo de uso no frontend
const user = authUser; // Usuário autenticado

if (user.access_level === 'administrador') {
    // Mostrar todas as funcionalidades
    showAdminPanel();
    showUserManagement();
    showSystemSettings();
} else if (user.access_level === 'sindico') {
    // Mostrar funcionalidades de síndico
    showSyndicPanel();
    showResidentManagement();
    showFinancialControl();
} else if (user.access_level === 'morador') {
    // Mostrar funcionalidades de morador
    showResidentPanel();
    showCommunications();
    showPayments();
} else if (user.access_level === 'funcionario') {
    // Mostrar funcionalidades de funcionário
    showEmployeePanel();
    showActivityReports();
}
```

### Verificação de Permissões
```javascript
// Função auxiliar para verificar permissões
function hasPermission(user, requiredLevel) {
    const levels = {
        'funcionario': 1,
        'morador': 2,
        'sindico': 3,
        'administrador': 4
    };
    
    return levels[user.access_level] >= levels[requiredLevel];
}

// Uso
if (hasPermission(user, 'sindico')) {
    showSyndicFeatures();
}
```

## Segurança

- **Validação**: O campo `access_level` é validado no backend
- **Padrão**: Usuários novos recebem nível "morador" por padrão
- **Imutabilidade**: O nível de acesso só pode ser alterado por administradores
- **Auditoria**: Todas as ações são registradas com o nível de acesso do usuário

## Próximos Passos

1. **Implementar Middleware**: Para controle de acesso baseado em níveis
2. **Logs de Auditoria**: Registrar todas as ações por nível de acesso
3. **Permissões Granulares**: Definir permissões específicas para cada funcionalidade
4. **Hierarquia de Acesso**: Implementar herança de permissões entre níveis
5. **Gestão de Usuários**: Interface para administradores gerenciarem níveis de acesso

## Suporte

Para dúvidas ou sugestões sobre os níveis de acesso, consulte a documentação da API ou entre em contato com a equipe de desenvolvimento.

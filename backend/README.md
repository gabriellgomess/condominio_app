
# API de Autenticação em Laravel

Este projeto é uma API básica de autenticação construída com Laravel. Ele permite o registro de usuários, login, obtenção de perfil de usuário autenticado e logout. A API utiliza **Laravel Sanctum** para autenticação baseada em tokens e documentada usando **Swagger**.

## Funcionalidades

- **Registro de Usuário**: Cria um novo usuário na base de dados.
- **Login de Usuário**: Autentica o usuário e retorna um token de acesso.
- **Perfil de Usuário**: Obtém os dados do usuário autenticado.
- **Logout de Usuário**: Invalida o token de acesso do usuário.
- **Níveis de Acesso**: Sistema de 4 níveis de acesso para controle de funcionalidades.

## Níveis de Acesso

O sistema implementa 4 níveis de acesso hierárquicos:

1. **Administrador** - Acesso total ao sistema
2. **Síndico** - Gerenciamento do condomínio  
3. **Morador** - Acesso básico às funcionalidades
4. **Funcionário** - Acesso limitado para tarefas específicas

Para mais detalhes sobre os níveis de acesso, consulte o arquivo [NIVEIS_ACESSO.md](NIVEIS_ACESSO.md).

## Endpoints

### 1. Registro

- **URL**: `/api/register`  
- **Método**: `POST`  
- **Corpo da Requisição**:
  ```json
  {
      "name": "Nome do Usuário",
      "email": "email@dominio.com",
      "password": "senha",
      "access_level": "morador"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Usuário criado com sucesso",
        "token": "1|V0upjdioPsDPjWdOyNGjJIaCQHJTJH0MQvwK5DdZ13806f99",
        "data": {
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "access_level": "morador",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z",
            "id": 1
        }
    }
    ```
  - **401 (Erro de Validação)**:
    ```json
    {
        "status": "error",
        "message": "Erro de validação",
        "erros": {
            "email": [
                "Este e-mail já está em uso"
            ]
        }
    }
    ```

### 2. Login

- **URL**: `/api/login`  
- **Método**: `POST`  
- **Corpo da Requisição**:
  ```json
  {
      "email": "email@dominio.com",
      "password": "senha"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Usuário logado com sucesso",
        "token": "2|B6CL7DLBQHLFvpBPv4qHn2swyqeRH6lSAZOHsGEs66100ee8",
        "data": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "access_level": "morador",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z"
        }
    }
    ```
  - **401 (Email ou Senha Incorretos)**:
    ```json
    {
        "status": "error",
        "message": "E-mail ou senha incorretos"
    }
    ```

### 3. Perfil

- **URL**: `/api/profile`  
- **Método**: `GET`  
- **Cabeçalho**:
  ```json
  {
      "accept": "application/json",
      "Authorization": "Bearer {token}"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Perfil do Usuário",
        "data": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "email@dominio.com",
            "access_level": "morador",
            "created_at": "2024-10-03T15:51:05.000000Z",
            "updated_at": "2024-10-03T15:51:05.000000Z"
        },
        "id": 1
    }
    ```
  - **401 (Não Autenticado)**:
    ```json
    {
        "message": "Não autenticado."
    }
    ```

### 4. Logout

- **URL**: `/api/logout`  
- **Método**: `POST`  
- **Cabeçalho**:
  ```json
  {
      "accept": "application/json",
      "Authorization": "Bearer {token}"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Logout realizado com sucesso"
    }
    ```
  - **401 (Não Autenticado)**:
    ```json
    {
        "message": "Usuário não autenticado."
    }
    ```

### 5. Níveis de Acesso

- **URL**: `/api/access-levels`  
- **Método**: `GET`  
- **Descrição**: Retorna todos os níveis de acesso disponíveis no sistema
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Níveis de acesso disponíveis",
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

### 6. Solicitar Reset de Senha

- **URL**: `/api/forgot-password`  
- **Método**: `POST`  
- **Descrição**: Solicita reset de senha e envia email com token
- **Corpo da Requisição**:
  ```json
  {
      "email": "email@dominio.com"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Email de reset de senha enviado com sucesso",
        "data": {
            "email": "email@dominio.com",
            "token": "token_para_testes",
            "reset_url": "http://localhost:8000/reset-password?token=token_para_testes"
        }
    }
    ```
  - **404 (Email não encontrado)**:
    ```json
    {
        "status": "error",
        "message": "Email não encontrado no sistema"
    }
    ```

### 7. Verificar Token de Reset

- **URL**: `/api/verify-reset-token`  
- **Método**: `POST`  
- **Descrição**: Verifica se um token de reset é válido
- **Corpo da Requisição**:
  ```json
  {
      "token": "token_do_reset",
      "email": "email@dominio.com"
  }
  ```
- **Respostas**:
  - **200 (Token válido)**:
    ```json
    {
        "status": "success",
        "message": "Token válido",
        "data": {
            "email": "email@dominio.com",
            "valid": true
        }
    }
    ```
  - **404 (Token inválido ou expirado)**:
    ```json
    {
        "status": "error",
        "message": "Token inválido ou expirado"
    }
    ```

### 8. Redefinir Senha

- **URL**: `/api/reset-password`  
- **Método**: `POST`  
- **Descrição**: Redefine a senha usando o token de reset
- **Corpo da Requisição**:
  ```json
  {
      "token": "token_do_reset",
      "email": "email@dominio.com",
      "password": "novaSenha123",
      "password_confirmation": "novaSenha123"
  }
  ```
- **Respostas**:
  - **200 (Sucesso)**:
    ```json
    {
        "status": "success",
        "message": "Senha redefinida com sucesso"
    }
    ```
  - **400 (Erro de validação)**:
    ```json
    {
        "status": "error",
        "message": "Erro de validação",
        "erros": {
            "password": ["A confirmação de senha não confere."]
        }
    }
    ```
  - **404 (Token inválido ou expirado)**:
    ```json
    {
        "status": "error",
        "message": "Token inválido ou expirado"
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

## Como executar o projeto

1. Clone o Repositório:
    ```bash
    git clone https://github.com/gabriellgomess/api-login-laravel-11.git
    ```

2. Instale as dependências:
    ```bash
    composer install
    ```

3. Configure o arquivo `.env`:
    ```bash
    cp .env.example .env
    ```

4. Gere a chave da aplicação:
    ```bash
    php artisan key:generate
    ```

5. Execute as migrações:
    ```bash
    php artisan migrate
    ```
6. Execute o seeder para criar usuários de exemplo:
    ```bash
    php artisan db:seed
    ```
7. Implementar a documentação do Swagger ou quando alterá-la
    ```bash
    php artisan l5-swagger:generate
    ```

7. Inicie o servidor:
    ```bash
    php artisan serve
    ```

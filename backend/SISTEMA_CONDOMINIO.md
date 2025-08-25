# 🏢 Sistema de Configuração de Condomínio

Este documento descreve o sistema completo de configuração de condomínio implementado no backend Laravel, incluindo a hierarquia de entidades e funcionalidades disponíveis.

## 🏗️ **Arquitetura do Sistema**

### **Hierarquia das Entidades**
```
Condomínio
├── Bloco/Torre (opcional)
│   └── Unidade (apartamento/casa/sala)
├── Unidade (apartamento/casa/sala) - sem bloco
├── Vagas de Garagem (1..N)
└── Depósitos/Box (0..N)
```

### **Relacionamentos**
- **Condomínio** → **Blocos** (1:N)
- **Condomínio** → **Unidades** (1:N)
- **Condomínio** → **Vagas de Garagem** (1:N)
- **Condomínio** → **Depósitos/Box** (1:N)
- **Bloco** → **Unidades** (1:N)
- **Unidade** → **Vagas de Garagem** (0:N)
- **Unidade** → **Depósitos/Box** (0:N)

## 📊 **Estrutura do Banco de Dados**

### **1. Tabela `condominiums`**
```sql
- id (PK)
- name (nome do condomínio)
- address (endereço completo)
- city (cidade)
- state (estado)
- zip_code (CEP)
- phone (telefone)
- email (email)
- description (descrição)
- active (status ativo/inativo)
- created_at, updated_at
```

### **2. Tabela `blocks`**
```sql
- id (PK)
- condominium_id (FK para condominiums)
- name (nome do bloco/torre)
- description (descrição)
- floors (número de andares)
- units_per_floor (unidades por andar)
- active (status ativo/inativo)
- created_at, updated_at
```

### **3. Tabela `units`**
```sql
- id (PK)
- condominium_id (FK para condominiums)
- block_id (FK para blocks, nullable)
- number (número da unidade)
- type (tipo: apartamento, casa, sala, loja)
- floor (andar)
- area (área em m²)
- bedrooms (número de quartos)
- bathrooms (número de banheiros)
- status (available, occupied, maintenance)
- description (descrição)
- active (status ativo/inativo)
- created_at, updated_at
```

### **4. Tabela `parking_spaces`**
```sql
- id (PK)
- condominium_id (FK para condominiums)
- unit_id (FK para units, nullable)
- number (número da vaga)
- type (car, motorcycle, truck, bicycle)
- location (subsolo, térreo, etc.)
- area (área em m²)
- status (available, occupied, reserved, maintenance)
- description (descrição)
- covered (coberta ou descoberta)
- active (status ativo/inativo)
- created_at, updated_at
```

### **5. Tabela `storage_units`**
```sql
- id (PK)
- condominium_id (FK para condominiums)
- unit_id (FK para units, nullable)
- number (número do depósito)
- type (storage, box, cellar, attic)
- location (subsolo, térreo, etc.)
- area (área em m²)
- height (altura em metros)
- status (available, occupied, reserved, maintenance)
- description (descrição)
- climate_controlled (controle de temperatura)
- active (status ativo/inativo)
- created_at, updated_at
```

## 🚀 **Funcionalidades Implementadas**

### **✅ Condomínios**
- [x] **CRUD Completo**: Criar, Listar, Visualizar, Atualizar, Excluir
- [x] **Filtros**: Busca por nome, endereço, cidade, estado
- [x] **Paginação**: Listagem paginada com configuração de itens por página
- [x] **Validação**: Validação completa dos dados de entrada
- [x] **Soft Delete**: Exclusão lógica (apenas desativa)

### **✅ Blocos/Torres**
- [x] **Modelo Eloquent**: Relacionamentos e scopes
- [x] **Validação**: Regras de negócio implementadas
- [x] **Estatísticas**: Contagem de unidades por status

### **✅ Unidades**
- [x] **Modelo Eloquent**: Relacionamentos completos
- [x] **Scopes**: Filtros por condomínio, bloco, status, tipo
- [x] **Estatísticas**: Contagem de vagas e depósitos vinculados

### **✅ Vagas de Garagem**
- [x] **Modelo Eloquent**: Relacionamentos e scopes
- [x] **Filtros**: Por tipo, status, localização
- [x] **Vinculação**: Pode ser vinculada a unidades específicas

### **✅ Depósitos/Box**
- [x] **Modelo Eloquent**: Relacionamentos e scopes
- [x] **Filtros**: Por tipo, status, localização
- [x] **Controle Climático**: Suporte a depósitos com controle de temperatura

## 🔌 **Endpoints da API**

### **Condomínios**
```http
GET    /api/condominiums          - Listar condomínios
POST   /api/condominiums          - Criar condomínio
GET    /api/condominiums/{id}     - Visualizar condomínio
PUT    /api/condominiums/{id}     - Atualizar condomínio
DELETE /api/condominiums/{id}     - Excluir condomínio
```

### **Parâmetros de Filtro**
```http
GET /api/condominiums?search=Jardim&city=São Paulo&state=SP&page=1&per_page=15
```

## 📱 **Como Usar**

### **1. Executar Migrações**
```bash
php artisan migrate
```

### **2. Executar Seeders**
```bash
php artisan db:seed
```

### **3. Testar a API**
```bash
# Listar condomínios
curl -H "Authorization: Bearer {token}" http://localhost:8000/api/condominiums

# Criar condomínio
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Condomínio","address":"Rua A, 123","city":"São Paulo","state":"SP","zip_code":"01234-567"}' \
  http://localhost:8000/api/condominiums
```

## 🎯 **Exemplos de Uso**

### **Criar Condomínio Completo**
```json
{
    "name": "Residencial Parque das Árvores",
    "address": "Av. das Árvores, 456 - Jardim Botânico",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-890",
    "phone": "(11) 9876-5432",
    "email": "admin@parquedasarvores.com",
    "description": "Condomínio residencial com área verde, piscina e academia"
}
```

### **Resposta da API**
```json
{
    "status": "success",
    "message": "Condomínio criado com sucesso",
    "data": {
        "id": 1,
        "name": "Residencial Parque das Árvores",
        "address": "Av. das Árvores, 456 - Jardim Botânico",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-890",
        "phone": "(11) 9876-5432",
        "email": "admin@parquedasarvores.com",
        "description": "Condomínio residencial com área verde, piscina e academia",
        "active": true,
        "created_at": "2025-01-01T10:00:00.000000Z",
        "updated_at": "2025-01-01T10:00:00.000000Z"
    }
}
```

## 🔒 **Segurança e Validação**

### **Validações Implementadas**
- **Nome**: Obrigatório, máximo 255 caracteres
- **Endereço**: Obrigatório, máximo 500 caracteres
- **Cidade**: Obrigatória, máximo 100 caracteres
- **Estado**: Obrigatório, máximo 2 caracteres
- **CEP**: Obrigatório, máximo 10 caracteres
- **Telefone**: Opcional, máximo 20 caracteres
- **Email**: Opcional, formato válido, máximo 255 caracteres
- **Descrição**: Opcional, máximo 1000 caracteres

### **Autenticação**
- Todos os endpoints requerem autenticação via Laravel Sanctum
- Token deve ser enviado no header `Authorization: Bearer {token}`

## 📊 **Dados de Exemplo (Seeder)**

O seeder cria automaticamente:

### **Condomínio de Exemplo**
- **Nome**: Residencial Jardim das Flores
- **Localização**: São Paulo, SP
- **Endereço**: Rua das Flores, 123 - Jardim Botânico

### **Blocos Criados**
- **Torre A**: 20 andares, 4 unidades por andar (80 unidades)
- **Torre B**: 15 andares, 3 unidades por andar (45 unidades)
- **Bloco C**: 1 andar, 8 casas térreas

### **Unidades Criadas**
- **Total**: 133 unidades
- **Tipos**: Apartamentos e casas
- **Status**: Misturado entre ocupadas e disponíveis

### **Vagas de Garagem**
- **Total**: 100 vagas
- **Tipos**: Carros (80), Motos (10), Caminhões (10)
- **Localização**: Subsolo e térreo

### **Depósitos/Box**
- **Total**: 50 depósitos
- **Tipos**: Storage (30), Box (10), Cellar (10)
- **Controle Climático**: 10 depósitos

## 🔮 **Próximos Passos**

### **1. Controllers Adicionais**
- [ ] **BlockController**: CRUD para blocos/torres
- [ ] **UnitController**: CRUD para unidades
- [ ] **ParkingSpaceController**: CRUD para vagas
- [ ] **StorageUnitController**: CRUD para depósitos

### **2. Funcionalidades Avançadas**
- [ ] **Upload de Imagens**: Fotos dos condomínios e unidades
- [ ] **Documentos**: Contratos, plantas, regulamentos
- [ ] **Notificações**: Sistema de alertas e comunicados
- [ ] **Relatórios**: Estatísticas e análises

### **3. Integração Frontend**
- [ ] **Interface de Gestão**: Dashboard administrativo
- [ ] **Formulários**: Criação e edição de entidades
- [ ] **Visualização**: Mapas e layouts dos condomínios
- [ ] **Responsividade**: Suporte a dispositivos móveis

## 🎉 **Conclusão**

O sistema de configuração de condomínio implementa uma arquitetura robusta e escalável que:

- ✅ **Suporta hierarquia complexa** de entidades
- ✅ **Implementa relacionamentos** entre todas as entidades
- ✅ **Fornece CRUD completo** para condomínios
- ✅ **Inclui validação robusta** de dados
- ✅ **Suporta filtros e paginação** avançados
- ✅ **Implementa soft delete** para segurança
- ✅ **Inclui documentação Swagger** completa
- ✅ **Popula banco com dados** de exemplo
- ✅ **Segue padrões Laravel** de desenvolvimento

Esta implementação serve como base sólida para o desenvolvimento de um sistema completo de gestão de condomínios com controle granular de todas as entidades e relacionamentos.

# Sistema de Gestão Condominial (API Laravel + PWA)

> Documento de requisitos e guia técnico para implementação do **MVP** com visão de evolução.  
> Backend: **Laravel 11** (API REST) • Front: **PWA React** (evolutivo para app nativo)

---

## Sumário
1. [Visão Geral](#visão-geral)  
2. [Arquitetura & Stack](#arquitetura--stack)  
3. [Multi-Tenant & Escopo de Dados](#multi-tenant--escopo-de-dados)  
4. [Papéis (RBAC) & Permissões](#papéis-rbac--permissões)  
5. [Módulos Funcionais](#módulos-funcionais)  
6. [Padrões de API](#padrões-de-api)  
7. [Modelo de Dados (alto nível)](#modelo-de-dados-alto-nível)  
8. [Segurança, LGPD & Auditoria](#segurança-lgpd--auditoria)  
9. [PWA (Front)](#pwa-front)  
10. [Ambientes, Deploy & Observabilidade](#ambientes-deploy--observabilidade)  
11. [Testes & Qualidade](#testes--qualidade)  
12. [Roadmap de Evolução](#roadmap-de-evolução)  
13. [Anexos Úteis](#anexos-úteis)

---

## Visão Geral
Aplicação de gestão condominial com **dados isolados por condomínio**, suporte a **blocos (opcional)** e **unidades** (apartamento/casa/sala).  
As principais capacidades incluem:  
- Gestão de moradores e vínculos  
- Reservas de áreas comuns  
- Ocorrências  
- Comunicados  
- Assembleias/votações  
- Controle de visitantes/entregas (portaria)  
- Documentos  
- **Financeiro básico** (com integração futura a gateways)  

---

## Arquitetura & Stack
- **Backend**: Laravel 11, PHP 8.2+, MySQL 8+, Redis (cache/queues).  
- **Autenticação**: Laravel Sanctum (tokens/abilities), `spatie/laravel-permission`.  
- **API**: REST JSON, versionada em `/api/v1`.  
- **Front**: PWA React (Vite), React Router, Axios, Context/React Query.  
- **Infra**: Docker Compose (dev), Nginx/Apache, TLS (LetsEncrypt).  
- **Observabilidade**: Logs estruturados, Sentry/Logtail, Healthchecks.  

---

## Multi-Tenant & Escopo de Dados
- **MVP**: um único banco com coluna `condominium_id` em todas as tabelas.  
- **Índices únicos escopados** por `condominium_id`.  
- **Policies**/Global Scopes para filtrar sempre por condomínio.  
- **Hierarquia física**: Condomínio → (Bloco opcional) → Unidade → Vagas/Depósitos.  

---

## Papéis (RBAC) & Permissões
**Papéis base**:  
- SuperAdmin  
- Administradora  
- Síndico(a)  
- Portaria/Zelador  
- Morador(a)  

**Opcionais**: Conselho, Financeiro, Prestador, Dependente, Subsíndico.  

**Exemplos de permissions**:  
`condo.manage`, `moradores.manage`, `reservas.rules.manage`, `reservas.approve`, `comunicados.manage`, `ocorrencias.manage`, `assemblies.manage`, `assemblies.vote`, `financeiro.read`, `financeiro.manage`, `visitantes.manage`.

---

## Módulos Funcionais

### 1) Usuários & Unidades
- CRUD de moradores/usuários.  
- Vínculo N:N usuário ↔ unidade (`unit_user`), com histórico.  

### 2) Reservas de Áreas Comuns
- Áreas configuráveis, regras de uso, aprovações.  
- Agenda sem conflitos.  
- Notificação automática.  

### 3) Ocorrências/Reclamações
- Aberta pelo morador, gerida por síndico/administradora.  
- Timeline de status e respostas.  

### 4) Comunicados
- Publicação segmentada por bloco/unidade.  
- Push notification e e-mail.  
- Registro de leitura.  

### 5) Visitantes & Entregas
- Registro de visitantes e check-in/out.  
- Entregas vinculadas à unidade.  
- Notificação ao morador.  

### 6) Assembleias & Votações
- Criação de pautas, votos eletrônicos, atas digitais.  
- Controle de quórum.  

### 7) Documentos
- Upload/download de atas, regimento, comunicados.  
- Controle de permissões.  

### 8) Gestão de Contratos
- Cadastro de contratos (prestadores, fornecedores, manutenção, seguros, locações).  
- Campos: partes envolvidas, datas de início/fim, valores, cláusulas principais.  
- Upload de documento (PDF/Word).  
- Alertas de vencimento/renovação.  
- Integração com módulo financeiro.  

### 9) Financeiro Básico
- Cadastro de cobranças simples (valor, vencimento).  
- Status: pendente, pago, em atraso.  
- Evolução para integração com gateways.  

### 10) Relatórios
- Reservas por período, ocorrências por status, inadimplência, portaria.  
- Export em CSV/Excel.  

### 11) Configurações
- Dados do condomínio, blocos, regras de reservas.  
- Preferências de notificação.  

---

## Padrões de API
- **Base**: `/api/v1`  
- **Autenticação**: Bearer token Sanctum  
- **Formato**: JSON, datas ISO8601, timezone `America/Sao_Paulo`  

**Resposta padrão**
```json
// Sucesso
{ "success": true, "data": { ... } }

// Erro
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

**Paginação & filtros**: `page`, `per_page`, `sort`, `filter[field]`.  

---

## Modelo de Dados (alto nível)
- `condominiums`, `blocks`, `units`  
- `users`, `unit_user`  
- `roles`, `permissions`, pivots  
- `amenities`, `reserves`  
- `occurrences`, `occurrence_comments`  
- `announcements`  
- `visitors`, `deliveries`  
- `assemblies`, `votes`  
- `documents`  
- `billing_documents`  

---

## Segurança, LGPD & Auditoria
- Senhas com Bcrypt/Argon2.  
- Sanctum + abilities; revogação de tokens.  
- Rate limiting por usuário/IP.  
- Logs de auditoria (financeiro, reservas, assembleias).  
- LGPD: base legal clara, consentimento para notificações, portabilidade e exclusão sob demanda.  
- Backups criptografados.  

---

## PWA (Front)
- Autologin + refresh token.  
- Menu dinâmico por papel e condomínio ativo.  
- Push notifications (Web Push).  
- Cache offline de comunicados/agenda.  
- Acessibilidade (WCAG) e i18n.  

---

## Ambientes, Deploy & Observabilidade
- `.env` com DB, cache, queue, Sanctum, frontend URL.  
- CI/CD com testes + migrations.  
- Healthcheck endpoint `/health`.  
- Monitoramento com Sentry/Elastic.  
- Backups diários.  

---

## Testes & Qualidade
- Testes de Feature/HTTP com escopo de `condominium_id`.  
- Factories e seeders para papéis/condomínios/unidades.  
- Collection Postman/Insomnia.  
- Linters (Pint/PHPCS), Larastan.  

---

## Roadmap de Evolução
1. MVP (Auth + RBAC + Moradores + Reservas + Ocorrências + Comunicados + Portaria).  
2. Assembleias e Atas digitais.  
3. Financeiro integrado (Asaas, Gerencianet).  
4. Relatórios avançados e dashboards.  
5. App nativo (Capacitor/React Native).  
6. Integrações externas (CFTV, biometria, bancos).  

---

## Anexos Úteis
**Seeds iniciais**  
```php
['superadmin','administradora','sindico','portaria','morador'];
```

**Permissions**  
```php
['condo.manage','moradores.manage','reservas.rules.manage','reservas.approve',
 'comunicados.manage','ocorrencias.manage','assemblies.manage','assemblies.vote',
 'financeiro.read','financeiro.manage','visitantes.manage'];
```

**Estrutura de pastas**
```
/backend-laravel
/frontend-pwa
/docs (README.md, API.postman_collection.json)
```

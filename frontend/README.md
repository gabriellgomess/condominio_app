# Sistema de Condomínio - Frontend React

## Visão Geral

Sistema de gestão de condomínios desenvolvido em React com Vite, JavaScript e Tailwind CSS. O sistema implementa um controle de acesso baseado em papéis (RBAC) que direciona usuários para áreas específicas baseadas em seu nível de acesso.

## Paleta de Cores

O sistema utiliza uma paleta de cores escura personalizável através de variáveis CSS:

- **Primary**: `#080d08` - Fundo principal escuro
- **Secondary**: `#3dc43d` - Verde para destaque e ações
- **Light**: `#f3f7f1` - Texto e elementos claros
- **White**: `#fff` - Branco puro para contrastes

As cores estão definidas em variáveis CSS para fácil personalização conforme necessidade do cliente.

## Tecnologias Utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **JavaScript** - Linguagem de programação
- **Tailwind CSS** - Framework de CSS utilitário
- **React Router DOM** - Roteamento da aplicação

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ProtectedRoute.jsx      # Rota protegida com verificação de acesso
│   └── UserAreaRouter.jsx      # Roteador para áreas específicas dos usuários
├── contexts/           # Contextos React
│   └── AuthContext.jsx         # Contexto de autenticação
├── pages/              # Páginas da aplicação
│   ├── Home.jsx                # Página inicial
│   ├── Login.jsx               # Página de login
│   ├── AdminDashboard.jsx      # Dashboard do administrador
│   ├── SyndicDashboard.jsx     # Dashboard do síndico
│   ├── ResidentDashboard.jsx   # Dashboard do morador
│   └── EmployeeDashboard.jsx   # Dashboard do funcionário
├── App.jsx             # Componente principal com rotas
├── main.jsx            # Ponto de entrada da aplicação
└── index.css           # Estilos globais e variáveis CSS
```

## Sistema de Autenticação

### Níveis de Acesso

1. **Administrador** (`administrador`)
   - Acesso completo ao sistema
   - Gestão de condomínios, usuários e configurações
   - Relatórios e analytics

2. **Síndico** (`sindico`)
   - Gestão de unidades e moradores
   - Controle de vagas de garagem
   - Comunicação com moradores
   - Relatórios de ocupação

3. **Morador** (`morador`)
   - Visualização de informações da unidade
   - Solicitações de manutenção
   - Acesso a avisos e comunicados
   - Documentos e contratos

4. **Funcionário** (`funcionario`)
   - Gestão de tarefas operacionais
   - Manutenção e limpeza
   - Segurança e rondas
   - Relatórios de performance

### Fluxo de Autenticação

1. Usuário acessa a página de login
2. Credenciais são validadas no backend
3. Backend retorna token e informações de redirecionamento
4. Frontend redireciona para área apropriada baseada no `access_level`
5. Acesso é controlado por rotas protegidas

## Rotas da Aplicação

- `/` - Página inicial (pública)
- `/login` - Página de login (pública)
- `/admin/*` - Área do administrador (protegida)
- `/syndic/*` - Área do síndico (protegida)
- `/resident/*` - Área do morador (protegida)
- `/employee/*` - Área do funcionário (protegida)
- `/dashboard` - Rota padrão que redireciona para área apropriada

## Usuários de Teste

Para testar o sistema, utilize as seguintes credenciais:

- **Síndico**: `sindico@condominio.com` / `123456`
- **Morador**: `morador@condominio.com` / `123456`
- **Funcionário**: `funcionario@condominio.com` / `123456`

## Executando o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### Configuração do Backend

Certifique-se de que o backend Laravel esteja rodando na porta 8000:

```bash
# No diretório backend
php artisan serve
```

## Personalização

### Cores

Para alterar as cores do sistema, edite as variáveis CSS em `src/index.css`:

```css
:root {
  --color-primary: #080d08;      /* Fundo principal */
  --color-secondary: #3dc43d;    /* Cor de destaque */
  --color-light: #f3f7f1;       /* Texto claro */
  --color-white: #fff;           /* Branco */
}
```

### Tailwind CSS

As cores personalizadas estão configuradas no `tailwind.config.js` e podem ser utilizadas com as classes:

- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-light`, `text-light`, `border-light`
- `bg-white`, `text-white`, `border-white`

## Funcionalidades Principais

### Dashboard do Administrador
- Visão geral do sistema
- Gestão de condomínios
- Gestão de usuários
- Relatórios e analytics
- Configurações do sistema

### Dashboard do Síndico
- Gestão de unidades
- Controle de moradores
- Gestão de vagas
- Comunicação
- Relatórios de ocupação

### Dashboard do Morador
- Informações da unidade
- Avisos e comunicados
- Solicitações de manutenção
- Documentos e contratos
- Contato e suporte

### Dashboard do Funcionário
- Tarefas operacionais
- Manutenção
- Limpeza e conservação
- Segurança
- Relatórios de performance

## Segurança

- Rotas protegidas com verificação de autenticação
- Controle de acesso baseado em papéis
- Tokens JWT para autenticação
- Redirecionamento automático para áreas apropriadas
- Proteção contra acesso não autorizado

## Desenvolvimento

### Estrutura de Componentes

O sistema utiliza uma arquitetura baseada em componentes com:

- **Contextos** para gerenciamento de estado global
- **Componentes reutilizáveis** para funcionalidades comuns
- **Páginas** específicas para cada tipo de usuário
- **Rotas protegidas** para controle de acesso

### Padrões Utilizados

- **Hooks personalizados** para lógica de negócio
- **Context API** para gerenciamento de estado
- **Componentes funcionais** com hooks
- **CSS-in-JS** com Tailwind CSS
- **Roteamento declarativo** com React Router

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste localmente
5. Envie um pull request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

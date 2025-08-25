# Frontend de Autenticação - Sistema de Condomínio

Este é um frontend provisório desenvolvido para testar as rotas de autenticação da API Laravel. Ele foi construído com HTML, CSS, JavaScript e Tailwind CSS.

## 🚀 Funcionalidades

### ✅ Autenticação Completa
- **Login**: Autenticação de usuários existentes
- **Registro**: Cadastro de novos usuários com níveis de acesso
- **Reset de Senha**: Sistema completo de recuperação de senha
- **Perfil**: Visualização e gerenciamento do perfil do usuário
- **Logout**: Encerramento seguro da sessão

### 🎯 **Sistema de Redirecionamento por Papéis**
- **Redirecionamento Automático**: Cada usuário é direcionado para sua área específica
- **Dashboards Personalizados**: Interface adaptada ao nível de acesso
- **Menu Dinâmico**: Itens de menu baseados em permissões
- **Controle de Acesso**: Validação server-side de permissões

### 🎨 Interface Moderna
- Design responsivo com Tailwind CSS
- Animações suaves e transições
- Suporte a modo escuro automático
- Ícones intuitivos e feedback visual
- Mensagens de status em tempo real

### 🔧 Recursos Técnicos
- Gerenciamento de estado com JavaScript ES6+
- Armazenamento local de tokens (localStorage)
- Validação de formulários em tempo real
- Tratamento de erros robusto
- Teste automático de conexão com a API

## 📁 Estrutura de Arquivos

```
frontend/
├── index.html          # Página principal
├── styles.css          # Estilos personalizados
├── script.js           # Lógica da aplicação
├── config.js           # Configurações centralizadas
├── email-config.md     # Configurações específicas de email
└── README.md           # Esta documentação
```

## 🛠️ Como Usar

### 1. Pré-requisitos
- Backend Laravel rodando em `http://localhost:8000`
- Navegador moderno com suporte a ES6+
- Conexão com a internet (para carregar Tailwind CSS)

### 2. Execução
1. Abra o arquivo `index.html` em qualquer navegador
2. Ou use um servidor local:
   ```bash
   # Python 3
   python -m http.server 8001
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8001
   ```

### 3. Acesso
- **URL Local**: `http://localhost:8001` (ou porta escolhida)
- **URL Direta**: Abrir `index.html` diretamente no navegador

## 👥 Usuários de Teste

O sistema inclui usuários pré-cadastrados para testes:

| Email | Senha | Nível | Descrição |
|-------|-------|-------|-----------|
| `admin@condominio.com` | `123456` | Administrador | Acesso total |
| `sindico@condominio.com` | `123456` | Síndico | Gerenciamento |
| `morador@condominio.com` | `123456` | Morador | Acesso básico |
| `funcionario@condominio.com` | `123456` | Funcionário | Acesso limitado |

## 🔑 Fluxo de Reset de Senha

### Passo 1: Solicitar Reset
1. Acesse a aba "Reset de Senha"
2. Digite seu e-mail
3. Clique em "Solicitar Reset"
4. **IMPORTANTE**: Verifique sua caixa de entrada (e pasta spam)
5. **Desenvolvimento**: Token também é exibido no console para testes

### Passo 2: Redefinir Senha
1. O sistema automaticamente preenche o token
2. Digite sua nova senha (mínimo 6 caracteres)
3. Confirme a nova senha
4. Clique em "Redefinir Senha"

### ⚠️ Nota sobre Tokens
- **Sistema de Email Ativo**: Tokens são enviados por email via SMTP (Hostinger)
- **Verificação**: Tokens expiram em 60 minutos
- **Desenvolvimento**: Tokens também são exibidos no console para facilitar testes
- **Produção**: Apenas emails são enviados, sem exibição no console

## 🎯 Endpoints Testados

O frontend testa todos os endpoints de autenticação:

- `POST /api/register` - Registro de usuário
- `POST /api/login` - Login de usuário (com redirecionamento automático)
- `POST /api/forgot-password` - Solicitar reset de senha
- `POST /api/verify-reset-token` - Verificar token (não implementado na UI)
- `POST /api/reset-password` - Redefinir senha
- `GET /api/profile` - Perfil do usuário
- `POST /api/logout` - Logout do usuário
- `GET /api/access-levels` - Níveis de acesso disponíveis
- `GET /api/redirect-info` - Informações de redirecionamento do usuário atual

## ⌨️ Atalhos de Teclado

- **Ctrl + K**: Ir direto para a tela de login
- **Tab**: Navegar entre campos de formulário
- **Enter**: Submeter formulários

## 🐛 Debug e Desenvolvimento

### Console do Navegador
- Abra as ferramentas de desenvolvedor (F12)
- Verifique a aba "Console" para logs detalhados
- Tokens de reset são exibidos no console

### Variável Global
- Acesse `window.authSystem` no console para debug
- Útil para testar métodos e verificar estado

### Logs Automáticos
- Conexão com a API é testada automaticamente
- Erros são exibidos em tempo real
- Status de todas as operações é logado

## 🎨 Personalização

### Cores e Temas
- Edite `styles.css` para alterar cores
- Modifique classes Tailwind no HTML
- Suporte automático a modo escuro

### Validações
- Validações básicas estão em `script.js`
- Adicione validações customizadas conforme necessário
- Mensagens de erro são personalizáveis

### Responsividade
- Layout responsivo com Tailwind CSS
- Breakpoints configurados para mobile
- Teste em diferentes tamanhos de tela

## 🔒 Segurança

### Tokens
- Tokens são armazenados no localStorage
- Logout remove tokens automaticamente
- Validação de tokens em cada requisição

### Sistema de Email
- **SMTP Configurado**: Hostinger com SSL (porta 465)
- **Remetente**: suporte@nexustech.net.br
- **Expiração**: Tokens expiram em 60 minutos
- **Segurança**: Emails são enviados via conexão criptografada SSL
- **Documentação**: Consulte `email-config.md` para detalhes completos

### Validação
- Validação client-side para melhor UX
- Validação server-side para segurança
- Sanitização de inputs básica

### CORS
- Configure CORS no backend Laravel se necessário
- Frontend faz requisições para `http://localhost:8000`

## 🚨 Troubleshooting

### Problemas Comuns

1. **API não conecta**
   - Verifique se o backend está rodando
   - Confirme a URL em `script.js` (linha 3)
   - Verifique logs no console do navegador

2. **Token não funciona**
   - Tokens expiram em 60 minutos
   - Verifique se o email foi recebido (caixa de entrada e spam)
   - Copie o token completo do email ou console (desenvolvimento)
   - Verifique se o e-mail está correto

3. **Formulário não submete**
   - Verifique se todos os campos obrigatórios estão preenchidos
   - Confirme se a senha tem pelo menos 6 caracteres
   - Verifique logs de erro no console

4. **Interface não carrega**
   - Verifique se todos os arquivos estão na mesma pasta
   - Confirme se o Tailwind CSS está carregando
   - Teste em navegador diferente

### Logs Úteis
- Console do navegador (F12)
- Network tab para ver requisições
- Application tab para verificar localStorage

### Problemas com Email
- **Email não recebido**: Verifique pasta spam e configurações de filtro
- **Erro SMTP**: Verifique logs do Laravel em `storage/logs/laravel.log`
- **Timeout**: Verifique configurações de rede e firewall
- **Autenticação**: Confirme credenciais SMTP no arquivo `.env`

## 🔮 Próximos Passos

### Melhorias Sugeridas
- [x] ✅ Sistema de redirecionamento por papéis implementado
- [ ] Implementar verificação de token na UI
- [ ] Adicionar validação de força de senha
- [ ] Implementar refresh automático de tokens
- [ ] Adicionar testes automatizados
- [ ] Implementar PWA (Progressive Web App)

### 🚀 **Funcionalidades Implementadas**
- [x] ✅ Redirecionamento automático baseado em nível de acesso
- [x] ✅ Dashboards personalizados por papel
- [x] ✅ Menu dinâmico baseado em permissões
- [x] ✅ Controle de acesso server-side
- [x] ✅ Interface adaptativa por usuário

### Integração
- [ ] Conectar com sistema de notificações
- [ ] Integrar com dashboard principal
- [ ] Adicionar autenticação social
- [ ] Implementar 2FA (Two-Factor Authentication)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte os logs no console
3. Teste com usuários de exemplo
4. Verifique se o backend está funcionando

---

**Desenvolvido para testes de API - Sistema de Condomínio** 🏢

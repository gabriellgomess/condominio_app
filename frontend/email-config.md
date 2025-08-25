# Configuração do Sistema de Email - Frontend

## 📧 Configurações SMTP Ativas

### Backend Laravel (.env)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=suporte@nexustech.net.br
MAIL_PASSWORD=Isadopai12345@
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=suporte@nexustech.net.br
MAIL_FROM_NAME="${APP_NAME}"
```

### Detalhes da Configuração
- **Provedor**: Hostinger
- **Protocolo**: SMTP com SSL
- **Porta**: 465 (SSL)
- **Remetente**: suporte@nexustech.net.br
- **Criptografia**: SSL/TLS

## 🔄 Fluxo de Reset de Senha

### 1. Usuário Solicita Reset
- Frontend envia email para `/api/forgot-password`
- Backend valida email e gera token único
- **Email é enviado via SMTP** para o usuário
- Token é armazenado no banco com timestamp

### 2. Usuário Recebe Email
- Email contém token de reset
- **Link direto** para reset de senha
- Instruções claras sobre o processo
- Aviso de expiração (60 minutos)

### 3. Usuário Redefine Senha
- Copia token do email
- Acessa frontend de reset
- Insere nova senha
- Confirma nova senha
- Token é validado e senha é atualizada

## 📱 Interface do Frontend

### Informações Exibidas
- ✅ **Sistema de Email Ativo** - Indica que emails reais são enviados
- 📧 **Verificação de Caixa de Entrada** - Orienta o usuário
- ⏰ **Expiração de Token** - 60 minutos
- 🔒 **Segurança SSL** - Conexão criptografada

### Mensagens de Status
- **Sucesso**: "Email de reset enviado! Verifique sua caixa de entrada."
- **Erro**: "Erro ao solicitar reset de senha"
- **Validação**: "Por favor, informe seu e-mail"

## 🛠️ Desenvolvimento vs Produção

### Desenvolvimento
- Emails são enviados via SMTP real
- Tokens são exibidos no console para facilitar testes
- Logs detalhados no console do navegador
- Configuração de debug ativa

### Produção
- Emails são enviados via SMTP real
- **Nenhum token é exibido no console**
- Logs mínimos para segurança
- Configuração de debug desativada

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Email Não Recebido
- **Verificar pasta spam**
- **Verificar filtros de email**
- **Confirmar endereço de email**
- **Verificar logs do Laravel**

#### 2. Erro de Conexão SMTP
- **Verificar credenciais** no .env
- **Confirmar porta 465** (SSL)
- **Verificar firewall** e rede
- **Testar conexão** manual

#### 3. Token Inválido
- **Verificar expiração** (60 minutos)
- **Copiar token completo** do email
- **Confirmar email** correto
- **Verificar formato** do token

### Logs Úteis

#### Frontend (Console)
```javascript
// Verificar se email foi enviado
console.log('📧 Email de reset enviado para:', email);

// Verificar token (desenvolvimento)
console.log('🔑 Token de Reset (desenvolvimento):', token);

// Verificar URL de reset
console.log('🔗 URL de Reset:', resetUrl);
```

#### Backend (Laravel)
```bash
# Logs de email
tail -f storage/logs/laravel.log | grep -i mail

# Logs de erro SMTP
tail -f storage/logs/laravel.log | grep -i smtp

# Logs de reset de senha
tail -f storage/logs/laravel.log | grep -i password
```

## 🚀 Melhorias Futuras

### Funcionalidades Sugeridas
- [ ] **Template de Email Personalizado** - HTML responsivo
- [ ] **Notificações Push** - Alertas em tempo real
- [ ] **Histórico de Emails** - Log de envios
- [ ] **Rate Limiting** - Limitar tentativas de reset
- [ ] **2FA por Email** - Código de verificação

### Segurança
- [ ] **Auditoria de Tokens** - Log de uso
- [ ] **Blacklist de IPs** - Bloquear tentativas suspeitas
- [ ] **Validação de Email** - Verificar domínio
- [ ] **Criptografia de Tokens** - Hash adicional

## 📞 Suporte

### Para Problemas de Email
1. **Verificar logs** do Laravel
2. **Testar conexão SMTP** manualmente
3. **Confirmar credenciais** no .env
4. **Verificar configurações** do provedor

### Contatos
- **Desenvolvedor**: Equipe de desenvolvimento
- **Provedor SMTP**: Hostinger
- **Documentação**: Este arquivo e README.md

---

**Configuração Ativa - Sistema de Condomínio** 🏢📧


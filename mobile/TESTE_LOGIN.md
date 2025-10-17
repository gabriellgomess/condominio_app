# 🔐 Teste de Login - Instruções Completas

## ✅ O que foi corrigido:

1. **Backend configurado corretamente:**
   - Agora está rodando em `0.0.0.0:8000` (aceita conexões externas)
   - Antes estava em `127.0.0.1:8000` (apenas localhost)

2. **URL da API configurada:**
   - Configurada para: `http://10.120.1.11:8000/api`
   - Este é o IP da sua máquina na rede WiFi

3. **Melhorias no tratamento de erro:**
   - Mensagens de erro mais detalhadas
   - Logs no console para debug
   - Diferenciação entre erro de rede e erro de API

## 🚀 Como testar agora:

### Passo 1: Manter o Backend Rodando

O backend já está rodando em background com o comando correto:
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

**IMPORTANTE:** Não feche o terminal do backend!

### Passo 2: Iniciar o App Mobile

Abra um **NOVO terminal** e execute:

```bash
cd mobile
npm start
```

### Passo 3: Conectar no Celular

1. **Certifique-se de que o celular está na mesma rede WiFi**
   - Seu PC está na rede com IP: 10.120.1.11
   - O celular deve estar na MESMA rede

2. **Abra o Expo Go** (já instalado)

3. **Escaneie o QR Code** que apareceu no terminal

4. **Aguarde o app carregar** (pode demorar na primeira vez)

### Passo 4: Testar o Login

1. Digite o e-mail e senha que você usa no sistema web
2. Clique em "Entrar"
3. Observe as mensagens de erro (agora estão mais detalhadas)

## 🔍 Como ver os logs:

### No Terminal Expo:
- Os logs do app aparecem no terminal onde você executou `npm start`

### No Celular (Expo Go):
- Agite o celular
- Toque em "Show Performance Monitor"
- Ou veja os logs no terminal

### Logs que vão aparecer:
```
Tentando login com: seu@email.com
URL da API: http://10.120.1.11:8000/api
```

Se der erro, vai mostrar exatamente qual foi o problema.

## ⚠️ Possíveis Erros e Soluções:

### 1. "Network request failed" ou "Não foi possível conectar ao servidor"

**Causa:** O celular não consegue acessar o backend

**Soluções:**
- Verifique se celular e PC estão na MESMA rede WiFi
- Teste no navegador do celular: `http://10.120.1.11:8000/api/access-levels`
- Se não funcionar no navegador:
  - Firewall pode estar bloqueando
  - Antivírus pode estar bloqueando
  - Tente desativar temporariamente

### 2. "Credenciais inválidas" ou "Status: 401"

**Causa:** E-mail ou senha incorretos

**Solução:**
- Verifique se está usando o mesmo e-mail/senha do sistema web
- Teste fazer login no sistema web primeiro: `http://localhost:8000/login`

### 3. "Status: 422" - Validation Error

**Causa:** Campos inválidos

**Solução:**
- Verifique se o e-mail está no formato correto
- Verifique se a senha tem o mínimo de caracteres

### 4. App não carrega no Expo Go

**Causa:** Problema de rede ou cache

**Soluções:**
- No terminal, pressione `r` para recarregar
- Ou pressione `c` para limpar cache
- Feche o Expo Go e abra novamente
- Reinicie o servidor: Ctrl+C e `npm start` novamente

## 🧪 Teste Rápido da API

Para garantir que o backend está acessível do celular:

1. **No navegador do CELULAR**, acesse:
   ```
   http://10.120.1.11:8000/api/access-levels
   ```

2. **Deve retornar JSON com:**
   ```json
   {
     "status": "success",
     "message": "Níveis de acesso disponíveis",
     "data": [...]
   }
   ```

3. **Se não funcionar:**
   - Celular não está na mesma rede
   - Firewall bloqueando
   - Backend não está rodando corretamente

## 📱 Verificar Conexão WiFi

**No PC:**
```bash
ipconfig
```
Procure por "Endereço IPv4" na interface WiFi (deve ser 10.120.1.11)

**No Celular:**
- Configurações > WiFi
- Toque na rede conectada
- Verifique o IP (deve começar com 10.120.x.x)

## 🔧 Comandos Úteis

### Reiniciar o Backend:
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Reiniciar o App:
```bash
cd mobile
npm start
```

### Limpar Cache do Expo:
```bash
cd mobile
npm start -- --clear
```

## 📊 Próximos Passos

Após o login funcionar:
1. ✅ Você verá a tela Home com suas informações
2. ✅ Poderá fazer logout
3. 🔜 Começaremos a adicionar funcionalidades:
   - Comunicados
   - Reservas
   - Ocorrências
   - Perfil

## 🆘 Se ainda não funcionar:

1. **Tire prints das mensagens de erro** exatas
2. **Copie os logs do console**
3. **Verifique se consegue acessar a API do navegador do celular**
4. Me informe o resultado dos testes acima

---

**Última atualização:** Backend configurado para aceitar conexões externas ✅

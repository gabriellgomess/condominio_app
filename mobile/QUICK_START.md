# 🚀 Guia Rápido - Executar no Android

## ✅ Status Atual
- ✅ Servidor Expo iniciado
- ✅ API configurada para: `http://10.120.1.11:8000/api`
- ⏳ Aguardando execução no Android

## 📱 Opções para executar:

### Opção 1: Dispositivo Físico Android (MAIS FÁCIL)

1. **Instale o Expo Go no seu celular:**
   - Acesse a Google Play Store
   - Procure por "Expo Go"
   - Instale o aplicativo

2. **Conecte-se à mesma rede WiFi:**
   - Certifique-se de que seu celular está na mesma rede WiFi que seu computador
   - Rede atual do PC: WiFi (10.120.1.11)

3. **Escaneie o QR Code:**
   - Abra o Expo Go no celular
   - Toque em "Scan QR Code"
   - Escaneie o QR Code que apareceu no terminal
   - OU: Você verá uma URL como `exp://10.120.1.11:8081` - digite manualmente no Expo Go

4. **Aguarde o build:**
   - O app será compilado e carregado
   - Pode levar alguns minutos na primeira vez

### Opção 2: Emulador Android

1. **Certifique-se de que o Android Studio está instalado**

2. **Inicie o emulador:**
   - Abra o Android Studio
   - Vá em "Device Manager"
   - Inicie um emulador Android

3. **Execute o comando:**
   ```bash
   cd mobile
   npm run android
   ```

4. **IMPORTANTE:** Se usar emulador, mude a URL da API:
   - Edite `src/services/api.js`
   - Altere para: `const API_URL = 'http://10.0.2.2:8000/api';`
   - O 10.0.2.2 é como o emulador acessa o localhost da máquina host

### Opção 3: Comando Direto (se tiver dispositivo conectado via USB)

1. **Ative depuração USB no Android:**
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Volte e entre em "Opções do desenvolvedor"
   - Ative "Depuração USB"

2. **Conecte o celular via USB**

3. **Execute:**
   ```bash
   cd mobile
   npm run android
   ```

## 🔍 Verificar Status

Para ver os logs do servidor Expo, observe o terminal onde executou `npm start`

## ⚠️ Problemas Comuns

### "Network request failed"
- Verifique se o backend Laravel está rodando: `http://10.120.1.11:8000`
- Teste no navegador do celular: acesse `http://10.120.1.11:8000/api/access-levels`
- Se não funcionar, pode ser firewall bloqueando

### "Unable to connect to Metro"
- Certifique-se de estar na mesma rede WiFi
- Reinicie o servidor: Ctrl+C e execute `npm start` novamente

### QR Code não aparece
- Pressione `w` no terminal para abrir no navegador
- Pressione `r` para recarregar
- Pressione `a` para abrir no Android (se tiver emulador)

## 🎯 Credenciais de Teste

Use as credenciais que você cadastrou no backend para fazer login.

## 🔧 Comandos Úteis no Terminal Expo

Quando o servidor Expo estiver rodando, você pode pressionar:
- `a` - Abrir no Android
- `i` - Abrir no iOS (apenas macOS)
- `w` - Abrir no navegador web
- `r` - Recarregar app
- `m` - Alternar menu
- `j` - Abrir DevTools
- `c` - Limpar cache e reload
- `Ctrl+C` - Parar o servidor

## ✨ Próximos Passos

Após conseguir executar:
1. Teste o login com suas credenciais
2. Verifique se a tela Home aparece corretamente
3. Teste o logout
4. Depois podemos adicionar mais funcionalidades!

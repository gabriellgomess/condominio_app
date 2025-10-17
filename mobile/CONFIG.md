# Configuração do App Mobile

## 🔧 Configuração da API

### 1. Configurar URL da API

Edite o arquivo `src/services/api.js` e altere a constante `API_URL`:

```javascript
const API_URL = 'http://SEU_IP:8000/api';
```

### 2. Descobrir seu IP local

**Windows:**
```bash
ipconfig
```
Procure por "Endereço IPv4" (geralmente algo como 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig
```
ou
```bash
hostname -I
```

### 3. URLs para diferentes ambientes

- **Desenvolvimento Local (dispositivo físico):**
  ```javascript
  const API_URL = 'http://192.168.1.100:8000/api'; // Use seu IP
  ```

- **Emulador Android:**
  ```javascript
  const API_URL = 'http://10.0.2.2:8000/api';
  ```

- **Emulador iOS:**
  ```javascript
  const API_URL = 'http://localhost:8000/api';
  ```

- **Produção:**
  ```javascript
  const API_URL = 'https://api.seudominio.com/api';
  ```

## 🚀 Iniciando o Backend

Certifique-se de que o backend Laravel está rodando:

```bash
cd backend
php artisan serve
```

Ou se quiser especificar o host:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Isso permite que o servidor seja acessível de outros dispositivos na mesma rede.

## 📱 Testando no Dispositivo Físico

### Android

1. Ative o modo desenvolvedor no Android
2. Conecte o dispositivo via USB
3. Execute: `npm run android`

### iOS (apenas macOS)

1. Abra o Xcode
2. Configure o certificado de desenvolvedor
3. Execute: `npm run ios`

### Expo Go (mais fácil)

1. Instale o Expo Go no smartphone
2. Execute: `npm start`
3. Escaneie o QR Code

## 🔐 Configurações de Segurança

### CORS no Backend

Certifique-se de que o backend Laravel permite requisições do app mobile.

Edite `backend/config/cors.php`:

```php
'allowed_origins' => ['*'], // Em produção, especifique os domínios permitidos
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### HTTPS em Produção

Em produção, sempre use HTTPS para proteger os dados dos usuários.

## 🐛 Troubleshooting

### Erro de conexão com a API

1. Verifique se o backend está rodando
2. Verifique se está usando o IP correto
3. Desative firewall/antivírus temporariamente para testar
4. Certifique-se de que estão na mesma rede WiFi

### App não conecta no dispositivo físico

1. Backend deve estar rodando com `--host=0.0.0.0`
2. Dispositivo e computador devem estar na mesma rede
3. Firewall pode estar bloqueando a porta 8000

### Erro "Network request failed"

1. Verifique a URL da API em `src/services/api.js`
2. Teste a URL no navegador do celular
3. Verifique se o backend aceita requisições externas

## 📝 Variáveis de Ambiente (Futuro)

Para facilitar, você pode criar um arquivo `.env`:

```env
API_URL=http://192.168.1.100:8000/api
```

E instalar o pacote:
```bash
npm install react-native-dotenv
```

Mas por enquanto, a configuração manual em `api.js` é suficiente.

# Condomínio App - Mobile

Aplicativo mobile em React Native para gerenciamento de condomínios.

## 🚀 Tecnologias

- React Native
- Expo
- React Navigation
- Axios
- AsyncStorage

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI (instalado globalmente): `npm install -g expo-cli`
- Para iOS: Xcode (apenas em macOS)
- Para Android: Android Studio

## 🔧 Instalação

1. Entre no diretório do projeto:
```bash
cd mobile
```

2. Instale as dependências:
```bash
npm install
```

## ⚙️ Configuração

### API URL

Antes de executar o app, configure a URL da API no arquivo `src/services/api.js`:

```javascript
const API_URL = 'http://SEU_IP:8000/api';
```

**Importante:**
- Para testar no dispositivo físico, use o IP da sua máquina (ex: `http://192.168.1.100:8000/api`)
- Para emulador Android, você pode usar `http://10.0.2.2:8000/api`
- Para emulador iOS, pode usar `http://localhost:8000/api`

## 🎯 Executar o Projeto

### Modo de Desenvolvimento

```bash
npm start
```

Isso abrirá o Expo DevTools no navegador. A partir daí você pode:

### Executar no Android

```bash
npm run android
```

Ou pressione `a` no terminal após `npm start`

### Executar no iOS (apenas macOS)

```bash
npm run ios
```

Ou pressione `i` no terminal após `npm start`

### Executar no Navegador Web

```bash
npm run web
```

### Usar o Expo Go

1. Instale o app Expo Go no seu smartphone:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Execute `npm start`

3. Escaneie o QR Code que aparecer:
   - Android: Use o próprio app Expo Go para escanear
   - iOS: Use a câmera nativa do iPhone

## 📱 Funcionalidades Implementadas

### ✅ Versão 1.0 (Atual)

- **Autenticação**
  - Login com e-mail e senha
  - Armazenamento seguro do token
  - Logout
  - Redirecionamento automático baseado no estado de autenticação

- **Interface**
  - Tela de Login
  - Tela Home com informações do usuário
  - Navegação básica

### 🔜 Próximas Funcionalidades

- Comunicados
- Reservas de Espaços
- Ocorrências
- Perfil do Usuário
- Notificações Push
- E muito mais...

## 📁 Estrutura do Projeto

```
mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── context/         # Context API (AuthContext, etc)
│   ├── navigation/      # Configuração de navegação
│   ├── screens/         # Telas do app
│   ├── services/        # Serviços (API, Auth, etc)
│   └── utils/           # Funções utilitárias
├── App.js              # Componente principal
└── package.json        # Dependências
```

## 🔐 Autenticação

O app usa tokens Bearer para autenticação. O fluxo é:

1. Usuário faz login com e-mail e senha
2. API retorna token e dados do usuário
3. Token é armazenado no AsyncStorage
4. Token é incluído automaticamente em todas as requisições
5. Em caso de token expirado (401), usuário é deslogado automaticamente

## 🐛 Debug

### Visualizar logs

```bash
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

### Reload do App

- Android: Pressione `R` duas vezes ou `Ctrl+M` (ou cmd+M no Mac) e selecione "Reload"
- iOS: Pressione `Cmd+R` no simulador

### Limpar cache

```bash
npm start -- --clear
```

## 📝 Credenciais de Teste

Use as credenciais cadastradas no backend para testar o login.

## 🤝 Contribuindo

1. Faça suas alterações
2. Teste em ambas as plataformas (Android e iOS) se possível
3. Commit e push das alterações

## 📄 Licença

Este projeto é privado e confidencial.

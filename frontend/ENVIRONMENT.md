# Configuração de Ambiente

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto frontend com as seguintes variáveis:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=Sistema Condomínio
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG=true
```

## Configuração Centralizada

O projeto agora usa uma configuração centralizada em `src/config/environment.js` que:

1. **Padroniza** todas as chamadas de API
2. **Fornece fallbacks** para desenvolvimento
3. **Centraliza** URLs específicas como contratos
4. **Facilita** mudanças de ambiente

## Como Usar

### Em Serviços:
```javascript
import config from '../config/environment.js';

// Usar URL base
const response = await fetch(`${config.API_BASE_URL}/endpoint`);

// Usar URLs específicas
const contractUrl = config.getContractUrl(supplierId);
```

### Em Componentes:
```javascript
import config from '../config/environment.js';

// Acessar configurações
console.log(config.APP_NAME);
console.log(config.DEBUG);
```

## Benefícios

- ✅ **Consistência**: Todas as chamadas usam a mesma configuração
- ✅ **Flexibilidade**: Fácil mudança entre ambientes
- ✅ **Manutenibilidade**: Um local para gerenciar URLs
- ✅ **Fallbacks**: Funciona mesmo sem arquivo .env

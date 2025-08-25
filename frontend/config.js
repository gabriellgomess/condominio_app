// Configurações do Frontend de Autenticação
const CONFIG = {
    // URL da API Backend
    API_BASE_URL: 'http://localhost:8000/api',
    
    // Configurações de UI
    UI: {
        // Tempo de exibição das mensagens de status (em ms)
        STATUS_MESSAGE_DURATION: 5000,
        
        // Tempo de transição entre seções (em ms)
        SECTION_TRANSITION_DELAY: 1000,
        
        // Habilitar modo escuro automático
        AUTO_DARK_MODE: true,
        
        // Habilitar animações
        ENABLE_ANIMATIONS: true,
        
        // Habilitar atalhos de teclado
        ENABLE_KEYBOARD_SHORTCUTS: true,
    },
    
    // Configurações de validação
    VALIDATION: {
        // Comprimento mínimo da senha
        MIN_PASSWORD_LENGTH: 6,
        
        // Comprimento máximo da senha
        MAX_PASSWORD_LENGTH: 128,
        
        // Comprimento mínimo do nome
        MIN_NAME_LENGTH: 2,
        
        // Comprimento máximo do nome
        MAX_NAME_LENGTH: 100,
    },
    
    // Configurações de segurança
    SECURITY: {
        // Habilitar armazenamento local de tokens
        ENABLE_LOCAL_STORAGE: true,
        
        // Nome da chave no localStorage
        TOKEN_STORAGE_KEY: 'authToken',
        
        // Habilitar auto-logout em inatividade (em ms)
        AUTO_LOGOUT_TIMEOUT: 30 * 60 * 1000, // 30 minutos
        
        // Habilitar refresh automático de tokens
        ENABLE_TOKEN_REFRESH: false,
    },
    
    // Configurações de debug
    DEBUG: {
        // Habilitar logs no console
        ENABLE_CONSOLE_LOGS: true,
        
        // Habilitar logs de API
        ENABLE_API_LOGS: true,
        
        // Habilitar logs de validação
        ENABLE_VALIDATION_LOGS: true,
        
        // Expor sistema de autenticação globalmente
        EXPOSE_AUTH_SYSTEM: true,
    },
    
    // Mensagens personalizadas
    MESSAGES: {
        SUCCESS: {
            LOGIN: 'Login realizado com sucesso!',
            REGISTER: 'Usuário cadastrado com sucesso!',
            RESET_REQUEST: 'Email de reset enviado! Verifique sua caixa de entrada.',
            RESET_PASSWORD: 'Senha redefinida com sucesso!',
            LOGOUT: 'Logout realizado com sucesso!',
        },
        ERROR: {
            LOGIN: 'Erro ao fazer login',
            REGISTER: 'Erro ao cadastrar usuário',
            RESET_REQUEST: 'Erro ao solicitar reset de senha',
            RESET_PASSWORD: 'Erro ao redefinir senha',
            API_CONNECTION: 'Erro ao conectar com a API. Verifique se o backend está rodando.',
            VALIDATION: 'Por favor, preencha todos os campos obrigatórios',
            PASSWORD_MISMATCH: 'As senhas não coincidem',
            PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 6 caracteres',
            EMAIL_REQUIRED: 'Por favor, informe seu e-mail',
        },
        INFO: {
            LOADING: 'Carregando...',
            CONNECTING: 'Conectando...',
            PROCESSING: 'Processando...',
        }
    },
    
    // Configurações de API
    API: {
        // Timeout das requisições (em ms)
        REQUEST_TIMEOUT: 10000,
        
        // Headers padrão
        DEFAULT_HEADERS: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        
        // Endpoints
        ENDPOINTS: {
            LOGIN: '/login',
            REGISTER: '/register',
            LOGOUT: '/logout',
            PROFILE: '/profile',
            FORGOT_PASSWORD: '/forgot-password',
            RESET_PASSWORD: '/reset-password',
            VERIFY_RESET_TOKEN: '/verify-reset-token',
            ACCESS_LEVELS: '/access-levels',
        },
        
        // Códigos de status HTTP
        STATUS_CODES: {
            SUCCESS: 200,
            CREATED: 201,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            UNPROCESSABLE_ENTITY: 422,
            INTERNAL_SERVER_ERROR: 500,
        }
    },
    
    // Configurações de usuários de teste
    TEST_USERS: {
        ADMIN: {
            email: 'admin@condominio.com',
            password: '123456',
            level: 'Administrador',
            description: 'Acesso total'
        },
        SINDICO: {
            email: 'sindico@condominio.com',
            password: '123456',
            level: 'Síndico',
            description: 'Gerenciamento'
        },
        MORADOR: {
            email: 'morador@condominio.com',
            password: '123456',
            level: 'Morador',
            description: 'Acesso básico'
        },
        FUNCIONARIO: {
            email: 'funcionario@condominio.com',
            password: '123456',
            level: 'Funcionário',
            description: 'Acesso limitado'
        }
    },
    
    // Configurações de níveis de acesso
    ACCESS_LEVELS: {
        ADMINISTRADOR: {
            value: 'administrador',
            label: 'Administrador',
            description: 'Acesso total ao sistema',
            color: 'access-level-administrador',
            icon: '👑'
        },
        SINDICO: {
            value: 'sindico',
            label: 'Síndico',
            description: 'Gerenciamento do condomínio',
            color: 'access-level-sindico',
            icon: '🏢'
        },
        MORADOR: {
            value: 'morador',
            label: 'Morador',
            description: 'Acesso básico às funcionalidades',
            color: 'access-level-morador',
            icon: '🏠'
        },
        FUNCIONARIO: {
            value: 'funcionario',
            label: 'Funcionário',
            description: 'Acesso limitado para tarefas específicas',
            color: 'access-level-funcionario',
            icon: '👷'
        }
    }
};

// Exportar configuração para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

// Log de configuração carregada
if (CONFIG.DEBUG.ENABLE_CONSOLE_LOGS) {
    console.log('⚙️ Configuração carregada:', CONFIG);
}

// Sistema de Autenticação - Frontend
class AuthSystem {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Tab navigation
        document.getElementById('loginTab').addEventListener('click', () => this.showSection('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.showSection('register'));
        document.getElementById('resetTab').addEventListener('click', () => this.showSection('reset'));
        document.getElementById('profileTab').addEventListener('click', () => this.showSection('profile'));

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('requestResetForm').addEventListener('submit', (e) => this.handleRequestReset(e));
        document.getElementById('resetPasswordForm').addEventListener('submit', (e) => this.handleResetPassword(e));

        // Other buttons
        document.getElementById('showResetBtn').addEventListener('click', () => this.showSection('reset'));
        document.getElementById('backToStep1').addEventListener('click', () => this.showResetStep1());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.showSection('login');
            }
        });
    }

    // Verificar status de autenticação
    checkAuthStatus() {
        if (this.authToken) {
            this.loadUserProfile();
        } else {
            this.showSection('login');
        }
    }

    // Mostrar seção específica
    showSection(sectionName) {
        // Esconder todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Remover classe active de todas as tabs
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });

        // Mostrar seção selecionada
        const section = document.getElementById(sectionName + 'Section');
        if (section) {
            section.classList.remove('hidden');
        }

        // Ativar tab correspondente
        const tab = document.getElementById(sectionName + 'Tab');
        if (tab) {
            tab.classList.add('active');
        }

        // Mostrar/ocultar tab de perfil baseado no status de autenticação
        const profileTab = document.getElementById('profileTab');
        if (profileTab) {
            if (this.authToken) {
                profileTab.classList.remove('hidden');
            } else {
                profileTab.classList.add('hidden');
            }
        }
    }

    // Mostrar primeiro passo do reset
    showResetStep1() {
        document.getElementById('resetStep1').classList.remove('hidden');
        document.getElementById('resetStep2').classList.add('hidden');
    }

    // Mostrar segundo passo do reset
    showResetStep2() {
        document.getElementById('resetStep1').classList.add('hidden');
        document.getElementById('resetStep2').classList.remove('hidden');
    }

    // Exibir mensagem de status
    showStatus(message, type = 'info', duration = 5000) {
        const statusMessage = document.getElementById('statusMessage');
        const statusTitle = document.getElementById('statusTitle');
        const statusText = document.getElementById('statusText');
        const statusIcon = document.getElementById('statusIcon');

        // Configurar ícone e cor baseado no tipo
        let icon, borderColor;
        switch (type) {
            case 'success':
                icon = '✅';
                borderColor = '#10b981';
                break;
            case 'error':
                icon = '❌';
                borderColor = '#ef4444';
                break;
            case 'warning':
                icon = '⚠️';
                borderColor = '#f59e0b';
                break;
            default:
                icon = 'ℹ️';
                borderColor = '#3b82f6';
        }

        statusIcon.textContent = icon;
        statusTitle.textContent = type === 'success' ? 'Sucesso!' : type === 'error' ? 'Erro!' : type === 'warning' ? 'Atenção!' : 'Informação';
        statusText.textContent = message;
        
        statusMessage.style.borderLeftColor = borderColor;
        statusMessage.classList.remove('hidden');

        // Auto-hide após duração especificada
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, duration);
    }

    // Fazer requisição para a API
    async makeApiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        // Adicionar token de autenticação se disponível
        if (this.authToken) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Handler de login
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validação básica
        if (!email || !password) {
            this.showStatus('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            // Adicionar estado de loading
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Entrando...';

            const response = await this.makeApiRequest('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (response.status === 'success') {
                this.authToken = response.token;
                this.currentUser = response.data;
                
                // Salvar token no localStorage
                localStorage.setItem('authToken', this.authToken);
                
                this.showStatus('Login realizado com sucesso!', 'success');
                
                // Limpar formulário
                form.reset();
                
                // Processar informações de redirecionamento
                if (response.redirect_info) {
                    this.processRedirectInfo(response.redirect_info);
                } else {
                    // Fallback: mostrar perfil
                    setTimeout(() => {
                        this.showSection('profile');
                    }, 1000);
                }
            }
        } catch (error) {
            this.showStatus(error.message || 'Erro ao fazer login', 'error');
        } finally {
            // Remover estado de loading
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Entrar';
        }
    }

    // Handler de registro
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            access_level: formData.get('access_level'),
        };

        // Validação básica
        if (!userData.name || !userData.email || !userData.password) {
            this.showStatus('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (userData.password.length < 6) {
            this.showStatus('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        try {
            // Adicionar estado de loading
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Cadastrando...';

            const response = await this.makeApiRequest('/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            if (response.status === 'success') {
                this.showStatus('Usuário cadastrado com sucesso!', 'success');
                
                // Limpar formulário
                form.reset();
                
                // Mostrar login
                setTimeout(() => {
                    this.showSection('login');
                }, 1000);
            }
        } catch (error) {
            this.showStatus(error.message || 'Erro ao cadastrar usuário', 'error');
        } finally {
            // Remover estado de loading
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Cadastrar';
        }
    }

    // Handler de solicitação de reset
    async handleRequestReset(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = document.getElementById('resetEmail').value;

        if (!email) {
            this.showStatus('Por favor, informe seu e-mail', 'error');
            return;
        }

        try {
            // Adicionar estado de loading
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Enviando...';

            const response = await this.makeApiRequest('/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });

            if (response.status === 'success') {
                this.showStatus('Email de reset enviado! Verifique sua caixa de entrada.', 'success');
                
                // Mostrar informações úteis no console para desenvolvimento
                if (CONFIG.DEBUG.ENABLE_CONSOLE_LOGS) {
                    console.log('📧 Email de reset enviado para:', response.data.email);
                    console.log('🔑 Token de Reset (desenvolvimento):', response.data.token);
                    console.log('🔗 URL de Reset:', response.data.reset_url);
                }
                
                // Preencher o campo de token automaticamente (para facilitar testes)
                document.getElementById('resetToken').value = response.data.token;
                
                // Mostrar segundo passo
                setTimeout(() => {
                    this.showResetStep2();
                }, 2000);
            }
        } catch (error) {
            this.showStatus(error.message || 'Erro ao solicitar reset', 'error');
        } finally {
            // Remover estado de loading
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Solicitar Reset';
        }
    }

    // Handler de reset de senha
    async handleResetPassword(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const token = document.getElementById('resetToken').value;
        const email = document.getElementById('resetEmail').value;
        const password = document.getElementById('newPassword').value;
        const passwordConfirmation = document.getElementById('confirmPassword').value;

        if (!token || !email || !password || !passwordConfirmation) {
            this.showStatus('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (password !== passwordConfirmation) {
            this.showStatus('As senhas não coincidem', 'error');
            return;
        }

        if (password.length < 6) {
            this.showStatus('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        try {
            // Adicionar estado de loading
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Redefinindo...';

            const response = await this.makeApiRequest('/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            if (response.status === 'success') {
                this.showStatus('Senha redefinida com sucesso!', 'success');
                
                // Limpar formulários
                document.getElementById('requestResetForm').reset();
                form.reset();
                
                // Voltar para login
                setTimeout(() => {
                    this.showSection('login');
                }, 1000);
            }
        } catch (error) {
            this.showStatus(error.message || 'Erro ao redefinir senha', 'error');
        } finally {
            // Remover estado de loading
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Redefinir Senha';
        }
    }

    // Carregar perfil do usuário
    async loadUserProfile() {
        try {
            const response = await this.makeApiRequest('/profile');
            
            if (response.status === 'success') {
                this.currentUser = response.data;
                this.displayUserProfile(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            // Token inválido, fazer logout
            this.handleLogout();
        }
    }

    // Processar informações de redirecionamento
    processRedirectInfo(redirectInfo) {
        console.log('🔄 Processando redirecionamento:', redirectInfo);
        
        // Salvar informações de redirecionamento no localStorage
        localStorage.setItem('redirectInfo', JSON.stringify(redirectInfo));
        
        // Mostrar mensagem de redirecionamento
        this.showStatus(`Redirecionando para ${redirectInfo.area_name}...`, 'info');
        
        // Redirecionar para a rota específica após 2 segundos
        setTimeout(() => {
            this.redirectToUserArea(redirectInfo.redirect_to);
        }, 2000);
    }

    // Redirecionar para área específica do usuário
    redirectToUserArea(route) {
        console.log('🚀 Redirecionando para:', route);
        
        // Em produção, você pode usar:
        // window.location.href = route;
        
        // Para demonstração, vamos mostrar uma mensagem e simular o redirecionamento
        this.showStatus(`Redirecionado para ${route}`, 'success');
        
        // Simular redirecionamento (em produção seria real)
        setTimeout(() => {
            // Aqui você implementaria a lógica para ir para a rota específica
            // Por exemplo, usando um router SPA ou redirecionamento real
            console.log(`📍 Usuário redirecionado para: ${route}`);
            
            // Mostrar perfil como fallback
            this.showSection('profile');
        }, 1000);
    }

    // Exibir perfil do usuário
    displayUserProfile(user) {
        const profileInfo = document.getElementById('profileInfo');
        
        const accessLevelNames = {
            'administrador': 'Administrador',
            'sindico': 'Síndico',
            'morador': 'Morador',
            'funcionario': 'Funcionário'
        };

        const accessLevelColors = {
            'administrador': 'access-level-administrador',
            'sindico': 'access-level-sindico',
            'morador': 'access-level-morador',
            'funcionario': 'access-level-funcionario'
        };

        profileInfo.innerHTML = `
            <div class="profile-card">
                <div class="profile-info-item">
                    <span class="profile-info-label">Nome:</span>
                    <span class="profile-info-value">${user.name}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">E-mail:</span>
                    <span class="profile-info-value">${user.email}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Nível de Acesso:</span>
                    <span class="access-level-badge ${accessLevelColors[user.access_level]}">
                        ${accessLevelNames[user.access_level]}
                    </span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">ID:</span>
                    <span class="profile-info-value">${user.id}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">Cadastrado em:</span>
                    <span class="profile-info-value">${new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `;
    }

    // Handler de logout
    async handleLogout() {
        try {
            if (this.authToken) {
                await this.makeApiRequest('/logout', {
                    method: 'POST',
                });
            }
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Limpar dados locais
            this.authToken = null;
            this.currentUser = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('redirectInfo');
            
            // Mostrar mensagem
            this.showStatus('Logout realizado com sucesso!', 'success');
            
            // Voltar para login
            setTimeout(() => {
                this.showSection('login');
            }, 1000);
        }
    }

    // Testar conexão com a API
    async testApiConnection() {
        try {
            const response = await this.makeApiRequest('/access-levels');
            console.log('✅ API conectada com sucesso:', response);
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar com a API:', error);
            this.showStatus('Erro ao conectar com a API. Verifique se o backend está rodando.', 'error');
            return false;
        }
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const authSystem = new AuthSystem();
    
    // Testar conexão com a API
    authSystem.testApiConnection();
    
    // Expor para debug no console
    window.authSystem = authSystem;
    
    // Mostrar informações de usuários de teste
    console.log('👥 Usuários de Teste Disponíveis:');
    console.log('📧 admin@condominio.com | 🔑 123456 | 👑 Administrador');
    console.log('📧 sindico@condominio.com | 🔑 123456 | 🏢 Síndico');
    console.log('📧 morador@condominio.com | 🔑 123456 | 🏠 Morador');
    console.log('📧 funcionario@condominio.com | 🔑 123456 | 👷 Funcionário');
    console.log('');
    console.log('💡 Dica: Use Ctrl+K para ir direto para o login');
    console.log('🔧 Para debug, acesse: window.authSystem');
});

1. O projeto é um sistema de condomínio
2. O backend é construído em Laravel 11 e utiliza o banco de dados MySQL
3. O frontend é construído em React/Vite e utiliza Tailwind, usamos para ícones a biblioteca Lucide React
4. O projeto roda localmente, mas posteriormente será hospedado em servidor
5. Arquitetura: Backend em Laravel 11 (API RESTful), frontend em React PWA (com possibilidade futura de app nativo).
6. Autenticação: Login com Laravel Sanctum (tokens/abilities), recuperação de senha e autenticação baseada em papéis.
7. Papéis de acesso: SuperAdmin, Administradora, Síndico, Portaria/Zelador, Morador, Financeiro, Conselho, Dependente, Prestador.
8. Multi-condomínios: Cada condomínio deve ser independente, identificado por condominium_id, com dados isolados.
9. Estrutura física: Modelagem hierárquica → Condomínio → Bloco (opcional) → Unidade (apartamento/casa/sala) → Vagas/Depósitos.
10. Usuários e unidades: Relação N:N entre usuários e unidades (unit_user), permitindo papéis diferentes por unidade/condomínio e histórico de ocupação.
11. Dashboard dinâmico: Menus e funcionalidades exibidas conforme papel do usuário e condomínio ativo.
12. Gestão de moradores: Cadastro, edição, vínculo a unidade, histórico de inquilinos/proprietários/dependentes.
13. Reservas de áreas comuns: CRUD de reservas, regras (horários, limites, taxa extra, aprovações), controle de disponibilidade.
14. Ocorrências/reclamações: Abertura de ocorrências por moradores, gestão/resposta por síndico/administradora, histórico.
15. Comunicados: Publicação segmentada (todos, por bloco, por unidade), com notificações push no PWA.
16. Assembleias virtuais: Criação de pautas, votação eletrônica, atas digitais.
17. Visitantes e entregas: Controle por Portaria/Zelador (entrada/saída, registro de entregas, autorização prévia do morador).
18. Financeiro básico: Registro de cobranças/boletos/PIX, acompanhamento de inadimplência, relatórios financeiros.
19. Integrações financeiras: Estrutura preparada para integrar com gateways (Asaas, Gerencianet, bancos).
20. Documentos e arquivos: Upload/download de atas, regimento interno, comunicados oficiais, com controle de permissões.
21. Relatórios e indicadores: Inadimplência, reservas por período, ocorrências, votações, ocupação de unidades.
22. Segurança e LGPD: Criptografia de senhas, logs de ações sensíveis, anonimização/remoção de dados quando solicitado.
23. Notificações: Push no PWA, e-mail e SMS (via integração futura), com customização de preferências por usuário.
24. Suporte à escalabilidade: Estrutura de permissões via spatie/laravel-permission, endpoints versionados (/api/v1/...), 25. preparado para multi-tenant com possibilidade de migração para bancos separados no futuro.
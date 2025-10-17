<?php



namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="API de Sistema de Condomínio",
 *      description="Documentação completa da API para gerenciamento de condomínios, incluindo blocos, unidades, vagas de garagem e depósitos.",
 *      @OA\Contact(
 *          email="admin@condominio.com",
 *          name="Suporte Sistema de Condomínio"
 *      ),
 *      @OA\License(
 *          name="MIT",
 *          url="https://opensource.org/licenses/MIT"
 *      )
 * )
 * 
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor de Desenvolvimento"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Token de autenticação via Laravel Sanctum"
 * )
 * 
 * @OA\Tag(
 *     name="Condomínios",
 *     description="Endpoints para gerenciamento completo de condomínios"
 * )
 * 
 * @OA\Tag(
 *     name="Autenticação",
 *     description="Endpoints para autenticação e gerenciamento de usuários"
 * )
 */

class ApiController extends Controller
{
    /**
     * @OA\Schema(
     *     schema="Condominium",
     *     title="Condomínio",
     *     description="Modelo de dados para condomínio",
     *     @OA\Property(property="id", type="integer", example=1, description="ID único do condomínio"),
     *     @OA\Property(property="name", type="string", example="Residencial Jardim das Flores", description="Nome do condomínio"),
     *     @OA\Property(property="address", type="string", example="Rua das Flores, 123 - Jardim Botânico", description="Endereço completo"),
     *     @OA\Property(property="city", type="string", example="São Paulo", description="Cidade"),
     *     @OA\Property(property="state", type="string", example="SP", description="Estado"),
     *     @OA\Property(property="zip_code", type="string", example="01234-567", description="CEP"),
     *     @OA\Property(property="phone", type="string", example="(11) 1234-5678", description="Telefone"),
     *     @OA\Property(property="email", type="string", example="admin@jardimflores.com", description="Email"),
     *     @OA\Property(property="description", type="string", example="Condomínio residencial com área de lazer", description="Descrição"),
     *     @OA\Property(property="active", type="boolean", example=true, description="Status ativo/inativo"),
     *     @OA\Property(property="created_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z"),
     *     @OA\Property(property="updated_at", type="string", format="date-time", example="2025-01-01T10:00:00.000000Z")
     * )
     */
    
    /**
     * @OA\Schema(
     *     schema="Pagination",
     *     title="Paginação",
     *     description="Informações de paginação",
     *     @OA\Property(property="current_page", type="integer", example=1, description="Página atual"),
     *     @OA\Property(property="last_page", type="integer", example=5, description="Última página"),
     *     @OA\Property(property="per_page", type="integer", example=15, description="Itens por página"),
     *     @OA\Property(property="total", type="integer", example=75, description="Total de itens"),
     *     @OA\Property(property="from", type="integer", example=1, description="Primeiro item da página"),
     *     @OA\Property(property="to", type="integer", example=15, description="Último item da página")
     * )
     */
    
    /**
     * @OA\Schema(
     *     schema="ErrorResponse",
     *     title="Resposta de Erro",
     *     description="Modelo padrão para respostas de erro",
     *     @OA\Property(property="status", type="string", example="error", description="Status da resposta"),
     *     @OA\Property(property="message", type="string", example="Mensagem de erro", description="Descrição do erro"),
     *     @OA\Property(property="errors", type="object", description="Detalhes dos erros de validação")
     * )
     */
    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registro de Usuário",
     *     description="Registra um novo usuário.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "email", "password"},
     *             @OA\Property(property="name", type="string", example="Nome Usuário"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="senhaSegura123"),
     *             @OA\Property(property="access_level", type="string", enum={"administrador", "sindico", "morador", "funcionario"}, example="morador", description="Nível de acesso do usuário")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuário criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuário criado com sucesso"),
     *             @OA\Property(property="token", type="string", example="1|V0upjdioPsDPjWdOyNGjJIaCQHJTJH0MQvwK5DdZ13806f99"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
     *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
     *                 @OA\Property(property="access_level", type="string", example="morador"),
     *                 @OA\Property(property="created_at", type="string", example="2024-10-03T15:51:05.000000Z"),
     *                 @OA\Property(property="updated_at", type="string", example="2024-10-03T15:51:05.000000Z"),
     *                 @OA\Property(property="id", type="integer", example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Erro de Validação"),
     *             @OA\Property(property="erros", type="object",
     *                 @OA\Property(property="email", type="array", @OA\Items(type="string", example="Este email já foi cadastrado"))
     *             )
     *         )
     *     )
     * )
     */


    public function register(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name' => 'required',
                'email' => 'required|email|unique:users,email',
                'password' => 'required',
                'access_level' => 'sometimes|in:administrador,sindico,morador,funcionario',
            ], [
                'name.required' => 'O campo nome é obrigatório.',
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email' => 'O e-mail informado não é válido.',
                'email.unique' => 'O e-mail já está em uso.',
                'password.required' => 'O campo senha é obrigatório.',
                'access_level.in' => 'O nível de acesso deve ser: administrador, síndico, morador ou funcionário.',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateUser->errors()
                ], 401);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'access_level' => $request->access_level ?? 'morador'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário criado com sucesso',
                'token' => $user->createToken('token')->plainTextToken,
                'data' => $user
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Determina as informações de redirecionamento baseadas no nível de acesso
     * 
     * @param string $accessLevel
     * @return array
     */
    private function getRedirectInfo($accessLevel)
    {
        switch ($accessLevel) {
            case 'administrador':
                return [
                    'access_level' => 'administrador',
                    'redirect_to' => '/admin/dashboard',
                    'area_name' => 'Painel Administrativo'
                ];

            case 'sindico':
                return [
                    'access_level' => 'sindico',
                    'redirect_to' => '/sindico/dashboard',
                    'area_name' => 'Painel do Síndico'
                ];

            case 'morador':
                return [
                    'access_level' => 'morador',
                    'redirect_to' => '/morador/dashboard',
                    'area_name' => 'Área do Morador'
                ];

            case 'funcionario':
                return [
                    'access_level' => 'funcionario',
                    'redirect_to' => '/funcionario/dashboard',
                    'area_name' => 'Área do Funcionário'
                ];

            default:
                return [
                    'access_level' => 'default',
                    'redirect_to' => '/dashboard',
                    'area_name' => 'Dashboard'
                ];
        }
    }

    /**
     * @OA\Get(
     *     path="/api/redirect-info",
     *     summary="Obter informações de redirecionamento do usuário atual",
     *     description="Retorna as informações de redirecionamento baseadas no nível de acesso do usuário autenticado.",
     *     tags={"Autenticação"},
     *     security={{ "sanctum": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="Informações de redirecionamento recuperadas com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Informações de redirecionamento"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="access_level", type="string", example="morador"),
     *                 @OA\Property(property="redirect_to", type="string", example="/morador/dashboard"),
     *                 @OA\Property(property="area_name", type="string", example="Área do Morador")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autenticado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autenticado.")
     *         )
     *     )
     * )
     */
    public function getCurrentUserRedirectInfo()
    {
        try {
            $user = Auth::user();
            $redirectInfo = $this->getRedirectInfo($user->access_level);

            return response()->json([
                'status' => 'success',
                'message' => 'Informações de redirecionamento',
                'data' => $redirectInfo
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login de Usuário",
     *     description="Autentica um usuário.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="senhaSegura123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuário logado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Usuário logado com sucesso"),
     *             @OA\Property(property="token", type="string", example="2|B6CL7DLBQHLFvpBPv4qHn2swyqeRH6lSAZOHsGEs66100ee8"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
     *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
     *                 @OA\Property(property="access_level", type="string", example="morador"),
     *                 @OA\Property(property="email_verified_at", type="string", nullable=true, example=null),
     *                 @OA\Property(property="created_at", type="string", example="2024-10-03T15:51:05.000000Z"),
     *                 @OA\Property(property="updated_at", type="string", example="2024-10-03T15:51:05.000000Z")
     *             ),
     *             @OA\Property(property="redirect_info", type="object",
     *                 @OA\Property(property="access_level", type="string", example="morador"),
     *                 @OA\Property(property="redirect_to", type="string", example="/morador/dashboard"),
     *                 @OA\Property(property="area_name", type="string", example="Área do Morador")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Email ou senha incorretos",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Email ou senha incorretos")
     *         )
     *     )
     * )
     */



    public function login(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateUser->errors()
                ], 401);
            }

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'E-mail ou senha incorretos'
                ], 401);
            }

            $user = User::where('email', $request->email)->first();

            // Determinar área de redirecionamento baseada no nível de acesso
            $redirectInfo = $this->getRedirectInfo($user->access_level);

            // Buscar dados do morador se for um morador
            $residentData = null;
            if ($user->access_level === 'morador') {
                $resident = \App\Models\Resident::where('owner_user_id', $user->id)
                    ->orWhere('tenant_user_id', $user->id)
                    ->with(['unit.block', 'condominium'])
                    ->first();

                if ($resident) {
                    $residentData = [
                        'resident_id' => $resident->id,
                        'condominium_id' => $resident->condominium_id,
                        'condominium_name' => $resident->condominium->name ?? null,
                        'block_id' => $resident->unit->block_id ?? null,
                        'block_name' => $resident->unit->block->name ?? null,
                        'unit_id' => $resident->unit_id,
                        'unit_number' => $resident->unit->number ?? null,
                        'is_owner' => $resident->owner_user_id === $user->id,
                        'is_tenant' => $resident->tenant_user_id === $user->id,
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário logado com sucesso',
                'token' => $user->createToken('token')->plainTextToken,
                'data' => $user,
                'resident_data' => $residentData,
                'redirect_info' => $redirectInfo
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/profile",
     *     summary="Obter perfil do usuário autenticado",
     *     description="Retorna o perfil do usuário autenticado.",
     *     tags={"Autenticação"},
     *     security={{ "sanctum": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="Perfil do usuário recuperado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="User profile"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Nome Usuário"),
     *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
     *                 @OA\Property(property="access_level", type="string", example="morador"),
     *                 @OA\Property(property="email_verified_at", type="string", nullable=true, example=null),
     *                 @OA\Property(property="created_at", type="string", example="2024-10-03T15:51:05.000000Z"),
     *                 @OA\Property(property="updated_at", type="string", example="2024-10-03T15:51:05.000000Z")
     *             ),
     *             @OA\Property(property="id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Usuário não autenticado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Usuário não autenticado.")
     *         )
     *     )
     * )
     */

    public function profile()
    {
        $userData = Auth::user();
        return response()->json([
            'status' => 'success',
            'message' => 'Perfil do usuário',
            'data' => $userData,
            'id' => $userData->id
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/forgot-password",
     *     summary="Solicitar reset de senha",
     *     description="Envia um email com link para redefinição de senha.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Email de reset enviado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Email de reset de senha enviado com sucesso"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
     *                 @OA\Property(property="token", type="string", example="token_para_testes"),
     *                 @OA\Property(property="reset_url", type="string", example="http://localhost:8000/reset-password?token=token_para_testes")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Email não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Email não encontrado no sistema")
     *         )
     *     ),
     *     @OA\Response(
     *         response=429,
     *         description="Muitas tentativas",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Aguarde antes de solicitar outro reset")
     *         )
     *     )
     * )
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validateEmail = Validator::make($request->all(), [
                'email' => 'required|email',
            ], [
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email' => 'O e-mail informado não é válido.',
            ]);

            if ($validateEmail->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateEmail->errors()
                ], 400);
            }

            $email = $request->email;
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email não encontrado no sistema'
                ], 404);
            }

            // Gerar token de reset
            $token = Str::random(64);

            // Salvar token no banco
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'email' => $email,
                    'token' => $token,
                    'created_at' => now()
                ]
            );

            // Para testes, retornar o token e URL
            $resetUrl = url('/reset-password') . '?token=' . $token;

            // Em produção, aqui seria enviado o email
            // Mail::to($email)->send(new ResetPasswordMail($user, $resetUrl));

            return response()->json([
                'status' => 'success',
                'message' => 'Email de reset de senha enviado com sucesso',
                'data' => [
                    'email' => $email,
                    'token' => $token, // Apenas para testes
                    'reset_url' => $resetUrl // Apenas para testes
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/reset-password",
     *     summary="Redefinir senha",
     *     description="Redefine a senha do usuário usando o token de reset.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token", "email", "password", "password_confirmation"},
     *             @OA\Property(property="token", type="string", example="token_do_reset"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="novaSenha123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="novaSenha123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Senha redefinida com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Senha redefinida com sucesso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erro de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Erro de validação"),
     *             @OA\Property(property="erros", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Token inválido ou expirado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Token inválido ou expirado")
     *         )
     *     )
     * )
     */
    public function resetPassword(Request $request)
    {
        try {
            $validateRequest = Validator::make($request->all(), [
                'token' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|string|min:6|confirmed',
            ], [
                'token.required' => 'O token é obrigatório.',
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email' => 'O e-mail informado não é válido.',
                'password.required' => 'O campo senha é obrigatório.',
                'password.min' => 'A senha deve ter pelo menos 6 caracteres.',
                'password.confirmed' => 'A confirmação de senha não confere.',
            ]);

            if ($validateRequest->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateRequest->errors()
                ], 400);
            }

            $token = $request->token;
            $email = $request->email;
            $password = $request->password;

            // Verificar se o token existe e não expirou
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('token', $token)
                ->where('created_at', '>', now()->subMinutes(60))
                ->first();

            if (!$resetRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token inválido ou expirado'
                ], 404);
            }

            // Atualizar a senha do usuário
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuário não encontrado'
                ], 404);
            }

            $user->update([
                'password' => Hash::make($password)
            ]);

            // Remover o token usado
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Senha redefinida com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/verify-reset-token",
     *     summary="Verificar token de reset",
     *     description="Verifica se um token de reset de senha é válido e não expirou.",
     *     tags={"Autenticação"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token", "email"},
     *             @OA\Property(property="token", type="string", example="token_do_reset"),
     *             @OA\Property(property="email", type="string", format="email", example="usuario@email.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Token válido",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Token válido"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="email", type="string", example="usuario@email.com"),
     *                 @OA\Property(property="valid", type="boolean", example=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Token inválido ou expirado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Token inválido ou expirado")
     *         )
     *     )
     * )
     */
    public function verifyResetToken(Request $request)
    {
        try {
            $validateRequest = Validator::make($request->all(), [
                'token' => 'required|string',
                'email' => 'required|email',
            ], [
                'token.required' => 'O token é obrigatório.',
                'email.required' => 'O campo e-mail é obrigatório.',
                'email.email' => 'O e-mail informado não é válido.',
            ]);

            if ($validateRequest->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Erro de validação',
                    'erros' => $validateRequest->errors()
                ], 400);
            }

            $token = $request->token;
            $email = $request->email;

            // Verificar se o token existe e não expirou
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('token', $token)
                ->where('created_at', '>', now()->subMinutes(60))
                ->first();

            if (!$resetRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token inválido ou expirado'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Token válido',
                'data' => [
                    'email' => $email,
                    'valid' => true
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/access-levels",
     *     summary="Obter níveis de acesso disponíveis",
     *     description="Retorna todos os níveis de acesso disponíveis no sistema.",
     *     tags={"Autenticação"},
     *     @OA\Response(
     *         response=200,
     *         description="Níveis de acesso recuperados com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Níveis de acesso disponíveis"),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="value", type="string", example="administrador"),
     *                 @OA\Property(property="label", type="string", example="Administrador"),
     *                 @OA\Property(property="description", type="string", example="Acesso total ao sistema")
     *             ))
     *         )
     *     )
     * )
     */
    public function getAccessLevels()
    {
        $accessLevels = [
            [
                'value' => User::ACCESS_LEVEL_ADMINISTRADOR,
                'label' => 'Administrador',
                'description' => 'Acesso total ao sistema'
            ],
            [
                'value' => User::ACCESS_LEVEL_SINDICO,
                'label' => 'Síndico',
                'description' => 'Gerenciamento do condomínio'
            ],
            [
                'value' => User::ACCESS_LEVEL_MORADOR,
                'label' => 'Morador',
                'description' => 'Acesso básico às funcionalidades'
            ],
            [
                'value' => User::ACCESS_LEVEL_FUNCIONARIO,
                'label' => 'Funcionário',
                'description' => 'Acesso limitado para tarefas específicas'
            ]
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Níveis de acesso disponíveis',
            'data' => $accessLevels
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout do usuário autenticado",
     *     description="Efetua o logout do usuário autenticado.",
     *     tags={"Autenticação"},
     *     security={{ "sanctum": {} }},
     *     @OA\Response(
     *         response=200,
     *         description="Logout realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Logout realizado com sucesso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Usuário não autenticado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Usuário não autenticado")
     *         )
     *     )
     * )
     */

    public function logout()
    {
        try {
            Auth::user()->tokens()->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Usuário deslogado com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ], [
                'current_password.required' => 'A senha atual é obrigatória',
                'new_password.required' => 'A nova senha é obrigatória',
                'new_password.min' => 'A nova senha deve ter no mínimo 8 caracteres',
                'new_password.confirmed' => 'A confirmação da nova senha não confere',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Verificar se a senha atual está correta
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Senha atual incorreta'
                ], 400);
            }

            // Atualizar a senha
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Senha alterada com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao alterar senha',
                'error' => $th->getMessage()
            ], 500);
        }
    }
}

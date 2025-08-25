<?php

namespace App\Http\Controllers\Swagger;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="API de Sistema de Condomínio",
 *     description="Documentação completa da API para gerenciamento de condomínios, incluindo blocos, unidades, vagas de garagem e depósitos.",
 *     @OA\Contact(
 *         email="admin@condominio.com",
 *         name="Suporte Sistema de Condomínio"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
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
 * 
 * @OA\ExternalDocumentation(
 *     description="Documentação do Sistema",
 *     url="https://github.com/seu-usuario/sistema-condominio"
 * )
 */


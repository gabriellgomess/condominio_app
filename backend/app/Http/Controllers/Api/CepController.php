<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CepService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="CEP",
 *     description="Endpoints para busca de endereço por CEP"
 * )
 */
class CepController extends Controller
{
    protected $cepService;

    public function __construct(CepService $cepService)
    {
        $this->cepService = $cepService;
    }

    /**
     * @OA\Get(
     *     path="/api/cep/{cep}",
     *     summary="Buscar endereço por CEP",
     *     description="Busca informações de endereço através do CEP usando a API do ViaCEP",
     *     tags={"CEP"},
     *     @OA\Parameter(
     *         name="cep",
     *         in="path",
     *         description="CEP para busca (formato: 12345678 ou 12345-678)",
     *         required=true,
     *         @OA\Schema(type="string", example="01310-100")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Endereço encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Endereço encontrado"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="cep", type="string", example="01310-100"),
     *                 @OA\Property(property="address", type="string", example="Avenida Paulista"),
     *                 @OA\Property(property="neighborhood", type="string", example="Bela Vista"),
     *                 @OA\Property(property="city", type="string", example="São Paulo"),
     *                 @OA\Property(property="state", type="string", example="SP"),
     *                 @OA\Property(property="ibge", type="string", example="3550308"),
     *                 @OA\Property(property="gia", type="string", example="1004"),
     *                 @OA\Property(property="ddd", type="string", example="11"),
     *                 @OA\Property(property="siafi", type="string", example="7107")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="CEP não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="CEP não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="CEP inválido",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="CEP inválido"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function search($cep)
    {
        try {
            // Validar CEP
            $validator = Validator::make(['cep' => $cep], [
                'cep' => 'required|string|min:8|max:10'
            ], [
                'cep.required' => 'CEP é obrigatório.',
                'cep.min' => 'CEP deve ter pelo menos 8 dígitos.',
                'cep.max' => 'CEP deve ter no máximo 10 caracteres.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'CEP inválido',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar formato do CEP
            if (!$this->cepService->isValidCep($cep)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Formato de CEP inválido. Use o formato 12345678 ou 12345-678.'
                ], 422);
            }

            // Buscar endereço
            $addressData = $this->cepService->searchByCep($cep);

            if (!$addressData) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'CEP não encontrado'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Endereço encontrado',
                'data' => $addressData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro interno do servidor',
                'error' => config('app.debug') ? $e->getMessage() : 'Erro interno'
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/cep/search",
     *     summary="Buscar endereço por CEP (POST)",
     *     description="Busca informações de endereço através do CEP usando método POST",
     *     tags={"CEP"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"cep"},
     *             @OA\Property(property="cep", type="string", example="01310-100", description="CEP para busca")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Endereço encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Endereço encontrado"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function searchPost(Request $request)
    {
        $cep = $request->input('cep');
        return $this->search($cep);
    }
}

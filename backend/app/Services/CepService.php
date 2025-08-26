<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CepService
{
    private const VIACEP_URL = 'https://viacep.com.br/ws';
    private const TIMEOUT = 10;

    /**
     * Busca informações de endereço pelo CEP
     *
     * @param string $cep
     * @return array|null
     */
    public function searchByCep(string $cep): ?array
    {
        try {
            // Limpar CEP (remover caracteres não numéricos)
            $cleanCep = preg_replace('/[^0-9]/', '', $cep);
            
            // Validar formato do CEP
            if (strlen($cleanCep) !== 8) {
                return null;
            }

            // Fazer requisição para ViaCEP
            $response = Http::timeout(self::TIMEOUT)
                ->get(self::VIACEP_URL . "/{$cleanCep}/json/");

            if (!$response->successful()) {
                Log::warning('Erro na requisição ViaCEP', [
                    'cep' => $cep,
                    'status' => $response->status()
                ]);
                return null;
            }

            $data = $response->json();

            // Verificar se o CEP foi encontrado
            if (isset($data['erro']) && $data['erro'] === true) {
                return null;
            }

            // Retornar dados formatados
            return [
                'cep' => $data['cep'] ?? $cleanCep,
                'address' => $data['logradouro'] ?? '',
                'neighborhood' => $data['bairro'] ?? '',
                'city' => $data['localidade'] ?? '',
                'state' => $data['uf'] ?? '',
                'ibge' => $data['ibge'] ?? '',
                'gia' => $data['gia'] ?? '',
                'ddd' => $data['ddd'] ?? '',
                'siafi' => $data['siafi'] ?? ''
            ];

        } catch (\Exception $e) {
            Log::error('Erro ao buscar CEP', [
                'cep' => $cep,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Valida formato do CEP
     *
     * @param string $cep
     * @return bool
     */
    public function isValidCep(string $cep): bool
    {
        $cleanCep = preg_replace('/[^0-9]/', '', $cep);
        return strlen($cleanCep) === 8;
    }

    /**
     * Formata CEP para exibição
     *
     * @param string $cep
     * @return string
     */
    public function formatCep(string $cep): string
    {
        $cleanCep = preg_replace('/[^0-9]/', '', $cep);
        
        if (strlen($cleanCep) === 8) {
            return substr($cleanCep, 0, 5) . '-' . substr($cleanCep, 5, 3);
        }
        
        return $cep;
    }
}
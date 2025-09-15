<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Supplier::with(['condominium']);

            // Filtrar por condomínio
            if ($request->has('condominium_id') && $request->condominium_id) {
                $query->byCondominium($request->condominium_id);
            }

            // Filtrar por categoria
            if ($request->has('category') && $request->category) {
                $query->byCategory($request->category);
            }

            // Filtrar por status
            if ($request->has('status') && $request->status) {
                $query->byStatus($request->status);
            }

            // Filtrar por busca
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Filtrar ativos apenas
            if ($request->get('active_only', false)) {
                $query->active();
            }

            // Filtrar por avaliação mínima
            if ($request->has('min_evaluation') && $request->min_evaluation) {
                $query->where('evaluation', '>=', $request->min_evaluation);
            }

            // Filtrar contratos próximos ao vencimento
            if ($request->get('expiring_contracts', false)) {
                $days = $request->get('expiring_days', 30);
                $query->contractExpiring($days);
            }

            // Ordenar
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginação
            $perPage = $request->get('per_page', 15);
            $suppliers = $query->paginate($perPage);

            Log::info('Suppliers retrieved successfully', [
                'count' => $suppliers->count(),
                'condominium_id' => $request->condominium_id,
                'category' => $request->category,
                'search' => $request->search
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedores encontrados',
                'data' => $suppliers->items(),
                'pagination' => [
                    'current_page' => $suppliers->currentPage(),
                    'last_page' => $suppliers->lastPage(),
                    'per_page' => $suppliers->perPage(),
                    'total' => $suppliers->total()
                ]
            ])->header('Content-Type', 'application/json');
        } catch (\Exception $e) {
            Log::error('Error retrieving suppliers', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar fornecedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Creating new supplier', ['data' => $request->all()]);

            // Validação dos dados
            $validator = $this->validateSupplierData($request);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar dados para criação
            $supplierData = $this->prepareSupplierData($request);

            // Criar o fornecedor
            $supplier = Supplier::create($supplierData);

            // Carregar relacionamentos
            $supplier->load(['condominium']);

            Log::info('Supplier created successfully', [
                'supplier_id' => $supplier->id,
                'company_name' => $supplier->company_name,
                'category' => $supplier->category
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedor criado com sucesso',
                'data' => $supplier
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating supplier', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar fornecedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $supplier = Supplier::with(['condominium'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedor encontrado',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving supplier', [
                'supplier_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Fornecedor não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            Log::info('Updating supplier', [
                'supplier_id' => $id,
                'data' => $request->all()
            ]);

            // Validação dos dados
            $validator = $this->validateSupplierData($request, $id);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar dados para atualização
            $supplierData = $this->prepareSupplierData($request);

            // Atualizar o fornecedor
            $supplier->update($supplierData);

            // Carregar relacionamentos
            $supplier->load(['condominium']);

            Log::info('Supplier updated successfully', [
                'supplier_id' => $supplier->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedor atualizado com sucesso',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating supplier', [
                'supplier_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar fornecedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            Log::info('Deleting supplier', [
                'supplier_id' => $id,
                'company_name' => $supplier->company_name
            ]);

            $supplier->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedor excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting supplier', [
                'supplier_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir fornecedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get suppliers by category
     */
    public function getByCategory(Request $request, string $category)
    {
        try {
            $query = Supplier::byCategory($category)->with(['condominium']);

            // Filtrar por condomínio se especificado
            if ($request->has('condominium_id') && $request->condominium_id) {
                $query->byCondominium($request->condominium_id);
            }

            // Apenas ativos por padrão
            if ($request->get('active_only', true)) {
                $query->active();
            }

            $suppliers = $query->orderBy('evaluation', 'desc')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedores encontrados por categoria',
                'data' => $suppliers,
                'category' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving suppliers by category', [
                'category' => $category,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar fornecedores por categoria',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Evaluate a supplier
     */
    public function evaluate(Request $request, string $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'evaluation' => 'required|numeric|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $supplier->update([
                'evaluation' => $request->evaluation
            ]);

            // Carregar relacionamentos atualizados
            $supplier->load(['condominium']);

            // Aqui você poderia criar uma tabela separada para histórico de avaliações
            // Por simplicidade, estou apenas atualizando a avaliação atual

            Log::info('Supplier evaluated', [
                'supplier_id' => $id,
                'evaluation' => $request->evaluation,
                'comment' => $request->comment
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Fornecedor avaliado com sucesso',
                'data' => $supplier
            ]);
        } catch (\Exception $e) {
            Log::error('Error evaluating supplier', [
                'supplier_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao avaliar fornecedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get supplier statistics
     */
    public function getStats(Request $request)
    {
        try {
            $condominiumId = $request->get('condominium_id');

            $query = Supplier::query();
            if ($condominiumId) {
                $query->byCondominium($condominiumId);
            }

            $stats = [
                'total' => $query->count(),
                'active' => $query->where('status', Supplier::STATUS_ACTIVE)->count(),
                'inactive' => $query->where('status', Supplier::STATUS_INACTIVE)->count(),
                'blocked' => $query->where('status', Supplier::STATUS_BLOCKED)->count(),
                'by_category' => [],
                'contracts_expiring' => $query->contractExpiring(30)->count(),
                'average_evaluation' => $query->whereNotNull('evaluation')->where('evaluation', '>', 0)->avg('evaluation')
            ];

            // Estatísticas por categoria
            foreach (Supplier::getCategories() as $key => $name) {
                $stats['by_category'][$key] = [
                    'name' => $name,
                    'count' => $query->where('category', $key)->count()
                ];
            }

            // Estatísticas detalhadas de avaliação
            $evaluationStats = Supplier::getEvaluationStats($condominiumId);
            $stats['evaluation_stats'] = $evaluationStats;

            // Estatísticas por categoria com avaliações
            $categoryStats = Supplier::getCategoryStats($condominiumId);
            $stats['category_stats'] = $categoryStats;

            return response()->json([
                'status' => 'success',
                'message' => 'Estatísticas obtidas com sucesso',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting supplier stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao obter estatísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available categories
     */
    public function getCategories()
    {
        return response()->json([
            'status' => 'success',
            'data' => Supplier::getCategories()
        ]);
    }

    /**
     * Get available supplier types
     */
    public function getSupplierTypes()
    {
        return response()->json([
            'status' => 'success',
            'data' => Supplier::getSupplierTypes()
        ]);
    }

    /**
     * Validate supplier data
     */
    private function validateSupplierData(Request $request, $id = null)
    {
        $rules = [
            'condominium_id' => 'required|exists:condominiums,id',
            'company_name' => 'required|string|max:255',
            'trade_name' => 'nullable|string|max:255',
            'supplier_type' => 'required|in:company,mei,individual',
            'category' => 'required|in:' . implode(',', array_keys(Supplier::getCategories())),
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:suppliers,email' . ($id ? ",$id" : ''),
            'phone' => 'required|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'required|string|max:255',
            'number' => 'nullable|string|max:20',
            'cep' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'state' => 'required|string|size:2',
            'district' => 'nullable|string|max:100',
            'services_description' => 'nullable|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date|after_or_equal:contract_start',
            'status' => 'required|in:' . implode(',', array_keys(Supplier::getStatuses())),
            'evaluation' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'active' => 'boolean'
        ];

        // Validações condicionais baseadas no tipo
        if ($request->supplier_type === 'company') {
            $rules['cnpj'] = 'required|string|max:18|unique:suppliers,cnpj' . ($id ? ",$id" : '');
        } elseif ($request->supplier_type === 'individual' || $request->supplier_type === 'mei') {
            $rules['cpf'] = 'required|string|max:14|unique:suppliers,cpf' . ($id ? ",$id" : '');
        }

        return Validator::make($request->all(), $rules);
    }

    /**
     * Prepare supplier data for storage
     */
    private function prepareSupplierData(Request $request)
    {
        $data = [
            'condominium_id' => $request->condominium_id,
            'company_name' => $request->company_name,
            'trade_name' => $request->trade_name,
            'supplier_type' => $request->supplier_type,
            'category' => $request->category,
            'contact_name' => $request->contact_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'mobile' => $request->mobile,
            'address' => $request->address,
            'number' => $request->number,
            'cep' => $request->cep,
            'city' => $request->city,
            'state' => strtoupper($request->state),
            'district' => $request->district,
            'services_description' => $request->services_description,
            'hourly_rate' => $request->hourly_rate,
            'monthly_rate' => $request->monthly_rate,
            'contract_start' => $request->contract_start,
            'contract_end' => $request->contract_end,
            'status' => $request->status ?? Supplier::STATUS_ACTIVE,
            'evaluation' => $request->evaluation,
            'notes' => $request->notes,
            'emergency_contact' => $request->emergency_contact,
            'active' => $request->get('active', true)
        ];

        // Adicionar CNPJ ou CPF baseado no tipo
        if ($request->supplier_type === 'company') {
            $data['cnpj'] = $request->cnpj;
            $data['cpf'] = null;
        } else {
            $data['cpf'] = $request->cpf;
            $data['cnpj'] = null;
        }

        // Processar documentos e disponibilidade se fornecidos
        if ($request->has('documents')) {
            $data['documents'] = $request->documents;
        }

        if ($request->has('availability')) {
            $data['availability'] = $request->availability;
        }

        return $data;
    }

    /**
     * Generate contract PDF for supplier
     */
    public function generateContract(Request $request, string $id)
    {
        try {
            $supplier = Supplier::with(['condominium'])->findOrFail($id);

            // Preparar dados para o contrato
            $contractData = [
                'supplier' => $supplier,
                'condominium' => $supplier->condominium,
                'generated_at' => now()->format('d/m/Y H:i'),
                'contract_number' => 'CONTRATO-' . str_pad($supplier->id, 6, '0', STR_PAD_LEFT),
            ];

            // Gerar PDF
            $pdf = Pdf::loadView('contracts.supplier-contract', $contractData)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'defaultFont' => 'Arial'
                ]);

            $filename = 'Contrato_' . $supplier->company_name . '_' . date('Y-m-d') . '.pdf';

            return $pdf->stream($filename);
        } catch (\Exception $e) {
            Log::error('Error generating contract PDF', [
                'supplier_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao gerar contrato',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

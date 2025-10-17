<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Condominium;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Resident::with(['condominium', 'unit.block']);

            // Filtrar por condomínio
            if ($request->has('condominium_id') && $request->condominium_id) {
                $query->byCondominium($request->condominium_id);
            }

            // Filtrar por busca
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Filtrar ativos apenas
            if ($request->get('active_only', true)) {
                $query->active();
            }

            // Ordenar
            $query->orderBy('created_at', 'desc');

            $residents = $query->get();

            Log::info('Residents retrieved successfully', [
                'count' => $residents->count(),
                'condominium_id' => $request->condominium_id,
                'search' => $request->search
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Moradores encontrados',
                'data' => $residents
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving residents', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar moradores',
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
            Log::info('Creating new resident', ['data' => $request->all()]);

            // Validação dos dados
            $validator = $this->validateResidentData($request);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar se a unidade já tem morador
            $existingResident = Resident::where('unit_id', $request->unit_id)
                ->where('active', true)
                ->first();

            if ($existingResident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Esta unidade já possui um morador cadastrado',
                    'error' => 'Unit already has a resident'
                ], 422);
            }

            // Preparar dados para criação
            $residentData = $this->prepareResidentData($request);

            // Criar usuário para o proprietário
            $ownerUser = $this->createUserForResident(
                $residentData['owner_name'],
                $residentData['owner_email'],
                $request->condominium_id
            );
            $residentData['owner_user_id'] = $ownerUser->id;

            // Criar usuário para o inquilino (se houver)
            if ($residentData['has_tenant'] && $residentData['tenant_email']) {
                $tenantUser = $this->createUserForResident(
                    $residentData['tenant_name'],
                    $residentData['tenant_email'],
                    $request->condominium_id
                );
                $residentData['tenant_user_id'] = $tenantUser->id;
            }

            // Criar o morador
            $resident = Resident::create($residentData);

            // Carregar relacionamentos
            $resident->load(['condominium', 'unit.block', 'ownerUser', 'tenantUser']);

            Log::info('Resident created successfully', [
                'resident_id' => $resident->id,
                'unit_id' => $resident->unit_id,
                'has_tenant' => $resident->has_tenant,
                'owner_user_id' => $resident->owner_user_id,
                'tenant_user_id' => $resident->tenant_user_id
            ]);

            // Preparar mensagem com senha padrão
            $message = 'Morador criado com sucesso. Senha padrão: Condo@123';

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'data' => $resident,
                'default_password' => 'Condo@123'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating resident', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar morador',
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
            $resident = Resident::with(['condominium', 'unit.block'])->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Morador encontrado',
                'data' => $resident
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving resident', [
                'resident_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Morador não encontrado',
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
            $resident = Resident::findOrFail($id);

            Log::info('Updating resident', [
                'resident_id' => $id,
                'data' => $request->all()
            ]);

            // Validação dos dados
            $validator = $this->validateResidentData($request, $id);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar se mudou de unidade e se a nova já tem morador
            if ($request->unit_id != $resident->unit_id) {
                $existingResident = Resident::where('unit_id', $request->unit_id)
                    ->where('active', true)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existingResident) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'A nova unidade já possui um morador cadastrado',
                        'error' => 'Unit already has a resident'
                    ], 422);
                }
            }

            // Preparar dados para atualização
            $residentData = $this->prepareResidentData($request);

            // Atualizar o morador
            $resident->update($residentData);

            // Carregar relacionamentos
            $resident->load(['condominium', 'unit.block']);

            Log::info('Resident updated successfully', [
                'resident_id' => $resident->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Morador atualizado com sucesso',
                'data' => $resident
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating resident', [
                'resident_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar morador',
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
            $resident = Resident::findOrFail($id);

            Log::info('Deleting resident', [
                'resident_id' => $id,
                'unit_id' => $resident->unit_id
            ]);

            $resident->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Morador excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting resident', [
                'resident_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir morador',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * Validate resident data
     */
    private function validateResidentData(Request $request, $id = null)
    {


        $rules = [
            'condominium_id' => 'required|exists:condominiums,id',
            'unit_id' => 'required|exists:units,id',
            'unit_status' => 'required|in:occupied,vacant,maintenance',

            // Dados do proprietário (obrigatório)
            'owner.name' => 'required|string|max:255',
            'owner.email' => 'required|email|max:255',
            'owner.phone' => 'required|string|max:20',
            'owner.cpf' => 'required|string|max:14',
            'owner.status' => 'required|in:active,inactive,pending',
            'owner.notes' => 'nullable|string',

            // Dados do inquilino (opcional)
            'tenant.has_tenant' => 'boolean',
            'tenant.name' => 'nullable|string|max:255',
            'tenant.email' => 'nullable|email|max:255',
            'tenant.phone' => 'nullable|string|max:20',
            'tenant.cpf' => 'nullable|string|max:14',
            'tenant.status' => 'nullable|in:active,inactive,pending',
            'tenant.lease_start' => 'nullable|date',
            'tenant.lease_end' => 'nullable|date|after_or_equal:tenant.lease_start',
            'tenant.notes' => 'nullable|string',

            // Observações gerais
            'notes' => 'nullable|string',
            'active' => 'boolean'
        ];

        // Se tem inquilino, validar campos obrigatórios
        $tenantData = $request->input('tenant', []);
        $hasTenant = data_get($tenantData, 'has_tenant', false);

        if ($hasTenant) {
            $rules['tenant.name'] = 'required|string|max:255';
            $rules['tenant.email'] = 'required|email|max:255';
            $rules['tenant.phone'] = 'required|string|max:20';
            $rules['tenant.cpf'] = 'required|string|max:14';
            $rules['tenant.lease_start'] = 'required|date';
        }

        // Validar CPFs únicos
        $ownerData = $request->input('owner', []);
        $ownerCpf = data_get($ownerData, 'cpf');
        $tenantCpf = data_get($tenantData, 'cpf');

        if ($ownerCpf) {
            $ownerCpfRule = 'unique:residents,owner_cpf';
            if ($id) {
                $ownerCpfRule .= ',' . $id;
            }
            $rules['owner.cpf'] .= '|' . $ownerCpfRule;
        }

        if ($hasTenant && $tenantCpf) {
            $tenantCpfRule = 'unique:residents,tenant_cpf';
            if ($id) {
                $tenantCpfRule .= ',' . $id;
            }
            $rules['tenant.cpf'] .= '|' . $tenantCpfRule;
        }

        return Validator::make($request->all(), $rules);
    }

    /**
     * Prepare resident data for storage
     */
    private function prepareResidentData(Request $request)
    {
        // Extrair dados do proprietário
        $ownerData = $request->input('owner', []);
        $tenantData = $request->input('tenant', []);
        $hasTenant = data_get($tenantData, 'has_tenant', false);

        $data = [
            'condominium_id' => $request->condominium_id,
            'unit_id' => $request->unit_id,
            'unit_status' => $request->unit_status ?? 'occupied',

            // Dados do proprietário
            'owner_name' => data_get($ownerData, 'name'),
            'owner_email' => data_get($ownerData, 'email'),
            'owner_phone' => data_get($ownerData, 'phone'),
            'owner_cpf' => data_get($ownerData, 'cpf'),
            'owner_status' => data_get($ownerData, 'status', 'active'),
            'owner_notes' => data_get($ownerData, 'notes'),

            // Dados do inquilino
            'has_tenant' => $hasTenant,
            'tenant_name' => $hasTenant ? data_get($tenantData, 'name') : null,
            'tenant_email' => $hasTenant ? data_get($tenantData, 'email') : null,
            'tenant_phone' => $hasTenant ? data_get($tenantData, 'phone') : null,
            'tenant_cpf' => $hasTenant ? data_get($tenantData, 'cpf') : null,
            'tenant_status' => $hasTenant ? data_get($tenantData, 'status', 'active') : 'inactive',
            'tenant_lease_start' => $hasTenant ? data_get($tenantData, 'lease_start') : null,
            'tenant_lease_end' => $hasTenant ? data_get($tenantData, 'lease_end') : null,
            'tenant_notes' => $hasTenant ? data_get($tenantData, 'notes') : null,

            // Informações gerais
            'total_residents' => $hasTenant ? 2 : 1,
            'notes' => $request->notes,
            'active' => $request->get('active', true)
        ];

        return $data;
    }

    /**
     * Create a user account for a resident (owner or tenant)
     */
    private function createUserForResident($name, $email, $condominiumId)
    {
        // Verificar se já existe um usuário com este e-mail
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            Log::info('User already exists, reusing', ['email' => $email]);
            return $existingUser;
        }

        // Senha padrão
        $defaultPassword = 'Condo@123';

        // Criar novo usuário
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($defaultPassword),
            'access_level' => 'morador',
            'access_level_name' => 'Morador',
            'condominium_id' => $condominiumId,
        ]);

        Log::info('User created for resident', [
            'user_id' => $user->id,
            'email' => $email,
            'access_level' => 'morador'
        ]);

        return $user;
    }
}

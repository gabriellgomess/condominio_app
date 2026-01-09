<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\Announcement;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MobileResidentController extends Controller
{
    /**
     * Get resident profile and property information
     */
    public function getProfile(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->isMorador()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Acesso não autorizado. Apenas moradores podem acessar esta área.'
                ], 403);
            }

            // Buscar dados do morador como proprietário ou inquilino
            $residentAsOwner = Resident::with(['condominium', 'unit.block'])
                ->where('owner_user_id', $user->id)
                ->first();

            $residentAsTenant = Resident::with(['condominium', 'unit.block'])
                ->where('tenant_user_id', $user->id)
                ->first();

            $resident = $residentAsOwner ?? $residentAsTenant;

            if (!$resident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados do morador não encontrados'
                ], 404);
            }

            // Determinar tipo de vínculo
            $residentType = $residentAsOwner ? 'owner' : 'tenant';

            // Preparar dados da resposta
            $profile = [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'resident_type' => $residentType,
                'resident_data' => $residentType === 'owner' ? [
                    'name' => $resident->owner_name,
                    'email' => $resident->owner_email,
                    'phone' => $resident->owner_phone,
                    'cpf' => $resident->owner_cpf,
                    'status' => $resident->owner_status,
                ] : [
                    'name' => $resident->tenant_name,
                    'email' => $resident->tenant_email,
                    'phone' => $resident->tenant_phone,
                    'cpf' => $resident->tenant_cpf,
                    'status' => $resident->tenant_status,
                    'lease_start' => $resident->tenant_lease_start?->format('d/m/Y'),
                    'lease_end' => $resident->tenant_lease_end?->format('d/m/Y'),
                ],
                'condominium' => [
                    'id' => $resident->condominium->id,
                    'name' => $resident->condominium->name,
                    'address' => $resident->condominium->address ?? '',
                ],
                'unit' => [
                    'id' => $resident->unit->id,
                    'number' => $resident->unit->number,
                    'floor' => $resident->unit->floor ?? '',
                    'block' => $resident->unit->block ? [
                        'id' => $resident->unit->block->id,
                        'name' => $resident->unit->block->name,
                    ] : null,
                    'status' => $resident->unit_status,
                ],
                'total_residents' => $resident->total_residents,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Perfil do morador',
                'data' => $profile
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving resident profile', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar perfil do morador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get announcements for resident's condominium
     */
    public function getAnnouncements(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->isMorador()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Acesso não autorizado'
                ], 403);
            }

            $resident = Resident::where('owner_user_id', $user->id)
                ->orWhere('tenant_user_id', $user->id)
                ->first();

            if (!$resident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados do morador não encontrados'
                ], 404);
            }

            $announcements = Announcement::where('condominium_id', $resident->condominium_id)
                ->where('status', 'published')
                ->orderBy('published_at', 'desc')
                ->limit(20)
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Comunicados',
                'data' => $announcements
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving announcements', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar comunicados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get incidents for resident's unit
     */
    public function getIncidents(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->isMorador()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Acesso não autorizado'
                ], 403);
            }

            $resident = Resident::where('owner_user_id', $user->id)
                ->orWhere('tenant_user_id', $user->id)
                ->first();

            if (!$resident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados do morador não encontrados'
                ], 404);
            }

            $incidents = Incident::where('unit_id', $resident->unit_id)
                ->with(['type', 'priority', 'status'])
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Ocorrências',
                'data' => $incidents
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving incidents', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar ocorrências',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new incident for resident's unit
     */
    public function createIncident(Request $request)
    {
        try {
            $user = Auth::user();

            if (!$user->isMorador()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Acesso não autorizado'
                ], 403);
            }

            $resident = Resident::where('owner_user_id', $user->id)
                ->orWhere('tenant_user_id', $user->id)
                ->first();

            if (!$resident) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados do morador não encontrados'
                ], 404);
            }

            $validated = $request->validate([
                'type_id' => 'required|exists:incident_types,id',
                'priority_id' => 'required|exists:incident_priorities,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'nullable|string|max:255',
            ]);

            $incident = Incident::create([
                'condominium_id' => $resident->condominium_id,
                'unit_id' => $resident->unit_id,
                'type_id' => $validated['type_id'],
                'priority_id' => $validated['priority_id'],
                'status_id' => 1, // Status inicial (ex: "Aberta")
                'title' => $validated['title'],
                'description' => $validated['description'],
                'location' => $validated['location'] ?? null,
                'reported_by' => $user->name,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Ocorrência criada com sucesso',
                'data' => $incident
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating incident', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar ocorrência',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

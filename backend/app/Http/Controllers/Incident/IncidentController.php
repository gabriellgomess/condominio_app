<?php

namespace App\Http\Controllers\Incident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Incident;

class IncidentController extends Controller
{
    /**
     * Display a listing of incidents for a specific condominium.
     */
    public function index(Request $request, $condominium_id = null)
    {
        try {
            $query = Incident::with(['user', 'condominium', 'block', 'unit', 'resident'])
                ->orderBy('created_at', 'desc');

            if ($condominium_id) {
                $query->where('condominium_id', $condominium_id);
            }

            // Filtros
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('incident_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('incident_date', '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            }

            $incidents = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $incidents
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar ocorrências',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created incident.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'condominium_id' => 'required|exists:condominiums,id',
                'block_id' => 'nullable|exists:blocks,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'type' => 'required|in:manutencao,seguranca,ruido,limpeza,vizinhanca,outros',
                'priority' => 'required|in:baixa,media,alta,urgente',
                'location' => 'required|string|max:255',
                'incident_date' => 'required|date',
                'unit_id' => 'nullable|exists:units,id',
                'resident_id' => 'nullable|exists:residents,id',
                'photos.*' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
                'is_anonymous' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $data = $validator->validated();
            $data['user_id'] = auth()->id();
            $data['status'] = 'aberta';
            $data['reported_by'] = $request->input('reported_by', 'administracao');

            // Handle file uploads
            $photos = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('incidents', $filename, 'public');
                    $photos[] = $path;
                }
                $data['photos'] = $photos; // O cast do modelo vai converter para JSON automaticamente
            }

            $incident = Incident::create($data);
            $incident->load(['user', 'condominium', 'block', 'unit', 'resident']);

            return response()->json([
                'success' => true,
                'message' => 'Ocorrência registrada com sucesso',
                'data' => $incident
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar ocorrência',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified incident.
     */
    public function show(string $id)
    {
        try {
            $incident = Incident::with(['user', 'condominium', 'unit', 'resident'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $incident
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ocorrência não encontrada',
                'error' => $e->getMessage()
            ], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Update the specified incident.
     */
    public function update(Request $request, string $id)
    {
        try {
            $incident = Incident::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'type' => 'sometimes|in:manutencao,seguranca,ruido,limpeza,vizinhanca,outros',
                'priority' => 'sometimes|in:baixa,media,alta,urgente',
                'status' => 'sometimes|in:aberta,em_andamento,resolvida,fechada',
                'location' => 'sometimes|string|max:255',
                'incident_date' => 'sometimes|date',
                'resolution' => 'nullable|string',
                'resolved_at' => 'nullable|date',
                'block_id' => 'nullable|exists:blocks,id',
                'unit_id' => 'nullable|exists:units,id',
                'resident_id' => 'nullable|exists:residents,id',
                'photos.*' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
                'is_anonymous' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $data = $validator->validated();

            // Handle file uploads
            if ($request->hasFile('photos')) {
                // Delete old photos
                if ($incident->photos) {
                    $oldPhotos = json_decode($incident->photos, true);
                    foreach ($oldPhotos as $photo) {
                        Storage::disk('public')->delete($photo);
                    }
                }

                $photos = [];
                foreach ($request->file('photos') as $file) {
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('incidents', $filename, 'public');
                    $photos[] = $path;
                }
                $data['photos'] = json_encode($photos);
            }

            // Auto set resolved_at when status is changed to resolved
            if (isset($data['status']) && $data['status'] === 'resolvida' && !$incident->resolved_at) {
                $data['resolved_at'] = now();
            }

            $incident->update($data);
            $incident->load(['user', 'condominium', 'unit', 'resident']);

            return response()->json([
                'success' => true,
                'message' => 'Ocorrência atualizada com sucesso',
                'data' => $incident
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar ocorrência',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified incident.
     */
    public function destroy(string $id)
    {
        try {
            $incident = Incident::findOrFail($id);

            // Delete associated photos
            if ($incident->photos) {
                $photos = json_decode($incident->photos, true);
                foreach ($photos as $photo) {
                    Storage::disk('public')->delete($photo);
                }
            }

            $incident->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ocorrência excluída com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir ocorrência',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get incidents statistics
     */
    public function stats(Request $request, $condominium_id = null)
    {
        try {
            $query = Incident::query();

            if ($condominium_id) {
                $query->where('condominium_id', $condominium_id);
            }

            $totalIncidents = (clone $query)->count();
            $openIncidents = (clone $query)->where('status', 'aberta')->count();
            $inProgressIncidents = (clone $query)->where('status', 'em_andamento')->count();
            $resolvedIncidents = (clone $query)->where('status', 'resolvida')->count();
            $closedIncidents = (clone $query)->where('status', 'fechada')->count();

            // Incidents by type
            $incidentsByType = (clone $query)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type')
                ->toArray();

            // Incidents by priority
            $incidentsByPriority = (clone $query)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get()
                ->pluck('count', 'priority')
                ->toArray();

            // Recent incidents (last 7 days)
            $recentIncidents = (clone $query)
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $totalIncidents,
                    'open' => $openIncidents,
                    'in_progress' => $inProgressIncidents,
                    'resolved' => $resolvedIncidents,
                    'closed' => $closedIncidents,
                    'recent' => $recentIncidents,
                    'by_type' => $incidentsByType,
                    'by_priority' => $incidentsByPriority
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar estatísticas',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get incident types
     */
    public function getTypes()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'manutencao' => 'Manutenção',
                'seguranca' => 'Segurança',
                'ruido' => 'Ruído/Barulho',
                'limpeza' => 'Limpeza',
                'vizinhanca' => 'Vizinhança',
                'outros' => 'Outros'
            ]
        ]);
    }

    /**
     * Get incident priorities
     */
    public function getPriorities()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'baixa' => 'Baixa',
                'media' => 'Média',
                'alta' => 'Alta',
                'urgente' => 'Urgente'
            ]
        ]);
    }

    /**
     * Get incident statuses
     */
    public function getStatuses()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'aberta' => 'Aberta',
                'em_andamento' => 'Em Andamento',
                'resolvida' => 'Resolvida',
                'fechada' => 'Fechada'
            ]
        ]);
    }

    /**
     * Get incidents created by the authenticated user (for residents using mobile app)
     */
    public function myIncidents(Request $request)
    {
        try {
            $user = auth()->user();

            $query = Incident::with(['condominium', 'block', 'unit', 'resident'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            // Aplicar filtros se fornecidos
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            // Paginação
            $perPage = $request->get('per_page', 15);
            $incidents = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Suas ocorrências',
                'data' => $incidents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar ocorrências',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for logged in user incidents
     */
    public function myStats(Request $request)
    {
        try {
            $user = auth()->user();

            $query = Incident::where('user_id', $user->id);

            $totalIncidents = (clone $query)->count();
            $openIncidents = (clone $query)->where('status', 'aberta')->count();
            $inProgressIncidents = (clone $query)->where('status', 'em_andamento')->count();
            $resolvedIncidents = (clone $query)->where('status', 'resolvida')->count();
            $closedIncidents = (clone $query)->where('status', 'fechada')->count();

            // Recent incidents (last 7 days)
            $recentIncidents = (clone $query)
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total' => $totalIncidents,
                    'open' => $openIncidents,
                    'in_progress' => $inProgressIncidents,
                    'resolved' => $resolvedIncidents,
                    'closed' => $closedIncidents,
                    'recent' => $recentIncidents
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar estatísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
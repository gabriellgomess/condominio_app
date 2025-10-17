<?php

namespace App\Http\Controllers\Announcement;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Announcement::with(['user', 'condominium'])
                ->orderBy('created_at', 'desc');

            // Filtrar por condomínio se especificado
            if ($request->has('condominium_id')) {
                $query->byCondominium($request->condominium_id);
            }

            // Filtrar por status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filtrar por prioridade
            if ($request->has('priority')) {
                $query->byPriority($request->priority);
            }

            // Busca por texto
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            }

            // Paginação
            $perPage = $request->get('per_page', 15);
            $announcements = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $announcements
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FETCH_ERROR',
                    'message' => 'Erro ao buscar comunicados',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'condominium_id' => 'required|exists:condominiums,id',
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'priority' => 'required|in:low,normal,high,urgent',
                'target_type' => 'required|in:all,block,unit,specific',
                'target_ids' => 'nullable|array',
                'expires_at' => 'nullable|date|after:now',
                'send_email' => 'boolean',
                'send_notification' => 'boolean',
                'attachments' => 'nullable|array',
                'notes' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => 'Dados inválidos',
                        'details' => $validator->errors()
                    ]
                ], 422);
            }

            $announcement = Announcement::create([
                'condominium_id' => $request->condominium_id,
                'user_id' => Auth::id(),
                'title' => $request->title,
                'content' => $request->content,
                'priority' => $request->priority,
                'target_type' => $request->target_type,
                'target_ids' => $request->target_ids,
                'expires_at' => $request->expires_at,
                'send_email' => $request->send_email ?? false,
                'send_notification' => $request->send_notification ?? true,
                'attachments' => $request->attachments,
                'notes' => $request->notes,
                'status' => 'draft'
            ]);

            $announcement->load(['user', 'condominium']);

            return response()->json([
                'success' => true,
                'data' => $announcement,
                'message' => 'Comunicado criado com sucesso'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'CREATE_ERROR',
                    'message' => 'Erro ao criar comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Display the specified announcement.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $announcement = Announcement::with(['user', 'condominium'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $announcement
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Comunicado não encontrado',
                    'details' => $e->getMessage()
                ]
            ], 404);
        }
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $announcement = Announcement::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'content' => 'sometimes|required|string',
                'priority' => 'sometimes|required|in:low,normal,high,urgent',
                'target_type' => 'sometimes|required|in:all,block,unit,specific',
                'target_ids' => 'nullable|array',
                'expires_at' => 'nullable|date|after:now',
                'send_email' => 'boolean',
                'send_notification' => 'boolean',
                'attachments' => 'nullable|array',
                'notes' => 'nullable|string',
                'status' => 'sometimes|required|in:draft,published,archived'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => 'Dados inválidos',
                        'details' => $validator->errors()
                    ]
                ], 422);
            }

            $announcement->update($request->only([
                'title', 'content', 'priority', 'target_type', 'target_ids',
                'expires_at', 'send_email', 'send_notification', 'attachments',
                'notes', 'status'
            ]));

            $announcement->load(['user', 'condominium']);

            return response()->json([
                'success' => true,
                'data' => $announcement,
                'message' => 'Comunicado atualizado com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UPDATE_ERROR',
                    'message' => 'Erro ao atualizar comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $announcement = Announcement::findOrFail($id);
            $announcement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Comunicado excluído com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'DELETE_ERROR',
                    'message' => 'Erro ao excluir comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Publish an announcement.
     */
    public function publish(string $id): JsonResponse
    {
        try {
            $announcement = Announcement::findOrFail($id);

            if ($announcement->publish()) {
                $announcement->load(['user', 'condominium']);

                return response()->json([
                    'success' => true,
                    'data' => $announcement,
                    'message' => 'Comunicado publicado com sucesso'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'PUBLISH_ERROR',
                    'message' => 'Erro ao publicar comunicado'
                ]
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'PUBLISH_ERROR',
                    'message' => 'Erro ao publicar comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Archive an announcement.
     */
    public function archive(string $id): JsonResponse
    {
        try {
            $announcement = Announcement::findOrFail($id);

            if ($announcement->archive()) {
                $announcement->load(['user', 'condominium']);

                return response()->json([
                    'success' => true,
                    'data' => $announcement,
                    'message' => 'Comunicado arquivado com sucesso'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ARCHIVE_ERROR',
                    'message' => 'Erro ao arquivar comunicado'
                ]
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ARCHIVE_ERROR',
                    'message' => 'Erro ao arquivar comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Unpublish an announcement.
     */
    public function unpublish(string $id): JsonResponse
    {
        try {
            $announcement = Announcement::findOrFail($id);

            if ($announcement->unpublish()) {
                $announcement->load(['user', 'condominium']);

                return response()->json([
                    'success' => true,
                    'data' => $announcement,
                    'message' => 'Comunicado despublicado com sucesso'
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UNPUBLISH_ERROR',
                    'message' => 'Erro ao despublicar comunicado'
                ]
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UNPUBLISH_ERROR',
                    'message' => 'Erro ao despublicar comunicado',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Get announcement statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $condominiumId = $request->get('condominium_id');

            $query = Announcement::query();
            if ($condominiumId) {
                $query->byCondominium($condominiumId);
            }

            $stats = [
                'total' => $query->count(),
                'published' => $query->where('status', 'published')->count(),
                'drafts' => $query->where('status', 'draft')->count(),
                'archived' => $query->where('status', 'archived')->count(),
                'urgent' => $query->where('priority', 'urgent')->count(),
                'expired' => $query->where('expires_at', '<', now())->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'STATS_ERROR',
                    'message' => 'Erro ao buscar estatísticas',
                    'details' => $e->getMessage()
                ]
            ], 500);
        }
    }
}

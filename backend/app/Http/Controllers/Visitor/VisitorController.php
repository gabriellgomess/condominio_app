<?php

namespace App\Http\Controllers\Visitor;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use App\Models\Condominium;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VisitorController extends Controller
{
    /**
     * Listar visitantes de um condomínio
     */
    public function index(Request $request, $condominium_id)
    {
        try {
            \Log::info('Buscando visitantes', [
                'condominium_id' => $condominium_id,
                'filters' => $request->all(),
                'user_id' => auth()->id()
            ]);

            $condominium = Condominium::findOrFail($condominium_id);

            $query = Visitor::where('condominium_id', $condominium_id)
                ->with(['unit', 'resident', 'condominium']);

            // Filtros
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            if ($request->has('unit_id') && !empty($request->unit_id)) {
                $query->where('unit_id', $request->unit_id);
            }

            if ($request->has('visitor_type') && !empty($request->visitor_type)) {
                $query->where('visitor_type', $request->visitor_type);
            }

            if ($request->has('scheduled_date') && !empty($request->scheduled_date)) {
                $query->whereDate('scheduled_date', $request->scheduled_date);
            }

            // Busca por nome
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('document_number', 'LIKE', "%{$search}%")
                        ->orWhere('vehicle_plate', 'LIKE', "%{$search}%");
                });
            }

            $visitors = $query->orderBy('created_at', 'desc')->get();

            \Log::info('Visitantes encontrados', [
                'count' => $visitors->count(),
                'condominium_id' => $condominium_id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Visitantes encontrados',
                'data' => $visitors,
                'total' => $visitors->count()
            ], 200);
        } catch (\Throwable $th) {
            \Log::error('Erro ao buscar visitantes', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao buscar visitantes',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Criar novo visitante
     */
    public function store(Request $request, $condominium_id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'document_type' => 'required|in:rg,cpf,cnh,other',
                'document_number' => 'nullable|string|max:50',
                'phone' => 'nullable|string|max:20',
                'unit_id' => 'nullable|exists:units,id',
                'visitor_type' => 'required|in:personal,service,delivery,taxi,other',
                'purpose' => 'nullable|string|max:255',
                'scheduled_date' => 'nullable|date',
                'scheduled_time' => 'nullable',
                'vehicle_plate' => 'nullable|string|max:10',
                'vehicle_model' => 'nullable|string|max:100',
                'vehicle_color' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
                'document_photo_front' => 'nullable|string', // Base64 ou URL
                'document_photo_back' => 'nullable|string',  // Base64 ou URL
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $condominium = Condominium::findOrFail($condominium_id);

            $data = $request->all();
            $data['condominium_id'] = $condominium_id;

            // Tentar obter resident_id do usuário autenticado, se disponível
            $user = auth()->user();
            $data['resident_id'] = null;
            if ($user && $user->resident) {
                $data['resident_id'] = $user->resident->id;
            }

            $data['authorized_by'] = auth()->id();
            $data['status'] = Visitor::STATUS_PENDING; // Aguardando validação

            // Processar upload de foto da frente do documento
            if ($request->has('document_photo_front') && !empty($request->document_photo_front)) {
                $data['document_photo_front'] = $this->saveBase64Image(
                    $request->document_photo_front,
                    'visitors/documents',
                    'front_' . time()
                );
            }

            // Processar upload de foto do verso do documento
            if ($request->has('document_photo_back') && !empty($request->document_photo_back)) {
                $data['document_photo_back'] = $this->saveBase64Image(
                    $request->document_photo_back,
                    'visitors/documents',
                    'back_' . time()
                );
            }

            \Log::info('Criando visitante', [
                'condominium_id' => $condominium_id,
                'data' => array_merge($data, [
                    'document_photo_front' => isset($data['document_photo_front']) ? 'presente' : 'ausente',
                    'document_photo_back' => isset($data['document_photo_back']) ? 'presente' : 'ausente'
                ])
            ]);

            $visitor = Visitor::create($data);
            $visitor->load(['unit', 'resident', 'condominium']);

            \Log::info('Visitante criado com sucesso', [
                'visitor_id' => $visitor->id,
                'condominium_id' => $condominium_id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Visitante cadastrado com sucesso. Aguardando validação do síndico/administrador.',
                'data' => $visitor
            ], 201);
        } catch (\Throwable $th) {
            \Log::error('Erro ao cadastrar visitante', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
                'condominium_id' => $condominium_id
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao cadastrar visitante',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir um visitante específico
     */
    public function show($id)
    {
        try {
            $visitor = Visitor::with(['unit', 'resident', 'condominium', 'authorizedBy', 'validatedBy'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Visitante encontrado',
                'data' => $visitor
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Visitante não encontrado',
                'error' => $th->getMessage()
            ], 404);
        }
    }

    /**
     * Atualizar visitante
     */
    public function update(Request $request, $id)
    {
        try {
            $visitor = Visitor::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'document_type' => 'sometimes|in:rg,cpf,cnh,other',
                'document_number' => 'nullable|string|max:50',
                'phone' => 'nullable|string|max:20',
                'visitor_type' => 'sometimes|in:personal,service,delivery,taxi,other',
                'purpose' => 'nullable|string|max:255',
                'scheduled_date' => 'nullable|date',
                'scheduled_time' => 'nullable',
                'vehicle_plate' => 'nullable|string|max:10',
                'vehicle_model' => 'nullable|string|max:100',
                'vehicle_color' => 'nullable|string|max:50',
                'notes' => 'nullable|string',
                'document_photo_front' => 'nullable|string',
                'document_photo_back' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->except(['condominium_id', 'resident_id', 'status']);

            // Processar upload de foto da frente
            if ($request->has('document_photo_front') && !empty($request->document_photo_front)) {
                // Deletar foto antiga se existir
                if ($visitor->document_photo_front) {
                    Storage::disk('public')->delete($visitor->document_photo_front);
                }
                $data['document_photo_front'] = $this->saveBase64Image(
                    $request->document_photo_front,
                    'visitors/documents',
                    'front_' . time()
                );
            }

            // Processar upload de foto do verso
            if ($request->has('document_photo_back') && !empty($request->document_photo_back)) {
                // Deletar foto antiga se existir
                if ($visitor->document_photo_back) {
                    Storage::disk('public')->delete($visitor->document_photo_back);
                }
                $data['document_photo_back'] = $this->saveBase64Image(
                    $request->document_photo_back,
                    'visitors/documents',
                    'back_' . time()
                );
            }

            $visitor->update($data);
            $visitor->load(['unit', 'resident', 'condominium']);

            return response()->json([
                'status' => 'success',
                'message' => 'Visitante atualizado com sucesso',
                'data' => $visitor
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar visitante',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar visitante
     */
    public function destroy($id)
    {
        try {
            $visitor = Visitor::findOrFail($id);

            // Deletar fotos do storage
            if ($visitor->document_photo_front) {
                Storage::disk('public')->delete($visitor->document_photo_front);
            }
            if ($visitor->document_photo_back) {
                Storage::disk('public')->delete($visitor->document_photo_back);
            }

            $visitor->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Visitante excluído com sucesso'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir visitante',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Validar visitante (síndico/admin)
     */
    public function validate(Request $request, $id)
    {
        try {
            $visitor = Visitor::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'action' => 'required|in:approve,reject',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dados inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->action === 'approve') {
                $visitor->status = Visitor::STATUS_SCHEDULED;
                $visitor->validated_by = auth()->id();
                $visitor->validated_at = now();
                $message = 'Visitante aprovado com sucesso';
            } else {
                $visitor->status = Visitor::STATUS_REJECTED;
                $visitor->validated_by = auth()->id();
                $visitor->validated_at = now();
                $message = 'Visitante rejeitado';
            }

            if ($request->has('notes')) {
                $visitor->notes = $request->notes;
            }

            $visitor->save();
            $visitor->load(['unit', 'resident', 'condominium', 'validatedBy']);

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'data' => $visitor
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao validar visitante',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Check-in (portaria registra entrada)
     */
    public function checkIn(Request $request, $id)
    {
        try {
            $visitor = Visitor::findOrFail($id);

            if (!$visitor->canCheckIn()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Visitante não pode fazer check-in. Status atual: ' . $visitor->status_name
                ], 400);
            }

            $visitor->status = Visitor::STATUS_CHECKED_IN;
            $visitor->entry_date = now();
            $visitor->entry_time = now()->format('H:i:s');
            $visitor->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Check-in realizado com sucesso',
                'data' => $visitor
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao realizar check-in',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Check-out (portaria registra saída)
     */
    public function checkOut(Request $request, $id)
    {
        try {
            $visitor = Visitor::findOrFail($id);

            if (!$visitor->canCheckOut()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Visitante não pode fazer check-out. Status atual: ' . $visitor->status_name
                ], 400);
            }

            $visitor->status = Visitor::STATUS_CHECKED_OUT;
            $visitor->exit_date = now();
            $visitor->exit_time = now()->format('H:i:s');
            $visitor->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Check-out realizado com sucesso',
                'data' => $visitor
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao realizar check-out',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Helper para salvar imagem base64
     */
    private function saveBase64Image($base64String, $directory, $filename)
    {
        // Remove o prefixo data:image/...;base64, se existir
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $base64String = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, gif, etc.

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('Tipo de imagem inválido');
            }

            $base64String = str_replace(' ', '+', $base64String);
            $imageData = base64_decode($base64String);

            if ($imageData === false) {
                throw new \Exception('Falha ao decodificar imagem');
            }

            $filename = $filename . '.' . $type;
            $path = $directory . '/' . $filename;

            Storage::disk('public')->put($path, $imageData);

            return $path;
        }

        throw new \Exception('Formato de imagem base64 inválido');
    }
}

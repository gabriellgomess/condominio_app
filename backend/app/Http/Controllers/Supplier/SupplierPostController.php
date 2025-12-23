<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Models\SupplierPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SupplierPostController extends Controller
{
    public function index(Request $request)
    {
        $query = SupplierPost::with('supplier');

        // Filtrar por supplier_id apenas se não estiver vazio
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // Filtrar por busca de texto
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Filtrar apenas ativos se o parâmetro for verdadeiro
        if ($request->filled('active_only') && filter_var($request->active_only, FILTER_VALIDATE_BOOLEAN)) {
            $query->active();
        }

        $posts = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'services_offered' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'price' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'catalog_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('supplier_posts', $filename, 'public');
            $data['image_path'] = $path;
        }

        $post = SupplierPost::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Publicação criada com sucesso',
            'data' => $post->load('supplier')
        ], 201);
    }

    public function show($id)
    {
        $post = SupplierPost::with('supplier')->find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Publicação não encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    public function update(Request $request, $id)
    {
        $post = SupplierPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Publicação não encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'services_offered' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'price' => 'nullable|numeric|min:0',
            'contact_info' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'catalog_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($post->image_path && Storage::disk('public')->exists($post->image_path)) {
                Storage::disk('public')->delete($post->image_path);
            }

            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $path = $image->storeAs('supplier_posts', $filename, 'public');
            $data['image_path'] = $path;
        }

        $post->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Publicação atualizada com sucesso',
            'data' => $post->load('supplier')
        ]);
    }

    public function destroy($id)
    {
        $post = SupplierPost::find($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Publicação não encontrada'
            ], 404);
        }

        if ($post->image_path && Storage::disk('public')->exists($post->image_path)) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Publicação excluída com sucesso'
        ]);
    }
}

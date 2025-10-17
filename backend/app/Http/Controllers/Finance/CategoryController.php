<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Category::with('subaccount');

        // Filtrar por subconta
        if ($request->has('subaccount_id')) {
            $query->where('subaccount_id', $request->integer('subaccount_id'));
        }

        // Filtrar por status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Busca por nome
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        return response()->json($query->orderBy('name')->paginate(50));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'subaccount_id' => 'required|exists:subaccounts,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category = Category::create($data);
        return response()->json([
            'success' => true,
            'data' => $category->load('subaccount')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        return response()->json($category->load('subaccount'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($data);
        return response()->json([
            'success' => true,
            'data' => $category->load('subaccount')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Get categories by subaccount
     */
    public function getBySubaccount($subaccountId)
    {
        $categories = Category::where('subaccount_id', $subaccountId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json($categories);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    protected $rules = [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'original_price' => 'required|numeric|min:0',
        'sale_price' => 'required|numeric|min:0',
        'category' => 'required|string',
        'on_sale' => 'sometimes|boolean',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
    ];

    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        if ($request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $products = $query->latest()->get();

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    public function stats()
    {
        $total = Product::count();
        $onSale = Product::where('on_sale', true)->count();
        $totalValue = Product::sum('sale_price');
        $averagePrice = $total > 0 ? $totalValue / $total : 0;

        return response()->json([
            'success' => true,
            'stats' => [
                'total' => $total,
                'on_sale' => $onSale,
                'total_value' => (float) $totalValue,
                'average_price' => (float) $averagePrice
            ]
        ]);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'success' => true,
            'product' => $product
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->rules);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['on_sale'] = $request->boolean('on_sale');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'product' => $product,
            'message' => 'Product created successfully'
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), $this->rules);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['on_sale'] = $request->boolean('on_sale');

        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        } elseif ($request->has('remove_image') && $request->remove_image) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = null;
        }

        $product->update($data);

        return response()->json([
            'success' => true, 
            'product' => $product,
            'message' => 'Product updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
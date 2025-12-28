<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class OrdersController extends Controller
{
    public function store(Request $request)
    {
        // Enable error reporting
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        
        // Debug: Log incoming request
        \Log::info('Order request received:', $request->all());
        
        // Try to get authenticated user
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'No token provided'
                ], 401);
            }
            
            $user = JWTAuth::authenticate($token);
            \Log::info('User authenticated:', ['user_id' => $user->id, 'email' => $user->email]);
            
        } catch (\Exception $e) {
            \Log::error('JWT Auth failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 401);
        }

        // Simple validation
        $validator = Validator::make($request->all(), [
            'firstName' => 'required',
            'lastName' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'address' => 'required',
            'subcity' => 'required',
            'city' => 'required',
            'payment_method' => 'required',
            'items' => 'required|array|min:1',
            'subtotal' => 'required|numeric',
            'delivery_fee' => 'required|numeric',
            'tax' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Start transaction
            DB::beginTransaction();

            // Generate order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(6)) . '-' . date('YmdHis');
            
            // Combine names
            $customerName = trim($request->firstName . ' ' . $request->lastName);
            
            // Create order - use direct assignment MATCHING YOUR MODEL
            $order = new Order();
            $order->user_id = $user->id;
            $order->order_number = $orderNumber;
            $order->customer_name = $customerName;
            $order->customer_email = $request->email;
            $order->customer_phone = $request->phone;
            $order->delivery_address = $request->address;
            $order->delivery_subcity = $request->subcity;
            $order->delivery_city = $request->city;
            $order->delivery_woreda = $request->woreda ?? null;        // Changed from woreda
            $order->delivery_house_number = $request->houseNumber ?? null; // Changed from house_number
            $order->delivery_apartment = $request->apartment ?? null;     // Changed from apartment
            $order->order_notes = $request->notes ?? null;                // Changed from notes
            $order->payment_method = $request->payment_method;
            $order->subtotal = $request->subtotal;
            $order->delivery_fee = $request->delivery_fee;
            $order->tax_amount = $request->tax;
            $order->total_amount = $request->total;
            $order->currency = 'ETB';
            $order->exchange_rate = 55.00; // USD to ETB conversion rate
            $order->status = 'pending';
            $order->order_date = now();
            
            \Log::info('Attempting to save order with fields:', [
                'user_id' => $order->user_id,
                'order_number' => $order->order_number,
                'delivery_woreda' => $order->delivery_woreda,
                'delivery_house_number' => $order->delivery_house_number,
                'delivery_apartment' => $order->delivery_apartment,
                'order_notes' => $order->order_notes
            ]);
            
            if ($order->save()) {
                \Log::info('Order saved successfully', ['order_id' => $order->id]);
                
                // Create order items - FIXED: Use correct database column names
                foreach ($request->items as $item) {
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id;
                    $orderItem->product_id = $item['id'];
                    $orderItem->product_name = $item['name'];
                    
                    // FIX: Use 'price' not 'unit_price' (your database column is 'price')
                    $orderItem->price = $item['price']; 
                    
                    $orderItem->sale_price = $item['sale_price'] ?? null;
                    $orderItem->quantity = $item['quantity'];
                    
                    // FIX: Use 'subtotal' not 'total_price' (your database column is 'subtotal')
                    $orderItem->subtotal = $item['price'] * $item['quantity'];
                    
                    // Add product_image if available (your database has this column)
                    if (isset($item['image'])) {
                        $orderItem->product_image = $item['image'];
                    }
                    
                    // Optional: Add additional fields if your database has them
                    if (isset($item['description']) && Schema::hasColumn('order_items', 'product_description')) {
                        $orderItem->product_description = $item['description'];
                    }
                    if (isset($item['category']) && Schema::hasColumn('order_items', 'product_category')) {
                        $orderItem->product_category = $item['category'];
                    }
                    if (isset($item['sku']) && Schema::hasColumn('order_items', 'product_sku')) {
                        $orderItem->product_sku = $item['sku'];
                    }
                    
                    \Log::info('Saving order item with:', [
                        'price' => $orderItem->price,
                        'subtotal' => $orderItem->subtotal,
                        'product_image' => $orderItem->product_image ?? 'not set'
                    ]);
                    
                    if ($orderItem->save()) {
                        \Log::info('Order item saved:', ['item_id' => $orderItem->id]);
                        
                        // Update product stock if needed
                        if (isset($item['id'])) {
                            $product = Product::find($item['id']);
                            if ($product && isset($product->stock)) {
                                $product->stock -= $item['quantity'];
                                $product->save();
                                \Log::info('Product stock updated:', [
                                    'product_id' => $product->id,
                                    'new_stock' => $product->stock
                                ]);
                            }
                        }
                    } else {
                        \Log::error('Failed to save order item:', $item);
                        throw new \Exception('Failed to save order item');
                    }
                }
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully! Your order number is ' . $orderNumber,
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => $order->customer_name,
                        'total_amount' => number_format($order->total_amount, 2),
                        'status' => $order->status,
                        'estimated_delivery' => '45-60 minutes',
                        'order_date' => $order->order_date->format('Y-m-d H:i:s'),
                        'items_count' => count($request->items),
                    ]
                ], 201);
            } else {
                DB::rollBack();
                \Log::error('Failed to save order');
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to save order'
                ], 500);
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Order creation exception:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }
    
    /**
     * Get user's orders
     */
    public function index(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            $orders = Order::where('user_id', $user->id)
                ->with(['items'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to fetch orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get order details
     */
    public function show($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            $order = Order::where('user_id', $user->id)
                ->where('id', $id)
                ->with(['items'])
                ->first();
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $order
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to fetch order details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order details',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
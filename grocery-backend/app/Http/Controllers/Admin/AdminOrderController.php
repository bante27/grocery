<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminOrderController extends Controller
{
    /**
     * Get all orders for admin
     */
    public function index(Request $request)
    {
        try {
            $orders = Order::with(['items', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'orders' => $orders
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Admin get orders error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders'
            ], 500);
        }
    }
    
    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,on_delivery,delivered,cancelled'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $order = Order::find($id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }
            
            $oldStatus = $order->status;
            $order->status = $request->status;
            $order->save();
            
            // Log the status change
            \Log::info('Order status updated by admin', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'old_status' => $oldStatus,
                'new_status' => $order->status,
                'admin_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => $order
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Admin update order status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status'
            ], 500);
        }
    }
    
    /**
     * Get order statistics
     */
    public function stats()
    {
        try {
            $totalOrders = Order::count();
            $pendingOrders = Order::where('status', 'pending')->count();
            $deliveredOrders = Order::where('status', 'delivered')->count();
            $totalRevenue = Order::where('status', 'delivered')->sum('total_amount');
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'total' => $totalOrders,
                    'pending' => $pendingOrders,
                    'delivered' => $deliveredOrders,
                    'revenue' => $totalRevenue
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Admin get order stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order statistics'
            ], 500);
        }
    }
}
// app/Http/Controllers/Admin/DashboardController.php
<?php



use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\ContactMessage;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            $totalUsers = User::count();
            $verifiedUsers = User::whereNotNull('email_verified_at')->count();
            
            $totalProducts = Product::count();
            $productsValue = Product::sum('price');
            
            $totalOrders = Order::count();
            $completedOrders = Order::where('status', 'completed')->count();
            $revenue = Order::where('status', 'completed')->sum('total');
            
            $totalMessages = ContactMessage::count();
            $unreadMessages = ContactMessage::where('is_read', false)->count();
            $todayMessages = ContactMessage::whereDate('created_at', today())->count();
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'users' => [
                        'total' => $totalUsers,
                        'verified' => $verifiedUsers,
                    ],
                    'products' => [
                        'total' => $totalProducts,
                        'totalValue' => $productsValue,
                    ],
                    'orders' => [
                        'total' => $totalOrders,
                        'completed' => $completedOrders,
                        'revenue' => $revenue,
                    ],
                    'messages' => [
                        'total' => $totalMessages,
                        'unread' => $unreadMessages,
                        'today' => $todayMessages,
                    ],
                    'platformRevenue' => $revenue * 0.05, // 5% platform fee
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
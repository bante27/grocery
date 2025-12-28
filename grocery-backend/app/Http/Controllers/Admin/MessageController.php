<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    // Get all messages with filters
    public function index(Request $request)
    {
        try {
            $query = ContactMessage::query();
            
            // Filter by unread
            if ($request->has('unread_only') && $request->boolean('unread_only')) {
                $query->where('is_read', false);
            }
            
            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('subject', 'LIKE', "%{$search}%")
                      ->orWhere('message', 'LIKE', "%{$search}%");
                });
            }
            
            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            $messages = $query->get();
            
            return response()->json([
                'success' => true,
                'messages' => $messages,
                'count' => $messages->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Message index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // Get single message
    public function show($id)
    {
        try {
            $message = ContactMessage::find($id);
            
            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }
            
            // Auto mark as read when viewed
            if (!$message->is_read) {
                $message->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching message'
            ], 500);
        }
    }
    
    // Toggle read/unread
    public function toggleRead($id)
    {
        try {
            $message = ContactMessage::find($id);
            
            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }
            
            $message->update([
                'is_read' => !$message->is_read,
                'read_at' => !$message->is_read ? now() : null
            ]);
            
            return response()->json([
                'success' => true,
                'message' => $message
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating message'
            ], 500);
        }
    }
    
    // Mark all as read
    public function markAllRead()
    {
        try {
            ContactMessage::where('is_read', false)->update([
                'is_read' => true,
                'read_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'All messages marked as read'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking messages as read'
            ], 500);
        }
    }
    
    // Send reply
    public function sendReply(Request $request, $id)
    {
        try {
            $request->validate([
                'reply_content' => 'required|string'
            ]);
            
            $message = ContactMessage::find($id);
            
            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }
            
            // Log the reply (not saved to database)
            Log::info('Admin reply sent', [
                'to' => $message->email,
                'name' => $message->name,
                'reply' => $request->reply_content,
                'sent_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Reply sent successfully',
                'to' => $message->email
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending reply'
            ], 500);
        }
    }
    
    // Delete message
    public function destroy($id)
    {
        try {
            $message = ContactMessage::find($id);
            
            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }
            
            $message->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting message'
            ], 500);
        }
    }
    
    // Get stats
    public function getStats()
    {
        try {
            $total = ContactMessage::count();
            $unread = ContactMessage::where('is_read', false)->count();
            $today = ContactMessage::whereDate('created_at', today())->count();
            
            return response()->json([
                'success' => true,
                'stats' => [
                    'total' => $total,
                    'unread' => $unread,
                    'today' => $today
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting stats'
            ], 500);
        }
    }
}
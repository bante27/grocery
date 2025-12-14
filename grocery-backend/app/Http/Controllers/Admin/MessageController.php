<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AdminReplyMail;

class MessageController extends Controller
{
    // Fetch all messages
    public function index()
    {
        return response()->json([
            'success' => true,
            'messages' => ContactMessage::orderBy('id', 'desc')->get(),
        ]);
    }

    // Show single message (mark as read)
    public function show($id)
    {
        $message = ContactMessage::findOrFail($id);

        if (!$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    // Update read/unread
    public function update(Request $request, $id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->is_read = $request->input('is_read', $message->is_read);
        $message->read_at = $message->is_read ? now() : null;
        $message->save();

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    // Delete message
    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully',
        ]);
    }

    // Reply to user via email (no DB save)
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string',
        ]);

        $message = ContactMessage::findOrFail($id);

        if (!$message->email) {
            return response()->json([
                'success' => false,
                'message' => 'User has no email to reply to',
            ], 400);
        }

        try {
            Mail::to($message->email)
                ->send(new AdminReplyMail($request->reply));

            return response()->json([
                'success' => true,
                'message' => 'Reply sent successfully',
            ]);
        } catch (\Throwable $e) {
            \Log::error('Admin reply failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reply',
            ], 500);
        }
    }
}

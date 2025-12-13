<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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

    // Toggle read/unread
    
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
}

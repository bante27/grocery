<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactMessage;
use App\Mail\ContactAdminNotification;
use App\Mail\ContactUserConfirmation;
use Illuminate\Support\Facades\Mail;
use Exception;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            // Save to database
            $message = ContactMessage::create($validated);

            // Send emails
            Mail::to('mitikubantalem07@gmail.com')->send(new ContactAdminNotification($validated));
            Mail::to($validated['email'])->send(new ContactUserConfirmation($validated));

            return response()->json([
                'message' => 'Message sent successfully!'
            ], 200);

        } catch (Exception $e) {
            \Log::error('Contact email failed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to send message. Please try again later.'
            ], 500);
        }
    }
}

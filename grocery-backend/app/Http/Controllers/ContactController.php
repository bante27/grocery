<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ContactMessage;
use App\Mail\ContactAdminNotification;
use App\Mail\ContactUserConfirmation;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Save to DB
        $contact = ContactMessage::create($validated);

        try {
            \Log::info('CONTACT MAIL STARTED');

            // Admin email
            Mail::to('mitikubantalem07@gmail.com')
                ->send(new ContactAdminNotification($contact));

            // User email
            Mail::to($contact->email)
                ->send(new ContactUserConfirmation($contact));

            \Log::info('CONTACT MAIL SENT');
        } catch (\Throwable $e) {
            \Log::error('CONTACT MAIL FAILED', [
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Message received successfully'
        ]);
    }
}

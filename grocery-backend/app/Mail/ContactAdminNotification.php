<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactAdminNotification extends Mailable
{
    use Queueable, SerializesModels;

    public ContactMessage $data;

    public function __construct(ContactMessage $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        return $this
            
            ->subject('New Contact Message: ' . $this->data->subject)
            ->view('emails.admin_contact')
            ->with(['data' => $this->data]);
    }
}

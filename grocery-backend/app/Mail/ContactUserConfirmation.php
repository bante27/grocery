<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactUserConfirmation extends Mailable
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
           
            ->subject('We received your message')
            ->view('emails.user_confirmation')
            ->with(['data' => $this->data]);
    }
}

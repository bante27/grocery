<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $originalSubject;
    public $adminReply;

    public function __construct($userName, $originalSubject, $adminReply)
    {
        $this->userName = $userName;
        $this->originalSubject = $originalSubject;
        $this->adminReply = $adminReply;
    }

    public function build()
    {
        return $this->subject('Re: ' . $this->originalSubject)
                    ->view('emails.admin_reply')
                    ->with([
                        'userName' => $this->userName,
                        'adminReply' => $this->adminReply,
                        'replyDate' => now()->format('F j, Y \a\t g:i A')
                    ]);
    }
}
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $otp;

    public function __construct($user, $otp)
    {
        $this->user = $user;
        $this->otp = $otp;
    }

    public function build()
    {
        return $this->subject('Password Reset OTP - ' . config('app.name'))
                    ->view('emails.password-reset')
                    ->with([
                        'name' => $this->user->name,
                        'otp' => $this->otp,
                        'expiry' => 5,
                    ]);
    }
}
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'status',
        'verification_status',
        'profile_picture',
        'gov_id_front',
        'gov_id_back',
        'balance',
        'pending_balance',
        'rank',
        'otp',
        'otp_expires_at',
    ];

    protected $hidden = ['password', 'remember_token', 'otp'];
    
    protected $casts = [
        'otp_expires_at' => 'datetime',
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'name' => $this->name,
            'email' => $this->email,
        ];
    }

    /* -------- HELPERS -------- */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isRestricted()
    {
        return $this->status === 'restricted';
    }

    public function isVerified()
    {
        return $this->verification_status === 'verified';
    }

    /* -------- RELATIONS -------- */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
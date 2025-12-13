<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'is_read',   // Add this
        'status',    // Optional: if you have status
        'admin_notes',
        'read_at'
    ];
}

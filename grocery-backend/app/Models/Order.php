<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_address',
        'delivery_subcity',
        'delivery_city',
        'delivery_woreda',
        'delivery_house_number',
        'delivery_apartment',
        'order_notes',
        'payment_method',
        'subtotal',
        'delivery_fee',
        'tax_amount',
        'total_amount',
        'currency',
        'exchange_rate',
        'status',
        'order_date' // ADD THIS LINE
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:2',
        'order_date' => 'datetime', // ADD THIS LINE
        'created_at' => 'datetime'
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
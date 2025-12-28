<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    // Table name (optional - Laravel will auto-detect as 'order_items')
    protected $table = 'order_items';

    // Primary key (optional - defaults to 'id')
    protected $primaryKey = 'id';

    // Timestamps (optional - defaults to true)
    public $timestamps = true;

    // Fillable columns - MATCHING YOUR DATABASE COLUMNS
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_image',  // Added
        'price',          // Changed from 'unit_price' to 'price'
        'sale_price',
        'quantity',
        'subtotal'        // Changed from 'total_price' to 'subtotal'
    ];

    // Casts for data types
    protected $casts = [
        'price' => 'decimal:2',      // Changed from 'unit_price'
        'sale_price' => 'decimal:2',
        'subtotal' => 'decimal:2',   // Changed from 'total_price'
        'quantity' => 'integer'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Accessors/Mutators (Optional but helpful)
    
    /**
     * Get the actual price (use sale_price if available, otherwise regular price)
     */
    public function getActualPriceAttribute()
    {
        return $this->sale_price ?? $this->price;
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute()
    {
        return 'Birr ' . number_format($this->price, 2);
    }

    /**
     * Get formatted subtotal
     */
    public function getFormattedSubtotalAttribute()
    {
        return 'Birr ' . number_format($this->subtotal, 2);
    }

    /**
     * Check if item is on sale
     */
    public function getIsOnSaleAttribute()
    {
        return !is_null($this->sale_price) && $this->sale_price > 0;
    }

    /**
     * Calculate discount percentage
     */
    public function getDiscountPercentageAttribute()
    {
        if (!$this->is_on_sale || $this->price == 0) {
            return 0;
        }
        
        return round((($this->price - $this->sale_price) / $this->price) * 100);
    }
}
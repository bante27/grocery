<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'sale_price',
        'stock',
        'category',
        'image',
        'on_sale',
        'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock' => 'integer',
        'on_sale' => 'boolean',
        'is_active' => 'boolean'
    ];

    // Automatically calculate stock status
    protected $appends = ['stock_status'];

    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return 'out_of_stock';
        } elseif ($this->stock <= 10) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    // Check if product is in stock
    public function isInStock()
    {
        return $this->stock > 0 && $this->is_active;
    }

    // Reduce stock
    public function reduceStock($quantity)
    {
        if ($this->stock >= $quantity) {
            $this->stock -= $quantity;
            $this->save();
            return true;
        }
        return false;
    }

    // Increase stock
    public function increaseStock($quantity)
    {
        $this->stock += $quantity;
        $this->save();
        return true;
    }
}
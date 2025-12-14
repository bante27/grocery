import React from 'react';
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal,
    isCartOpen, 
    setIsCartOpen,
    getCartItemCount 
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Close cart and navigate to checkout
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Cart Drawer */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {getCartItemCount()} items
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Clear Cart Button */}
              <div className="mb-4">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Items
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-green-600 font-bold">${item.price}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer - Order Summary */}
        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full border border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Free shipping on orders over $50
            </p>
          </div>
        )}
      </div>
    </>
  );
  
};

export default CartDrawer;
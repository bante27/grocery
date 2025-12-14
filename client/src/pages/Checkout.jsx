// src/pages/Checkout.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Main Checkout Component
const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Get user from localStorage (temporary fix)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    email: user?.email || '',
    paymentMethod: 'cash',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }
    
    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        ...formData,
        items: cartItems,
        total: cartTotal,
        tax: cartTotal * 0.08,
        grandTotal: cartTotal * 1.08,
        userId: user?.id,
        userEmail: user?.email
      };

      console.log('Order Data:', orderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('✅ Order placed successfully!');
      setOrderPlaced(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Order error:', error);
      alert('❌ Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication
  if (!user) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl text-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 mb-8 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </button>
        
        <h1 className="text-3xl font-bold mb-4">Login Required</h1>
        <p className="text-gray-600 mb-8">Please login to proceed with checkout</p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 mb-8 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shopping
        </button>
        
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Show order success message
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your purchase, {user?.name || 'Customer'}!</p>
          <p className="text-gray-600 mb-8">Your order has been placed successfully.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-emerald-600 mb-8 hover:text-emerald-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Welcome Message for User */}
      {user && (
        <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
          <p className="text-emerald-800">
            Welcome, <span className="font-semibold">{user.name}</span>! 
            You're checking out as <span className="font-semibold">{user.email}</span>
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-6">Order Summary ({cartItems.length} items)</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.image || '/placeholder-product.jpg'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleOrderSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block mb-2 font-medium">First Name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required 
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required 
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Email *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="john@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Address *</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required 
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block mb-2 font-medium">City *</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required 
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Zip Code *</label>
                <input 
                  type="text" 
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required 
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="10001"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">Phone *</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Payment Method *</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Credit/Debit Card</span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="mb-6">
              <label className="block mb-2 font-medium">Order Notes (Optional)</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Special instructions, delivery notes, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className={`w-full py-3 rounded-lg font-semibold ${
                loading || cartItems.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Order...
                </span>
              ) : (
                `Place Order ($${(cartTotal * 1.08).toFixed(2)})`
              )}
            </button>
          </form>
        </div>

        {/* Payment Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h3 className="text-lg font-bold mb-4">Payment Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${(cartTotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${(cartTotal * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              <p className="mb-2 flex items-center">
                <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure checkout
              </p>
              <p className="mb-2 flex items-center">
                <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                30-day return policy
              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free shipping on orders over $50
              </p>
            </div>

            {/* Cart Items Preview */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Items in Cart</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center text-sm">
                    <div className="w-10 h-10 mr-3">
                      <img 
                        src={item.image || '/placeholder-product.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="truncate">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
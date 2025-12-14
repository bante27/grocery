// src/components/Products.jsx (User Shop Page)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Import cart context

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Get addToCart function

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/products');
      if (res.data.success) setProducts(res.data.products);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to handle adding product to cart
  const handleAddToCart = (product) => {
    // Format product data for cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price), // Ensure price is a number
      image: product.image ? `http://127.0.0.1:8000/storage/${product.image}` : '/placeholder-product.jpg',
      originalProduct: product // Keep original data if needed
    };
    
    addToCart(cartProduct);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Our Products</h1>
      <p className="text-gray-600 mb-8">Browse our latest collection</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden group">
            {/* Product Image */}
            <div className="h-56 overflow-hidden relative">
              {product.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              
              {/* Quick Add to Cart Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Quick Add
                </button>
              </div>
            </div>
            
            {/* Product Details */}
            <div className="p-4">
              <h2 className="font-bold text-lg mb-1 truncate">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-emerald-600">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
              
              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t text-xs text-gray-500 flex justify-between">
                <span>ID: {product.id}</span>
                {product.category && (
                  <span className="bg-gray-100 px-2 py-1 rounded">Category</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available yet.</p>
          <p className="text-gray-400">Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default Products;
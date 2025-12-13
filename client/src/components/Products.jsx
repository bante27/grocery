// src/components/Products.jsx (User Shop Page)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <div className="h-56 overflow-hidden">
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
            </div>
            
            {/* Product Details */}
            <div className="p-4">
              <h2 className="font-bold text-lg mb-1">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">
                  ${product.price}
                </span>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
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
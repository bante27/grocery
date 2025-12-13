// Glocery/Admin/src/components/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Eye, Plus } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // ✅ CHANGE THIS BASED ON YOUR LARAVEL PORT
  const API_URL = 'http://localhost:8080/api'; // Try 8000, 8080, or 8001

  // Fetch products
  const fetchProducts = async () => {
    try {
      console.log(`📡 Fetching from: ${API_URL}/products`);
      const res = await axios.get(`${API_URL}/products`);
      console.log('📦 Received:', res.data);
      
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error.message);
      console.log('⚠️ Make sure Laravel is running: php artisan serve --port=8080');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit new product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !price) {
      alert('Please fill name and price');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    
    if (image) {
      formData.append('image', image);
    }

    // Log what we're sending
    console.log('🚀 Sending to:', `${API_URL}/products`);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const res = await axios.post(`${API_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ Server Response:', res.data);

      if (res.data.success) {
        alert('🎉 Product saved successfully!');
        fetchProducts();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('❌ Axios Error:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        alert(`Server Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // No response received
        console.error('No response received. Is Laravel running?');
        alert('Cannot connect to server. Make sure Laravel is running on port 8080');
      } else {
        // Other errors
        console.error('Error:', error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        alert('Product deleted');
        fetchProducts();
      } catch (error) {
        console.error('Delete Error:', error);
        alert('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage(null);
    setImagePreview('');
  };

  if (loading) return (
    <div className="p-6">
      <p>Loading products...</p>
      <p className="text-sm text-gray-500">
        Trying to connect to: {API_URL}/products
      </p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-bold text-lg mb-2">Connection Info</h2>
        <p className="text-sm">React: localhost:5175</p>
        <p className="text-sm">Laravel API: {API_URL}</p>
        <p className="text-sm">Products: {products.length} found</p>
      </div>

      {/* Rest of your component remains the same */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin - Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Form and product list... */}
    </div>
  );
};

export default AdminProducts;
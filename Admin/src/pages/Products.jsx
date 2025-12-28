import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const ProductForm = () => {
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [onSale, setOnSale] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);

  // Handle image selection with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('❌ Please select a valid image file (JPEG, PNG, etc.)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage('❌ Image size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setMessage(''); // Clear any previous error messages
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMessage('');

    // Basic validation
    if (!name || !originalPrice || !salePrice || !category) {
      setMessage('❌ Please fill all required fields (*)');
      setPosting(false);
      return;
    }

    // Price validation
    const originalPriceNum = parseFloat(originalPrice);
    const salePriceNum = parseFloat(salePrice);
    
    if (isNaN(originalPriceNum) || isNaN(salePriceNum)) {
      setMessage('❌ Please enter valid prices');
      setPosting(false);
      return;
    }
    
    if (originalPriceNum <= 0 || salePriceNum <= 0) {
      setMessage('❌ Prices must be greater than 0');
      setPosting(false);
      return;
    }
    
    if (salePriceNum >= originalPriceNum) {
      setMessage('❌ Sale price should be less than original price');
      setPosting(false);
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('original_price', originalPriceNum.toFixed(2));
    formData.append('sale_price', salePriceNum.toFixed(2));
    formData.append('category', category);
    formData.append('on_sale', onSale ? '1' : '0');
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post(`${API_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      if (response.data.success) {
        setMessage('✅ Product posted successfully!');
        // Reset form
        resetForm();
      } else {
        setMessage(`❌ ${response.data.message || 'Failed to post product'}`);
      }
    } catch (error) {
      console.error('Post error:', error);
      
      if (error.response) {
        // Server responded with error
        const errorMsg = error.response.data?.message || 
                        error.response.data?.error ||
                        'Server error occurred';
        setMessage(`❌ Error: ${errorMsg}`);
      } else if (error.request) {
        // No response received
        setMessage('❌ No response from server. Please check your connection.');
      } else {
        // Request setup error
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setPosting(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setName('');
    setDescription('');
    setOriginalPrice('');
    setSalePrice('');
    setCategory('');
    setOnSale(true);
    setImage(null);
    setImagePreview('');
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Grocery categories
  const groceryCategories = [
    'Fragrances Deos',
    'Salt Sugar',
    'Rice Products',
    'Edible Oil Ghee',
    'Fresh Vegetables',
    'Dairy Products',
    'Beverages',
    'Snacks',
    'Bakery',
    'Frozen Foods'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Post Grocery Product (No Login Required)</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Image Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Product Image</label>
          {imagePreview ? (
            <div className="mb-3">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview('');
                  const fileInput = document.querySelector('input[type="file"]');
                  if (fileInput) fileInput.value = '';
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Max size: 5MB, Supported: JPG, PNG, GIF</p>
        </div>

        {/* Product Name */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Product Name *
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fragrances Deos"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description..."
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-medium">
              Original Price ($) *
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="120.00"
              step="0.01"
              min="0"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Sale Price ($) *
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="99.00"
              step="0.01"
              min="0"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Category *
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {groceryCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* On Sale Toggle */}
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="onSale"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-5 w-5 rounded focus:ring-blue-500"
          />
          <label htmlFor="onSale" className="ml-2 font-medium">
            Mark as On Sale
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={posting}
          className="w-full bg-green-600 text-white p-3 rounded font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {posting ? 'Posting Product...' : 'Post Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
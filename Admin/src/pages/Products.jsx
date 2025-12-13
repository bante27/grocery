import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Eye, Plus } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= RESET FORM =================
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage(null);
    setImagePreview('');
  };

  // ================= CREATE PRODUCT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      alert('Name & price required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (image) formData.append('image', image);

    try {
      await axios.post(`${API_URL}/products`, formData);
      alert('✅ Product saved');
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save product');
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`);
      alert('✅ Deleted');
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('❌ Delete failed');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Add Product</h2>

          {imagePreview && (
            <img src={imagePreview} className="w-32 h-32 object-cover mb-3 rounded" />
          )}

          <input
            type="file"
            onChange={handleImageChange}
            className="mb-3"
          />

          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 mb-3"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border p-2 mb-4"
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Save Product
          </button>
        </form>
      )}

      {/* PRODUCT LIST */}
      <h2 className="text-xl font-bold mb-4">
        All Products ({products.length})
      </h2>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border p-4 rounded shadow">

              {p.image ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${p.image}`}
                  className="h-40 w-full object-cover rounded mb-3"
                />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  No Image
                </div>
              )}

              <h3 className="font-bold">{p.name}</h3>
              <p className="text-gray-600 text-sm">{p.description}</p>
              <p className="font-bold text-blue-600">${p.price}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded flex justify-center gap-1"
                >
                  <Eye size={16} /> View
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 bg-red-100 text-red-700 py-2 rounded flex justify-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-2 text-gray-500"
            >
              ✕
            </button>

            {selectedProduct.image && (
              <img
                src={`http://127.0.0.1:8000/storage/${selectedProduct.image}`}
                className="h-48 w-full object-cover rounded mb-3"
              />
            )}

            <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
            <p className="text-gray-600">{selectedProduct.description}</p>
            <p className="text-lg font-bold text-blue-600 mt-2">
              ${selectedProduct.price}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {new Date(selectedProduct.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

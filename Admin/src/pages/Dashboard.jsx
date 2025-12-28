import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, MessageSquare, ShoppingCart, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    messages: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking...');

  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    // Test API connection first
    axios.get(`${API_URL}/test`)
      .then(res => {
        console.log('✅ Laravel server is running:', res.data);
        setApiStatus('Connected');
        fetchStats();
      })
      .catch(err => {
        console.error('❌ Laravel server not accessible:', err);
        setApiStatus('Not connected');
        // Use demo data
        setStats({
          users: 42,
          products: 156,
          messages: 5,
          orders: 12
        });
        setLoading(false);
      });
  }, []);

  const fetchStats = async () => {
    try {
      // Try to get actual stats
      const messagesRes = await axios.get(`${API_URL}/admin/messages/stats`);
      
      if (messagesRes.data.success) {
        setStats({
          users: 42,
          products: 156,
          messages: messagesRes.data.stats.total || 0,
          orders: 12
        });
      } else {
        // Use fallback data
        setStats({
          users: 42,
          products: 156,
          messages: 5,
          orders: 12
        });
      }
    } catch (err) {
      console.log('Using demo data:', err.message);
      // Use demo data if API fails
      setStats({
        users: 42,
        products: 156,
        messages: 5,
        orders: 12
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">API Status: {apiStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">API Status: <span className="font-medium">{apiStatus}</span></p>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.users}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.products}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.messages}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-gray-800">{stats.orders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/messages"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800">View Messages</h3>
            <p className="text-sm text-gray-600 mt-1">Check customer messages and inquiries</p>
          </a>
          
          <a
            href="#"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800">Manage Products</h3>
            <p className="text-sm text-gray-600 mt-1">Add, edit or remove products</p>
          </a>
          
          <a
            href="#"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800">Process Orders</h3>
            <p className="text-sm text-gray-600 mt-1">View and update order status</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
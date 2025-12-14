// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, MessageSquare, TrendingUp, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Custom ETB Icon
const ETBIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <text x="8" y="18" fontSize="14" fontFamily="Arial" fill="currentColor">ETB</text>
  </svg>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, verified: 0 },
    products: { total: 0, totalValue: 0 },
    orders: { total: 0, completed: 0, revenue: 0, pending: 12, todayRevenue: 48500 },
    messages: { total: 0, unread: 0, today: 0 },
    platformRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        
        // Check Laravel server connection
        try {
          await axios.get('http://127.0.0.1:8000/api/test');
          console.log('✅ Laravel server is running');
        } catch (testErr) {
          console.warn('⚠️ Laravel server not reachable:', testErr.message);
          // Continue with demo data
        }

        // Try to fetch real data from Laravel
        try {
          const headers = token ? { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } : { 'Accept': 'application/json' };

          // Fetch dashboard stats
          const statsResponse = await axios.get('http://127.0.0.1:8000/api/admin/dashboard/stats', { headers });
          
          if (statsResponse.data.success) {
            setStats(statsResponse.data.stats);
          }
          
          // Fetch messages
          const messagesResponse = await axios.get('http://127.0.0.1:8000/api/admin/messages', { headers });
          if (messagesResponse.data.success) {
            const messages = messagesResponse.data.messages?.data || messagesResponse.data.messages || [];
            
            // Create recent activity from messages
            const messageActivities = messages.slice(0, 5).map(msg => ({
              id: msg.id,
              type: 'message',
              description: `New message from ${msg.name}: ${msg.subject || 'No subject'}`,
              timestamp: new Date(msg.created_at || Date.now()),
            }));
            
            setRecentActivity(messageActivities);
          }
          
        } catch (apiError) {
          console.log('Using demo data:', apiError.message);
          // Set demo data
          setStats({
            users: { total: 156, verified: 142 },
            products: { total: 89, totalValue: 254890 },
            orders: { 
              total: 1254, 
              completed: 1231, 
              revenue: 254890, 
              pending: 12, 
              todayRevenue: 48500 
            },
            messages: { total: 45, unread: 14, today: 3 },
            platformRevenue: 12744.50,
          });
          
          // Demo recent activity
          setRecentActivity([
            {
              id: 1,
              type: 'message',
              description: 'New message from John Doe: Product inquiry',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            },
            {
              id: 2,
              type: 'order',
              description: 'New order #ORD-2025-0012 - ETB 3,450',
              timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            },
            {
              id: 3,
              type: 'user',
              description: 'New user registered: Jane Smith',
              timestamp: new Date(Date.now() - 10800000), // 3 hours ago
            },
          ]);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const ProgressBar = ({ label, value, total, color = 'cyan' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    const colorClasses = {
      cyan: 'bg-cyan-400',
      emerald: 'bg-emerald-400',
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-400',
    };

    return (
      <div className="flex flex-col mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{label}</span>
          <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">{value}/{total}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
      cyan: 'border-cyan-500/20 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/10 dark:to-gray-800',
      indigo: 'border-indigo-500/20 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-gray-800',
      purple: 'border-purple-500/20 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800',
      emerald: 'border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800',
      pink: 'border-pink-500/20 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/10 dark:to-gray-800',
    };

    const iconColors = {
      cyan: 'text-cyan-400',
      indigo: 'text-indigo-400',
      purple: 'text-purple-400',
      emerald: 'text-emerald-400',
      pink: 'text-pink-400',
    };

    const bgColors = {
      cyan: 'bg-cyan-500/20',
      indigo: 'bg-indigo-500/20',
      purple: 'bg-purple-500/20',
      emerald: 'bg-emerald-500/20',
      pink: 'bg-pink-500/20',
    };

    return (
      <div className={`relative rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border ${colorClasses[color]}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${bgColors[color]}`}>
            <Icon className={`h-8 w-8 ${iconColors[color]}`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 lg:p-8">
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-4 rounded-lg border border-yellow-200 dark:border-yellow-500/30 shadow-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Using demo data</p>
              <p className="text-sm mt-1">
                Connect to Laravel backend for real data: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">php artisan serve</code>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Welcome back, <span className="font-semibold text-emerald-600">{user?.name}</span>
            </p>
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* TODAY'S SUMMARY */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-cyan-500/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">TODAY'S SUMMARY</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/10 dark:to-gray-800 p-6 rounded-xl border border-cyan-200 dark:border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-cyan-500/20">
                  <ShoppingCart className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orders.pending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800 p-6 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-500/20">
                  <ETBIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ETB {stats.orders.todayRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/10 dark:to-gray-800 p-6 rounded-xl border border-pink-200 dark:border-pink-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-500/20">
                  <MessageSquare className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.messages.today}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total: {stats.messages.total} • Unread: {stats.messages.unread}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users" 
            value={stats.users.total} 
            icon={Users} 
            color="cyan" 
            subtitle={`${stats.users.verified} verified`} 
          />
          <StatCard 
            title="Total Products" 
            value={stats.products.total} 
            icon={Package} 
            color="indigo" 
            subtitle={`ETB ${stats.products.totalValue?.toLocaleString() || '0'}`} 
          />
          <StatCard 
            title="Total Orders" 
            value={stats.orders.total} 
            icon={ShoppingCart} 
            color="purple" 
            subtitle={`ETB ${stats.orders.revenue?.toLocaleString() || '0'}`} 
          />
          <StatCard 
            title="Total Messages" 
            value={stats.messages.total} 
            icon={MessageSquare} 
            color="pink" 
            subtitle={`${stats.messages.unread} unread • ${stats.messages.today} today`} 
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-cyan-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Activity</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-cyan-400 mb-2">{stats.products.total}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Products</p>
            </div>
            <ProgressBar 
              label="Active Products" 
              value={stats.products.total} 
              total={stats.products.total + 10} 
              color="cyan" 
            />
            <ProgressBar 
              label="In Stock" 
              value={Math.floor(stats.products.total * 0.85)} 
              total={stats.products.total} 
              color="emerald" 
            />
          </div>

          {/* Transaction Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Status</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-purple-400 mb-2">{stats.orders.completed}</p>
              <p className="text-gray-600 dark:text-gray-400">Completed Orders</p>
            </div>
            <ProgressBar 
              label="Completed" 
              value={stats.orders.completed} 
              total={stats.orders.total || 1} 
              color="cyan" 
            />
            <ProgressBar 
              label="Pending" 
              value={stats.orders.pending} 
              total={stats.orders.total || 1} 
              color="yellow" 
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'message' ? 'bg-cyan-400' : 
                    activity.type === 'order' ? 'bg-purple-400' : 
                    'bg-emerald-400'
                  }`}></div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm flex-1">
                    {activity.description}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {activity.timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Messages and transactions will appear here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Revenue</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-emerald-400 mb-2">
              ETB {stats.platformRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Total Platform Earnings (5% fee)</p>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Calculated from completed orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, MessageSquare, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Custom ETB Icon Component
const ETBIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <text x="6" y="18" fontSize="16" fontFamily="Arial, sans-serif"></text>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
  </svg>
);

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, verified: 0 },
    products: { total: 0, totalValue: 0 },
    transactions: { total: 0, completed: 0, revenue: 0 },
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
        const headers = token ? { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        } : { 
          'Accept': 'application/json' 
        };

        // Test Laravel server connection first
        try {
          const testRes = await axios.get('http://127.0.0.1:8000/api/test');
          console.log('Laravel server test:', testRes.data);
        } catch (testErr) {
          throw new Error(`Cannot connect to Laravel server: ${testErr.message}. Make sure to run: php artisan serve`);
        }

        // Fetch messages from Laravel API
        let messages = [];
        let messagesStats = { total: 0, unread: 0, today: 0 };
        
        try {
          // Try protected endpoint first
          const messagesRes = await axios.get('http://127.0.0.1:8000/api/admin/messages', { headers });
          
          if (messagesRes.data.success) {
            // Handle different response structures
            if (Array.isArray(messagesRes.data.messages)) {
              messages = messagesRes.data.messages;
            } else if (messagesRes.data.messages && Array.isArray(messagesRes.data.messages.data)) {
              messages = messagesRes.data.messages.data;
            } else if (messagesRes.data.messages && Array.isArray(messagesRes.data.messages)) {
              messages = messagesRes.data.messages;
            } else {
              messages = [];
            }
            
            // Get stats from response or calculate
            if (messagesRes.data.stats) {
              messagesStats = {
                total: messagesRes.data.stats.total || messages.length,
                unread: messagesRes.data.stats.unread || messages.filter(msg => !msg.is_read).length,
                today: messagesRes.data.stats.today || 0
              };
            } else {
              messagesStats = {
                total: messages.length,
                unread: messages.filter(msg => !msg.is_read).length,
                today: 0 // Will calculate below if we have created_at
              };
            }
          }
        } catch (messagesErr) {
          if (messagesErr.response?.status === 401) {
            console.log('Auth required, trying public endpoint...');
            // Try public endpoint
            try {
              const publicRes = await axios.get('http://127.0.0.1:8000/api/admin/messages/public');
              if (publicRes.data.success) {
                messages = publicRes.data.messages?.data || [];
                messagesStats = publicRes.data.stats || {
                  total: messages.length,
                  unread: messages.filter(msg => !msg.is_read).length,
                  today: publicRes.data.stats?.today || 0
                };
              }
            } catch (publicErr) {
              console.warn('Public endpoint also failed:', publicErr.message);
            }
          } else {
            console.warn('Messages fetch failed:', messagesErr.message);
          }
        }

        // For now, use dummy data for other sections or keep as is
        const users = []; // Replace with actual API call
        const products = []; // Replace with actual API call
        const transactions = []; // Replace with actual API call

        const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
        const platformRevenue = transactions.reduce(
          (sum, t) => sum + (t.serviceFee || t.totalPrice * 0.05),
          0
        );

        setStats({
          users: {
            total: users.length,
            verified: users.filter(u => u.isVerified).length,
          },
          products: {
            total: products.length,
            totalValue,
          },
          transactions: {
            total: transactions.length,
            completed: transactions.filter(t => t.status === 'completed').length,
            revenue: transactions.reduce((sum, t) => sum + (t.totalPrice || 0), 0),
          },
          messages: messagesStats,
          platformRevenue: platformRevenue.toFixed(2),
        });

        // Map messages to activity list
        const messageActivities = messages.slice(0, 5).map(msg => ({
          id: msg.id,
          type: 'message',
          description: `New message from ${msg.name}: ${msg.subject || 'No subject'}`,
          timestamp: new Date(msg.created_at || Date.now()),
        }));

        const transactionActivities = transactions.slice(0, 5).map(t => ({
          id: t.id,
          type: 'transaction',
          description: `Transaction: Product (ID: ${t.productId}) for $${t.totalPrice}`,
          timestamp: new Date(t.date || Date.now()),
        }));

        // Combine and sort all activities by timestamp (newest first)
        setRecentActivity(
          [...messageActivities, ...transactionActivities].sort(
            (a, b) => b.timestamp - a.timestamp
          )
        );

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        
        // Set default stats for messages (you can remove this after testing)
        setStats(prev => ({
          ...prev,
          messages: {
            total: 14, // From your screenshot
            unread: 14,
            today: 3
          }
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const ProgressBar = ({ label, value, total, color = 'cyan' }) => (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{label}</span>
        <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">{value}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-400 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
      cyan: 'border-cyan-500/20',
      indigo: 'border-indigo-500/20',
      purple: 'border-purple-500/20',
      emerald: 'border-emerald-500/20',
      pink: 'border-pink-500/20',
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
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border ${colorClasses[color]}`}>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
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
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                Make sure Laravel server is running: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">php artisan serve</code>
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Last updated:{' '}
            {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* TODAY'S SUMMARY Section */}
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800 p-6 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-500/20">
                  <ETBIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">ETB 48,500</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/10 dark:to-gray-800 p-6 rounded-xl border border-pink-200 dark:border-pink-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-500/20">
                  <MessageSquare className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.messages.today || stats.messages.unread || stats.messages.total} New
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
            subtitle={`ETB ${stats.products.totalValue.toLocaleString()} total value`} 
          />
          <StatCard 
            title="Total Transactions" 
            value={stats.transactions.total} 
            icon={ShoppingCart} 
            color="purple" 
            subtitle={`ETB ${stats.transactions.revenue.toLocaleString()} revenue`} 
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Product Activity</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-cyan-400 mb-2">{stats.products.total}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Products</p>
            </div>
            <ProgressBar label="Active Products" value={stats.products.total} total={stats.products.total + 10} color="cyan" />
            <ProgressBar label="In Stock" value={stats.products.total - 2} total={stats.products.total} color="emerald" />
          </div>

          {/* Transaction Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingCart className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Transaction Status</h3>
            </div>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-purple-400 mb-2">{stats.transactions.completed}</p>
              <p className="text-gray-600 dark:text-gray-400">Completed Transactions</p>
            </div>
            <ProgressBar label="Completed" value={stats.transactions.completed} total={stats.transactions.total || 1} color="cyan" />
            <ProgressBar label="Pending" value={stats.transactions.total - stats.transactions.completed} total={stats.transactions.total || 1} color="yellow" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Platform Activity</h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors duration-200"
                >
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'message' ? 'bg-cyan-400' : 'bg-purple-400'}`}></div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm flex-1">{activity.description}</span>
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
      </div>
    </div>
  );
};

export default Dashboard;
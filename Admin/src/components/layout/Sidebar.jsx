// src/components/layout/Sidebar.jsx  ← REPLACE YOUR CURRENT FILE
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Truck,
  CreditCard,
  Tag,
  BarChart3,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Use your auto-logout from AuthContext

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard', badge: null },
    { label: 'Orders', icon: ShoppingCart, path: '/orders', badge: '12' },
    { label: 'Products', icon: Package, path: '/products', badge: null },
    { label: 'Customers', icon: Users, path: '/customers', badge: '24' },
    { label: 'Inventory', icon: BarChart3, path: '/inventory', badge: '5' },
    { label: 'Categories', icon: Tag, path: '/categories', badge: null },
    { label: 'Payments', icon: CreditCard, path: '/payments', badge: null },
    { label: 'Delivery', icon: Truck, path: '/delivery', badge: '3' },
    { label: 'Messages', icon: MessageSquare, path: '/messages', badge: '14' },
    { label: 'Reports', icon: FileText, path: '/reports', badge: null },
    { label: 'Settings', icon: Settings, path: '/settings', badge: null },
  ];

  const handleLogout = () => {
    logout(); // This clears token & redirects safely
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 
      transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">

        {/* Logo & Store Info */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Grocery Admin</h2>
              <p className="text-emerald-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'text-gray-300 hover:bg-gray-800/70 hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Today's Stats Box */}
        <div className="p-5 border-t border-gray-800">
          <div className="bg-gray-800/70 rounded-xl p-4 space-y-3">
            <p className="text-gray-400 text-xs font-semibold uppercase">Today's Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">New Orders</span>
                <span className="text-emerald-400 font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Revenue</span>
                <span className="text-white font-bold">ETB 48,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Messages</span>
                <span className="text-pink-400 font-bold">14 New</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-3 py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-200 border border-red-600/30"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
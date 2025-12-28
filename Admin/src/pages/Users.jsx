import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  ShieldAlert,
  Crown,
  UserCheck,
  CheckCircle,
  ShieldCheck,
  UserMinus,
  ChevronUp,
  AlertCircle,
  UserX,
  Ban,
  Trash2,
  Users as UsersIcon
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    role: "all",
    verification: "all"
  });

  const API_BASE_URL = "http://localhost:8000/api";

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const getToken = () => {
    return localStorage.getItem('adminToken') || 
           localStorage.getItem('token') ||
           localStorage.getItem('auth_token');
  };

  const createAxiosInstance = () => {
    const token = getToken();
    
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const api = createAxiosInstance();
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.verification !== 'all') params.append('verification_status', filters.verification);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have admin permissions.");
      } else if (err.message.includes('Network Error')) {
        setError("Cannot connect to server. Please make sure Laravel is running.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const api = createAxiosInstance();
      const response = await api.get('/admin/users/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const handleApiAction = async (endpoint, userId, successMessage) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const api = createAxiosInstance();
      const response = await api.post(`/admin/users/${userId}/${endpoint}`, {});
      
      if (response.data.success) {
        setUsers(prev => 
          prev.map(user => 
            user.userId === userId ? response.data.user : user
          )
        );
        
        if (selectedUser && selectedUser.userId === userId) {
          setSelectedUser(response.data.user);
        }
        
        await fetchStats();
        
        alert(successMessage || response.data.message);
        return { success: true };
      } else {
        alert(response.data.message);
        return { success: false };
      }
    } catch (err) {
      console.error("Action error:", err);
      
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Action failed. Please try again.");
      }
      return { success: false };
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeAdmin = (userId, isAdmin) => {
    if (isAdmin) {
      if (window.confirm("Remove admin role from this user?")) {
        return handleApiAction("remove-admin", userId, "Admin role removed successfully");
      }
    } else {
      if (window.confirm("Promote this user to admin?")) {
        return handleApiAction("make-admin", userId, "User promoted to admin successfully");
      }
    }
  };

  const handleRestrictUser = (userId, isRestricted) => {
    if (isRestricted) {
      if (window.confirm("Unrestrict this user?")) {
        return handleApiAction("unrestrict", userId, "User unrestricted successfully");
      }
    } else {
      if (window.confirm("Restrict this user? They won't be able to login.")) {
        return handleApiAction("restrict", userId, "User restricted successfully");
      }
    }
  };

  const handleVerifyUser = (userId) => {
    if (window.confirm("Verify this user?")) {
      return handleApiAction("verify", userId, "User verified successfully");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setActionLoading(true);
      
      try {
        const api = createAxiosInstance();
        const response = await api.delete(`/admin/users/${userId}`);
        
        if (response.data.success) {
          setUsers(prev => prev.filter(user => user.userId !== userId));
          
          if (selectedUser && selectedUser.userId === userId) {
            setShowUserModal(false);
            setSelectedUser(null);
          }
          
          await fetchStats();
          
          alert("User deleted successfully");
        } else {
          alert(response.data.message);
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert(err.response?.data?.message || "Failed to delete user");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusBadge = (user) => {
    if (user.isRestricted) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
          <Ban className="w-3 h-3" />
          Restricted
        </span>
      );
    }
    if (user.isAdmin) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Admin
        </span>
      );
    }
    if (user.verified) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
        <UserX className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.fullName, user.email, user.phone]
      .filter(Boolean)
      .some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold">{stats.admins || 0}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold">{stats.verified || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Restricted</p>
                <p className="text-2xl font-bold">{stats.restricted || 0}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
          
          <select
            value={filters.verification}
            onChange={(e) => setFilters({...filters, verification: e.target.value})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
          
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-700">User</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left p-4 font-semibold text-gray-700">Balance</th>
                <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-500 font-semibold">
                              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{user.fullName || 'Unnamed User'}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{user.email || 'No email'}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.registrationDate)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      ${user.balance?.toFixed(2) || "0.00"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {/* Admin Toggle */}
                        <button
                          onClick={() => handleMakeAdmin(user.userId, user.isAdmin)}
                          className={`p-2 rounded ${
                            user.isAdmin
                              ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          } disabled:opacity-50`}
                          title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                          disabled={actionLoading}
                        >
                          {user.isAdmin ? <UserMinus className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>

                        {/* Restrict Toggle */}
                        <button
                          onClick={() => handleRestrictUser(user.userId, user.isRestricted)}
                          className={`p-2 rounded ${
                            user.isRestricted
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          } disabled:opacity-50`}
                          title={user.isRestricted ? "Unrestrict" : "Restrict"}
                          disabled={actionLoading}
                        >
                          {user.isRestricted ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                        </button>

                        {/* Verify */}
                        {!user.verified && (
                          <button
                            onClick={() => handleVerifyUser(user.userId)}
                            className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50"
                            title="Verify User"
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                          title="View Details"
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                          title="Delete User"
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <UsersIcon className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg">No users found</p>
                      {searchTerm && (
                        <p className="text-sm mt-2">Try adjusting your search terms</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedUser.profilePic ? (
                    <img
                      src={selectedUser.profilePic}
                      alt={selectedUser.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-2xl font-semibold">
                      {selectedUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{selectedUser.fullName || 'Unnamed User'}</h3>
                    {getStatusBadge(selectedUser)}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedUser.email || 'No email'}
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedUser.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Balance
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-gray-700 font-medium">
                    ${selectedUser.balance?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Registration Date
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-gray-700">
                    {formatDate(selectedUser.registrationDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Role
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-gray-700">
                    {selectedUser.isAdmin ? "Administrator" : "Regular User"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Status
                  </label>
                  <div className="bg-gray-50 p-3 rounded text-gray-700">
                    {selectedUser.isRestricted ? "Restricted" : "Active"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 pt-6 border-t flex-wrap">
                <button
                  onClick={() => handleMakeAdmin(selectedUser.userId, selectedUser.isAdmin)}
                  className={`flex-1 min-w-[200px] p-3 rounded-lg ${
                    selectedUser.isAdmin
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white font-medium disabled:opacity-50`}
                  disabled={actionLoading}
                >
                  {selectedUser.isAdmin ? "Remove Admin Role" : "Make User Admin"}
                </button>
                <button
                  onClick={() => handleRestrictUser(selectedUser.userId, selectedUser.isRestricted)}
                  className={`flex-1 min-w-[200px] p-3 rounded-lg ${
                    selectedUser.isRestricted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white font-medium disabled:opacity-50`}
                  disabled={actionLoading}
                >
                  {selectedUser.isRestricted ? "Unrestrict User" : "Restrict User"}
                </button>
                {!selectedUser.verified && (
                  <button
                    onClick={() => handleVerifyUser(selectedUser.userId)}
                    className="flex-1 min-w-[200px] p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    Verify User
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(selectedUser.userId)}
                  className="flex-1 min-w-[200px] p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
                  disabled={actionLoading}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  Filter,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Users as UsersIcon,
  ShieldAlert,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
} from "lucide-react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showUserModal) {
        setShowUserModal(false);
        setVerificationData(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showUserModal]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("userToken");
      const res = await axios.get("https://agrochain-ethiopia-server1221.onrender.com/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationData = async (userId) => {
    try {
      setVerificationLoading(true);
      setError(null);
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "https://agrochain-ethiopia-server1221.onrender.com/api/admin/verifications/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const verification = res.data.pending.find((v) => v.userId === userId);
      setVerificationData(verification || null);
    } catch (err) {
      console.error("Error fetching verification data:", err);
      setError(
        err.response?.data?.error || "Failed to fetch verification data"
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRestrictUser = async (userId, isRestricted) => {
    setActionLoading(true);
    try {
      setError(null);
      const token = localStorage.getItem("userToken");
      await axios.post(
        `https://agrochain-ethiopia-server1221.onrender.com/api/admin/users/${userId}/restrict`,
        {},
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      if (selectedUser?.userId === userId) {
        setSelectedUser({ ...selectedUser, isRestricted: !isRestricted });
      }
    } catch (err) {
      console.error("Error restricting/unrestricting user:", err);
      setError(
        err.response?.data?.error || "Failed to restrict/unrestrict user"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeAdmin = async (userId, isAdmin) => {
    setActionLoading(true);
    try {
      setError(null);
      const token = localStorage.getItem("userToken");
      await axios.post(
        `https://agrochain-ethiopia-server1221.onrender.com/api/admin/make-admin/${userId}`,
        {},
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
      if (selectedUser?.userId === userId) {
        setSelectedUser({ ...selectedUser, isAdmin: !isAdmin });
      }
    } catch (err) {
      console.error("Error making/removing admin:", err);
      setError(err.response?.data?.error || "Failed to make/remove admin");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (user, verificationData) => {
    if (user.isRestricted) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" /> Restricted
        </span>
      );
    }
    if (user.verified) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
          <CheckCircle className="w-3 h-3 mr-1" /> Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
        <Clock className="w-3 h-3 mr-1" />{" "}
        {verificationData?.govIdStatus || "Unverified"}
      </span>
    );
  };

  const filteredUsers = users.filter((user) =>
    [user.fullName, user.email, user.phone]
      .filter(Boolean)
      .some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-500/20">
            {error}
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-cyan-500" />
            <h2 className="text-2xl font-bold">User Management</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 sm:w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
              />
            </div>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-cyan-500/20 overflow-hidden transition-colors duration-300">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white/90">
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Joined</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.userId}
                    className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                      user.isRestricted
                        ? "bg-red-50 dark:bg-red-900/10"
                        : ""
                    }`}
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full flex items-center justify-center text-white">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-cyan-500" />{" "}
                        {user.phone || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-500" />{" "}
                        {user.address || "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user, verificationData)}
                    </td>
                    <td className="p-4 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-cyan-500" />
                      {new Date(
                        user.registrationDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() =>
                          handleRestrictUser(user.userId, user.isRestricted)
                        }
                        className={`p-2 rounded-lg ${
                          user.isRestricted
                            ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20"
                            : "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-500/20"
                        } transition-colors duration-200 flex items-center gap-1`}
                        title={
                          user.isRestricted ? "Unrestrict User" : "Restrict User"
                        }
                        disabled={actionLoading}
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleMakeAdmin(user.userId, user.isAdmin)
                        }
                        className={`p-2 rounded-lg ${
                          user.isAdmin
                            ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/20"
                            : "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-500/20"
                        } transition-colors duration-200 flex items-center gap-1`}
                        title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                        disabled={actionLoading}
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          fetchVerificationData(user.userId);
                          setShowUserModal(true);
                        }}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500 dark:text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-cyan-500/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setVerificationData(null);
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              {error && (
                <div className="mb-4 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-500/20">
                  {error}
                </div>
              )}
              {selectedUser && (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full flex items-center justify-center text-white">
                      {selectedUser.profilePic ? (
                        <img
                          src={selectedUser.profilePic}
                          alt={selectedUser.fullName}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedUser.fullName}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedUser.email}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(selectedUser, verificationData)}
                      </div>
                    </div>
                  </div>
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.phone || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.address || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Balance
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.balance} ({selectedUser.pendingBalance}{" "}
                        pending)
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Rank
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.rank || "-"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Admin Status
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.isAdmin ? "Admin" : "User"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Posted Products
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                        {selectedUser.postedProducts?.length || 0}
                      </div>
                    </div>
                  </div>
                  {/* Verification */}
                  {verificationLoading ? (
                    <div className="flex items-center justify-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
                    </div>
                  ) : verificationData ? (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3">
                        Government ID
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            ID Front
                          </label>
                          <img
                            src={verificationData.govIdFront}
                            alt="Government ID Front"
                            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <a
                            href={verificationData.govIdFront}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-500 hover:underline mt-2 block"
                          >
                            View Full Size
                          </a>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                            ID Back
                          </label>
                          <img
                            src={verificationData.govIdBack}
                            alt="Government ID Back"
                            className="w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <a
                            href={verificationData.govIdBack}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-500 hover:underline mt-2 block"
                          >
                            View Full Size
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-gray-500 dark:text-gray-400">
                      No verification data available.
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() =>
                        handleRestrictUser(
                          selectedUser.userId,
                          selectedUser.isRestricted
                        )
                      }
                      className={`flex-1 p-3 rounded-lg ${
                        selectedUser.isRestricted
                          ? "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20"
                          : "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-500/20"
                      } transition-colors duration-200 flex items-center justify-center gap-2`}
                      disabled={actionLoading}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      {actionLoading
                        ? "Processing..."
                        : selectedUser.isRestricted
                        ? "Unrestrict User"
                        : "Restrict User"}
                    </button>
                    <button
                      onClick={() =>
                        handleMakeAdmin(
                          selectedUser.userId,
                          selectedUser.isAdmin
                        )
                      }
                      className={`flex-1 p-3 rounded-lg ${
                        selectedUser.isAdmin
                          ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-500/20"
                          : "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-500/20"
                      } transition-colors duration-200 flex items-center justify-center gap-2`}
                      disabled={actionLoading}
                    >
                      <UserPlus className="h-4 w-4" />
                      {actionLoading
                        ? "Processing..."
                        : selectedUser.isAdmin
                        ? "Remove Admin"
                        : "Make Admin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;

import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  ShieldAlert,
  Filter,
} from "lucide-react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import axios from "axios";

const SuspiciousUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchSuspiciousUsers();
  }, []);

  const fetchSuspiciousUsers = async () => {
    try {
      const res = await axios.get("/api/users/suspicious");
      setUsers(res.data.suspiciousUsers || []);
    } catch (err) {
      setError("Failed to fetch suspicious users.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyId = async (userId) => {
    try {
      await axios.patch(`/api/verify/${userId}`, { action: "approve" });
      fetchSuspiciousUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestrictUser = async (userId) => {
    try {
      await axios.post(`/api/users/${userId}/restrict`);
      fetchSuspiciousUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (user) => {
    if (user.verified) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    if (user.govIdStatus === "pending") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    }
    if (user.govIdStatus === "rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-600">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600">
        Unknown
      </span>
    );
  };

  // 🔎 Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center p-4">Loading suspicious users...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md min-h-[80vh]">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">Suspicious Users</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            className="w-64 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Contact</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Joined</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.userId}
                  className={`${
                    user.isRestricted || user.govIdStatus === "pending" ? "bg-red-100" : ""
                  } hover:bg-gray-200`}
                >
                  <td className="border px-4 py-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="border px-4 py-2 space-y-1 text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" /> {user.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {user.location || "-"}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{getStatusBadge(user)}</td>
                  <td className="border px-4 py-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2 flex gap-2">
                    <Button
                      variant="success"
                      size="icon"
                      onClick={() => handleVerifyId(user.userId)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => handleRestrictUser(user.userId)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No suspicious users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {/* User Details Modal */}
<Modal
  isOpen={showUserModal}
  onClose={() => setShowUserModal(false)}
  title="User Details"
  size="lg"
>
  {selectedUser && (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{selectedUser.fullName}</h3>
          <p className="text-gray-500">{selectedUser.email}</p>
          <div className="mt-2">{getStatusBadge(selectedUser)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {selectedUser.phone}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {selectedUser.location || "-"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium">Gov ID Status</label>
          <div className="mt-1">
            {selectedUser.govIdStatus === "pending" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-600">
                <Clock className="w-3 h-3 mr-1" /> Pending
              </span>
            )}
            {selectedUser.govIdStatus === "rejected" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-600">
                <XCircle className="w-3 h-3 mr-1" /> Rejected
              </span>
            )}
            {selectedUser.govIdStatus === "approved" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" /> Approved
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Verified</label>
          <div className="mt-1">
            {selectedUser.verified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" /> Yes
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600">
                ❌ No
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium">Restricted</label>
          <div className="mt-1">
            {selectedUser.isRestricted ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-600">
                🚫 Yes
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-600">
                ✅ No
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Registration Date</label>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {new Date(selectedUser.registrationDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )}
</Modal>

    </div>
  );
};

export default SuspiciousUsers;

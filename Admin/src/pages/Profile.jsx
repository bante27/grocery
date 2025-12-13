import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    role: 'Admin',
  });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && token) {
      setProfile({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        avatar: user.avatar || '',
        role: user.isAdmin ? 'Admin' : 'User',
      });
      fetchAdmins();
    }
  }, [user, token]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://agrochain-ethiopia-server1221.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const adminUsers = response.data.users.filter((u) => u.isAdmin);
        setAdmins(adminUsers);
      } else {
        setError('Failed to fetch admins');
      }
    } catch (error) {
      setError('Error fetching admins');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Admins List */}
      <Card gradient className="p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Admins
        </h3>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                      {admin.fullName || admin.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {admin.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          admin.isAdmin
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {admin.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          admin.isRestricted
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {admin.isRestricted ? 'Restricted' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No admins found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfile;

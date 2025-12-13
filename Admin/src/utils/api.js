// API utility functions for the admin dashboard

const API_BASE_URL = '/api/admin';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call failed:', error);
    throw error;
  }
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard-stats'),
  getRecentActivity: () => apiCall('/recent-activity'),
};

// User Management APIs
export const userAPI = {
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  update: (id, data) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
  verify: (id) => apiCall(`/users/${id}/verify`, { method: 'PATCH' }),
  setPending: (id) => apiCall(`/users/${id}/pending`, { method: 'PATCH' }),
  cancel: (id) => apiCall(`/users/${id}/cancel`, { method: 'PATCH' }),
};

// Product Management APIs
export const productAPI = {
  getAll: () => apiCall('/products'),
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/products/${id}`, { method: 'DELETE' }),
  uploadImage: (id, formData) => apiCall(`/products/${id}/image`, {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  }),
};

// Order Management APIs
export const orderAPI = {
  getAll: () => apiCall('/orders'),
  getById: (id) => apiCall(`/orders/${id}`),
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  delete: (id) => apiCall(`/orders/${id}`, { method: 'DELETE' }),
};

// Message Management APIs
export const messageAPI = {
  getAll: () => apiCall('/messages'),
  getById: (id) => apiCall(`/messages/${id}`),
  markAsRead: (id) => apiCall(`/messages/${id}/read`, { method: 'PATCH' }),
  reply: (id, message) => apiCall(`/messages/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  delete: (id) => apiCall(`/messages/${id}`, { method: 'DELETE' }),
};

// Profile APIs
export const profileAPI = {
  get: () => apiCall('/profile'),
  update: (data) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadAvatar: (formData) => apiCall('/profile/avatar', {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  }),
  changePassword: (data) => apiCall('/profile/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Settings APIs
export const settingsAPI = {
  get: () => apiCall('/settings'),
  update: (data) => apiCall('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadLogo: (formData) => apiCall('/settings/logo', {
    method: 'POST',
    headers: {}, // Let browser set Content-Type for FormData
    body: formData,
  }),
};

// Authentication APIs
export const authAPI = {
  login: (credentials) => fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }),
  logout: () => apiCall('/logout', { method: 'POST' }),
  validate: () => apiCall('/validate'),
  refreshToken: () => apiCall('/refresh-token', { method: 'POST' }),
};

export default {
  dashboardAPI,
  userAPI,
  productAPI,
  orderAPI,
  messageAPI,
  profileAPI,
  settingsAPI,
  authAPI,
};
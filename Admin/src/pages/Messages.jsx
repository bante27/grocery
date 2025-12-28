import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, RefreshCw, Search, Mail, User, Clock, Trash2, Check, Send, AlertCircle, ChevronDown, Eye as EyeIcon } from 'lucide-react';

const Messages = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [expandedMessages, setExpandedMessages] = useState({});
  
  // API URL
  const API_URL = 'http://127.0.0.1:8000/api';

  // Get token from localStorage (or from AuthContext if you have it)
  const getToken = () => {
    // Try to get token from different storage locations
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('token') || 
           sessionStorage.getItem('auth_token');
  };

  // Create axios instance with authorization header
  const createAxiosInstance = () => {
    const token = getToken();
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
  };

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiClient = createAxiosInstance();
      
      // Test connection first
      await apiClient.get('/test');
      
      // Fetch messages
      const params = new URLSearchParams();
      if (filterUnread) params.append('unread_only', 'true');
      if (search) params.append('search', search);
      
      const res = await apiClient.get(`/admin/messages?${params.toString()}`);
      
      if (res.data.success) {
        setMessages(res.data.messages || []);
        // Reset expanded messages when fetching new data
        setExpandedMessages({});
      } else {
        setError(res.data.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please login again.');
      } else if (err.message === 'Network Error') {
        setError('Cannot connect to server. Make sure Laravel is running.');
      } else {
        setError('An error occurred while loading messages.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle message expansion
  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Toggle read/unread for a single message
  const toggleRead = async (msg) => {
    try {
      const apiClient = createAxiosInstance();
      const updatedMessage = { ...msg, is_read: !msg.is_read };
      
      // Update in messages list
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === msg.id ? updatedMessage : m
        )
      );
      
      // Update selectedMessage if it's the same message
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage(updatedMessage);
      }
      
      // Call API with authorization
      await apiClient.put(`/admin/messages/${msg.id}/toggle-read`);
      
    } catch (err) {
      console.error('Toggle read error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        alert('Failed to update status');
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!window.confirm('Mark all unread messages as read?')) return;
    
    try {
      const apiClient = createAxiosInstance();
      
      // Update all unread messages locally
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.is_read ? m : { ...m, is_read: true }
        )
      );
      
      // Update selectedMessage if it's unread
      if (selectedMessage && !selectedMessage.is_read) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
      
      // Call API with authorization
      await apiClient.put('/admin/messages/mark-all-read');
      alert('All messages marked as read!');
    } catch (err) {
      console.error('Mark all read error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        alert('Failed to mark all as read');
      }
    }
  };

  // Delete message
  const deleteMessage = async (msg) => {
    if (!window.confirm(`Delete message from ${msg.name}?`)) return;
    
    try {
      const apiClient = createAxiosInstance();
      
      // Remove from messages list
      setMessages(prevMessages => 
        prevMessages.filter(m => m.id !== msg.id)
      );
      
      // Remove from expanded messages
      setExpandedMessages(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[msg.id];
        return newExpanded;
      });
      
      // Close modal if deleting the selected message
      if (selectedMessage?.id === msg.id) {
        setShowModal(false);
        setSelectedMessage(null);
      }
      
      // Call API with authorization
      await apiClient.delete(`/admin/messages/${msg.id}`);
      alert('Message deleted!');
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        alert('Failed to delete message');
      }
    }
  };

  // Send reply
  const sendReply = async () => {
    if (!replyText.trim() || !selectedMessage) {
      alert('Please enter a reply');
      return;
    }
    
    setReplying(true);
    try {
      const apiClient = createAxiosInstance();
      
      const response = await apiClient.post(
        `/admin/messages/${selectedMessage.id}/reply`,
        { reply_content: replyText }
      );
      
      if (response.data.success) {
        alert(`✅ Reply sent to ${selectedMessage.email}`);
        setReplyText('');
        setShowModal(false);
        setSelectedMessage(null);
      } else {
        alert('Failed to send reply: ' + response.data.message);
      }
    } catch (err) {
      console.error('Send reply error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        alert('Failed to send reply');
      }
    } finally {
      setReplying(false);
    }
  };

  // View message details - auto-mark as read
  const viewMessageDetails = async (msg) => {
    try {
      const apiClient = createAxiosInstance();
      
      const res = await apiClient.get(`/admin/messages/${msg.id}`);
      if (res.data.success) {
        const updatedMessage = res.data.message;
        
        // Set the updated message
        setSelectedMessage(updatedMessage);
        setShowModal(true);
        
        // Update in messages list
        setMessages(prevMessages => 
          prevMessages.map(m => 
            m.id === msg.id ? updatedMessage : m
          )
        );
      }
    } catch (err) {
      console.error('View details error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        // If API fails, still show the message but mark as read locally
        const updatedMessage = { ...msg, is_read: true };
        setSelectedMessage(updatedMessage);
        setShowModal(true);
        
        // Update in messages list
        setMessages(prevMessages => 
          prevMessages.map(m => 
            m.id === msg.id ? updatedMessage : m
          )
        );
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const searchMatch = !search || 
      [msg.name, msg.email, msg.subject, msg.message].some(field => 
        field?.toLowerCase().includes(search.toLowerCase())
      );
    const unreadMatch = !filterUnread || !msg.is_read;
    return searchMatch && unreadMatch;
  });

  // Count unread
  const unreadCount = messages.filter(msg => !msg.is_read).length;

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isAuthError = error.includes('login') || error.includes('Authentication') || error.includes('Session expired');
    
    return (
      <div className="text-center py-8">
        <div className={`${isAuthError ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6 max-w-md mx-auto`}>
          <AlertCircle className={`w-12 h-12 ${isAuthError ? 'text-yellow-400' : 'text-red-400'} mx-auto mb-4`} />
          <p className={`${isAuthError ? 'text-yellow-700' : 'text-red-600'} font-medium mb-2`}>
            {isAuthError ? 'Authentication Required' : 'Error Loading Messages'}
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
            {isAuthError && (
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-2"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Messages</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span>{messages.length} total messages</span>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              <span className="font-medium text-red-600">{unreadCount} unread</span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterUnread(!filterUnread)} 
            className={`px-4 py-2 rounded-lg flex items-center ${
              filterUnread 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {filterUnread ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {filterUnread ? 'Show All' : 'Unread Only'}
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </button>
          )}
          
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {search || filterUnread ? 'No matching messages' : 'No messages yet'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mt-2"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 border rounded-lg hover:shadow-md transition ${
                msg.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="font-medium text-gray-900 mb-1">{msg.subject}</p>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{msg.email}</span>
                    </div>
                    {msg.created_at && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(msg.created_at)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-600 mt-2">
                    <p className={expandedMessages[msg.id] ? '' : 'line-clamp-2'}>
                      {msg.message}
                    </p>
                    
                    {msg.message && msg.message.length > 100 && !expandedMessages[msg.id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageExpansion(msg.id);
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-1 text-sm font-medium"
                      >
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Display More
                      </button>
                    )}
                    
                    {expandedMessages[msg.id] && msg.message && msg.message.length > 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageExpansion(msg.id);
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-1 text-sm font-medium"
                      >
                        <ChevronDown className="w-4 h-4 mr-1 rotate-180" />
                        Show Less
                      </button>
                    )}
                  </div>
                  
                  {/* View button at bottom */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <button
                      onClick={() => viewMessageDetails(msg)}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Full Message
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRead(msg);
                        }}
                        className={`px-3 py-1 text-xs rounded-full ${
                          msg.is_read 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(msg);
                        }}
                        className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMessage(null);
                  setReplyText('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Message Info */}
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{selectedMessage.name}</h3>
                    <p className="text-gray-600">{selectedMessage.email}</p>
                  </div>
                  {!selectedMessage.is_read && (
                    <span className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-full">
                      Unread
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="font-medium text-lg text-gray-900">{selectedMessage.subject}</p>
                  {selectedMessage.created_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Received: {formatDate(selectedMessage.created_at)}
                    </p>
                  )}
                </div>
                
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Section */}
              <div className="pt-6 border-t">
                <h4 className="font-semibold text-lg mb-3">Reply to {selectedMessage.name}</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="border border-gray-300 rounded-lg p-4 w-full min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                
                <div className="flex gap-3 flex-wrap mt-4">
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim() || replying}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {replying ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => toggleRead(selectedMessage)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  
                  <button
                    onClick={() => deleteMessage(selectedMessage)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
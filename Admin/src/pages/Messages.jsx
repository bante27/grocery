import React, { useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

const initialState = {
  messages: [],
  loading: true,
  error: null,
  selectedMessage: null,
  showModal: false,
  search: '',
  filterUnread: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SELECTED':
      return { ...state, selectedMessage: action.payload, showModal: true };
    case 'CLOSE_MODAL':
      return { ...state, showModal: false, selectedMessage: null };
    case 'TOGGLE_UNREAD':
      return { ...state, filterUnread: !state.filterUnread };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
        selectedMessage:
          state.selectedMessage?.id === action.payload.id
            ? action.payload
            : state.selectedMessage,
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
        showModal: false,
        selectedMessage: null,
      };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    default:
      return state;
  }
}

const Messages = () => {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [replyText, setReplyText] = useState('');
  const { messages, loading, selectedMessage, showModal, filterUnread, search } = state;

  const apiHeaders = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // Fetch all messages
  const fetchMessages = async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/admin/messages', apiHeaders);
      if (res.data.success) dispatch({ type: 'SET_MESSAGES', payload: res.data.messages });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  // Toggle read/unread
  const toggleRead = async (msg) => {
    const updated = { ...msg, is_read: !msg.is_read };
    dispatch({ type: 'UPDATE_MESSAGE', payload: updated });
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/admin/messages/${msg.id}`,
        { is_read: updated.is_read },
        apiHeaders
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Delete message
  const deleteMessage = async (msg) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admin/messages/${msg.id}`, apiHeaders);
      dispatch({ type: 'DELETE_MESSAGE', payload: msg.id });
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Admin reply without saving
  const sendReply = async () => {
    if (!replyText.trim()) return alert('Reply cannot be empty!');
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/admin/messages/${selectedMessage.id}/reply`,
        { reply: replyText },
        apiHeaders
      );
      alert('Reply sent successfully!');
      setReplyText('');
      dispatch({ type: 'CLOSE_MODAL' });
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    }
  };

  const filteredMessages = messages.filter((m) => {
    const searchMatch =
      !search ||
      [m.name, m.email, m.subject, m.message].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase())
      );
    const unreadMatch = !filterUnread || !m.is_read;
    return searchMatch && unreadMatch;
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <p>Loading messages...</p>;

  return (
    <div>
      {/* Search & Filters */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          className="border px-3 py-2 rounded flex-1"
        />
        <Button onClick={() => dispatch({ type: 'TOGGLE_UNREAD' })}>
          {filterUnread ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {filterUnread ? 'Show All' : 'Unread Only'}
        </Button>
        <Button onClick={fetchMessages}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No messages found.</p>
      ) : (
        filteredMessages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => dispatch({ type: 'SET_SELECTED', payload: msg })}
            className="p-4 border rounded mb-3 cursor-pointer bg-white hover:bg-gray-50 transition flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{msg.name}</h3>
              <p className="text-gray-800">{msg.subject}</p>
              <p className="text-sm text-gray-500 mt-1">{msg.email}</p>
            </div>

            {/* Unread Badge */}
            {!msg.is_read && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                Unread
              </span>
            )}
          </div>
        ))
      )}

      {/* Message Detail Modal */}
      <Modal isOpen={showModal} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} title="Message Details">
        {selectedMessage && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-xl">{selectedMessage.name}</h3>
              <p className="text-gray-600">{selectedMessage.email}</p>
            </div>
            <div>
              <p className="font-medium text-lg">{selectedMessage.subject}</p>
            </div>
            <div className="whitespace-pre-wrap">{selectedMessage.message}</div>

            <div className="pt-4 border-t space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="border p-2 w-full rounded"
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={sendReply}>Send Reply</Button>
                <Button onClick={() => toggleRead(selectedMessage)}>
                  {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                </Button>
                <Button variant="danger" onClick={() => deleteMessage(selectedMessage)}>
                  Delete Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;

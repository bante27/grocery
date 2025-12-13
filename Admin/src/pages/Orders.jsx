import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Eye,
  Calendar,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('https://agrochain-ethiopia-server1221.onrender.com/api/admin/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
      });
      const transactions = response.data.transactions || [];
      const updatedOrders = await Promise.all(transactions.map(async (order) => {
        const buyerData = await fetchUserData(order.buyerUserId);
        const sellerData = await fetchUserData(order.sellerUserId);
        const productData = await fetchProductData(order.productId);
        return {
          ...order,
          buyerName: buyerData?.fullName || order.buyerUserId,
          sellerName: sellerData?.fullName || order.sellerUserId,
          productName: productData?.title || order.productId,
          productLink: productData?._id ? `/products/${productData._id}` : '#',
          productData: productData,
          // Calculate service fee if not provided by backend (5% of totalPrice)
          serviceFee: order.serviceFee || (order.totalPrice * 0.05).toFixed(2)
        };
      }));
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`https://agrochain-ethiopia-server1221.onrender.com/api/admin/users/${userId}`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const fetchProductData = async (productId) => {
    try {
      const response = await axios.get(`https://agrochain-ethiopia-server1221.onrender.com/api/admin/${productId}`, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      return response.data.product;
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  };

  const handleUserClick = async (userId) => {
    const userData = await fetchUserData(userId);
    setSelectedUser(userData);
    setShowUserModal(true);
  };

  const handleProductClick = (productData) => {
    setSelectedProduct(productData);
    setShowProductModal(true);
  };

  const filteredOrders = orders.filter(order =>
    order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-600 border-green-200', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-600 border-yellow-200', icon: Clock },
      canceled: { color: 'bg-red-100 text-red-600 border-red-200', icon: XCircle }
    };
   
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
   
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-md min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-emerald-500" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Order Management
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            className="w-48 md:w-64 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 overflow-x-auto p-4">
        <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Order ID</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Buyer</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Seller</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Product</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Total</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Status</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Date</th>
              <th className="text-left p-4 text-gray-800 dark:text-gray-100 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-4">
                    <span className="font-mono text-emerald-400 font-medium">{order._id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span
                        className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        onClick={() => handleUserClick(order.buyerUserId)}
                      >
                        {order.buyerName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span
                        className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        onClick={() => handleUserClick(order.sellerUserId)}
                      >
                        {order.sellerName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span
                        className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        onClick={() => handleProductClick(order.productData)}
                      >
                        {order.productName}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{order.quantity} items</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold">${order.totalPrice?.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        variant="secondary"
                        size="icon"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-700 dark:text-gray-300">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Order ID: </span>
                    <span className="font-mono text-emerald-400">{selectedOrder._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date: </span>
                    <span className="text-gray-900 dark:text-gray-100">{new Date(selectedOrder.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status: </span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total: </span>
                    <span className="text-emerald-400 font-bold">${selectedOrder.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Service Fee (5%): </span>
                    <span className="text-gray-900 dark:text-gray-100">${selectedOrder.serviceFee}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Platform Fee (Buyer): </span>
                    <span className="text-gray-900 dark:text-gray-100">${selectedOrder.platformFeeBuyer?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Net Seller Amount: </span>
                    <span className="text-gray-900 dark:text-gray-100">${selectedOrder.netSellerAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transaction Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Buyer Name: </span>
                    <span
                      className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                      onClick={() => handleUserClick(selectedOrder.buyerUserId)}
                    >
                      {selectedOrder.buyerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Seller Name: </span>
                    <span
                      className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                      onClick={() => handleUserClick(selectedOrder.sellerUserId)}
                    >
                      {selectedOrder.sellerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Product: </span>
                    <span
                      className="text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                      onClick={() => handleProductClick(selectedOrder.productData)}
                    >
                      {selectedOrder.productName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Quantity: </span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedOrder.quantity} items</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Delivery Address: </span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedOrder.deliveryAddress || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment Held: </span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedOrder.paymentHeld ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedUser.fullName}</h3>
                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Username</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.username || '-'}
                </div>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.phone || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.address || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.location || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Balance</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.balance} ({selectedUser.pendingBalance} pending)
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Rank</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.rank || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Admin Status</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.isAdmin ? 'Admin' : 'User'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Posted Products</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedUser.postedProducts?.length || 0}
                </div>
              </div>
            </div>
            {selectedUser.govIdFront && selectedUser.govIdBack && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Government ID</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ID Front</label>
                    <img
                      src={selectedUser.govIdFront}
                      alt="Government ID Front"
                      className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <a
                      href={selectedUser.govIdFront}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline mt-2 block"
                    >
                      View Full Size
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ID Back</label>
                    <img
                      src={selectedUser.govIdBack}
                      alt="Government ID Back"
                      className="w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <a
                      href={selectedUser.govIdBack}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline mt-2 block"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
      {/* Product Details Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Product Details"
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                  <span className="text-xl font-bold">{selectedProduct.title?.charAt(0)}</span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedProduct.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">Product ID: {selectedProduct.productId}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.description || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Price</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  ${selectedProduct.price?.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.type || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Origin Address</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.originAddress || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Quantity Available</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.quantityAvailable || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Sold Quantity</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.soldQuantity || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.status || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.averageRating || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Likes Count</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.likesCount || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Owner</label>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-gray-100">
                  {selectedProduct.ownerName || selectedProduct.ownerUserId || '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
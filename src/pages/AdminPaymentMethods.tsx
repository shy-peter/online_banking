import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClickToCopy from '../components/ClickToCopy';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  QrCode,
  CreditCard,
  Smartphone,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';
import { PaymentMethodType } from '../types/appwrite';
import toast from 'react-hot-toast';

interface PaymentMethod {
  $id: string;
  userId: string;
  type: string;
  name: string;
  accountNumber: string;
  isDefault: boolean;
  status: 'pending' | 'verified' | 'rejected';
  email?: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
  qrCodeUrl?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface User {
  $id: string;
  userId: string;
  name: string;
  email: string;
  accountNumber: string;
}

const AdminPaymentMethods = () => {
  const { databases, DATABASE_ID, COLLECTIONS, storage, getPaymentMethodTypes } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<PaymentMethodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRUrl, setSelectedQRUrl] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    userId: '',
    type: 'paypal',
    name: '',
    accountNumber: '',
    email: '',
    username: '',
    phoneNumber: '',
    address: '',
    status: 'pending' as 'pending' | 'verified' | 'rejected',
    qrCodeFile: null as File | null
  });

  useEffect(() => {
    fetchPaymentMethods();
    fetchUsers();
    fetchPaymentMethodTypes();
  }, []);

  const fetchPaymentMethodTypes = async () => {
    try {
      const types = await getPaymentMethodTypes();
      setPaymentMethodTypes(types);
    } catch (error) {
      console.error('Error fetching payment method types:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        []
      );
      setPaymentMethods(response.documents as PaymentMethod[]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        []
      );
      setUsers(response.documents as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const fileId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await storage.createFile(
        'payment-qr-codes',
        fileId,
        file
      );
      return response.$id;
    } catch (error) {
      console.error('Error uploading QR code:', error);
      throw new Error('Failed to upload QR code');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let qrCodeUrl = '';
      
      // Upload QR code if provided
      if (formData.qrCodeFile) {
        const fileId = await handleFileUpload(formData.qrCodeFile);
        qrCodeUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/payment-qr-codes/files/${fileId}/view?project=investflow`;
      }

      const paymentMethodData = {
        userId: formData.userId,
        type: formData.type,
        name: formData.name,
        accountNumber: formData.accountNumber,
        email: formData.email || '',
        username: formData.username || '',
        phoneNumber: formData.phoneNumber || '',
        address: formData.address || '',
        status: formData.status,
        qrCodeUrl: qrCodeUrl
      };

      if (selectedPaymentMethod) {
        // Update existing payment method
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PAYMENT_METHODS,
          selectedPaymentMethod.$id,
          paymentMethodData
        );
        toast.success('Payment method updated successfully!');
      } else {
        // Create new payment method
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.PAYMENT_METHODS,
          `payment_${Date.now()}`,
          paymentMethodData
        );
        toast.success('Payment method added successfully!');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedPaymentMethod(null);
      resetForm();
      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast.error(error.message || 'Failed to save payment method');
    }
  };

  const handleEdit = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setFormData({
      userId: paymentMethod.userId,
      type: paymentMethod.type,
      name: paymentMethod.name,
      accountNumber: paymentMethod.accountNumber,
      email: paymentMethod.email || '',
      username: paymentMethod.username || '',
      phoneNumber: paymentMethod.phoneNumber || '',
      address: paymentMethod.address || '',
      status: paymentMethod.status,
      qrCodeFile: null
    });
    setShowEditModal(true);
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId
      );
      toast.success('Payment method deleted successfully!');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleStatusChange = async (paymentMethodId: string, newStatus: 'pending' | 'verified' | 'rejected') => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId,
        { status: newStatus }
      );
      toast.success(`Payment method ${newStatus} successfully!`);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating payment method status:', error);
      toast.error('Failed to update payment method status');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      type: 'paypal',
      name: '',
      accountNumber: '',
      email: '',
      username: '',
      phoneNumber: '',
      address: '',
      status: 'pending',
      qrCodeFile: null
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    const paymentType = paymentMethodTypes.find(pt => pt.type === type);
    if (paymentType?.icon) {
      switch (paymentType.icon) {
        case 'CreditCard':
          return <CreditCard className="w-5 h-5" />;
        case 'Smartphone':
          return <Smartphone className="w-5 h-5" />;
        case 'DollarSign':
          return <DollarSign className="w-5 h-5" />;
        default:
          return <CreditCard className="w-5 h-5" />;
      }
    }
    return <CreditCard className="w-5 h-5" />;
  };

  const filteredPaymentMethods = paymentMethods.filter(pm => {
    const matchesStatus = filterStatus === 'all' || pm.status === filterStatus;
    const matchesSearch = pm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pm.accountNumber.includes(searchTerm) ||
                         pm.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.name : 'Unknown User';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods Management</h1>
          <p className="text-gray-600">Manage user payment methods and QR codes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payment methods..."
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Payment Methods Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPaymentMethods.map((paymentMethod) => (
                <tr key={paymentMethod.$id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getUserName(paymentMethod.userId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paymentMethod.userId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(paymentMethod.type)}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {paymentMethod.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{paymentMethod.name}</div>
                      <div className="text-gray-500">{paymentMethod.accountNumber}</div>
                      {paymentMethod.email && (
                        <ClickToCopy text={paymentMethod.email} copyMessage="Email copied to clipboard!">
                          <div className="text-gray-500">{paymentMethod.email}</div>
                        </ClickToCopy>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(paymentMethod.status)}`}>
                      {paymentMethod.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {paymentMethod.qrCodeUrl ? (
                      <button
                        onClick={() => {
                          setSelectedQRUrl(paymentMethod.qrCodeUrl!);
                          setShowQRModal(true);
                        }}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-800"
                      >
                        <QrCode className="w-4 h-4" />
                        <span className="text-sm">View QR</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">No QR</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(paymentMethod)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(paymentMethod.$id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {paymentMethod.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(paymentMethod.$id, 'verified')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(paymentMethod.$id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPaymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedPaymentMethod(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User
                      </label>
                      <select
                        value={formData.userId}
                        onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select User</option>
                        {users.map(user => (
                          <option key={user.userId} value={user.userId}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select Payment Method Type</option>
                        {paymentMethodTypes
                          .filter(type => type.isActive)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map(type => (
                            <option key={type.$id} value={type.type}>
                              {type.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number/ID
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' | 'verified' | 'rejected' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR Code Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData(prev => ({ ...prev, qrCodeFile: e.target.files?.[0] || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a QR code image for this payment method
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedPaymentMethod(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {selectedPaymentMethod ? 'Update' : 'Add'} Payment Method
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="text-center">
                  <img
                    src={selectedQRUrl}
                    alt="QR Code"
                    className="max-w-full h-auto mx-auto rounded-lg"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentMethods;

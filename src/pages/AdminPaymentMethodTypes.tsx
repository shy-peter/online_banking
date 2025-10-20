import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  CreditCard,
  Smartphone,
  DollarSign,
  Building2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  QrCode,
  Upload,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethodType } from '../types/appwrite';
import toast from 'react-hot-toast';

const AdminPaymentMethodTypes = () => {
  const { databases, DATABASE_ID, COLLECTIONS, storage } = useAuth();
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<PaymentMethodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    icon: 'CreditCard',
    category: 'digital_wallet' as 'digital_wallet' | 'mobile_payment' | 'cryptocurrency' | 'bank_transfer' | 'other',
    requiredFields: '',
    optionalFields: '',
    isActive: true,
    sortOrder: 1,
    qrCodeFile: null as File | null
  });

  const iconOptions = [
    { value: 'CreditCard', label: 'Credit Card', icon: CreditCard },
    { value: 'Smartphone', label: 'Smartphone', icon: Smartphone },
    { value: 'DollarSign', label: 'Dollar Sign', icon: DollarSign },
    { value: 'Building2', label: 'Building', icon: Building2 },
    { value: 'MoreHorizontal', label: 'More', icon: MoreHorizontal }
  ];

  const categoryOptions = [
    { value: 'digital_wallet', label: 'Digital Wallet', color: 'bg-blue-100 text-blue-800' },
    { value: 'mobile_payment', label: 'Mobile Payment', color: 'bg-green-100 text-green-800' },
    { value: 'cryptocurrency', label: 'Cryptocurrency', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'bank_transfer', label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchPaymentMethodTypes();
  }, []);

  const fetchPaymentMethodTypes = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        'payment-method-types',
        []
      );
      setPaymentMethodTypes(response.documents as PaymentMethodType[]);
    } catch (error: any) {
      console.error('Error fetching payment method types:', error);
      
      // Check if the collection doesn't exist
      if (error.code === 404 || error.message?.includes('not found')) {
        toast.error('Payment method types collection not found. Please run the setup script first.');
      } else {
        toast.error('Failed to fetch payment method types');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      // Extract file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      console.log('Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileExtension: fileExtension,
        bucketId: 'files',
        fullFileName: file.name,
        nameParts: file.name.split('.')
      });
      
      // Check if file extension is allowed
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error(`File extension '${fileExtension}' not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
      
      const fileId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await storage.createFile(
        'files', // Using the existing 'files' bucket
        fileId,
        file
      );
      
      console.log('File uploaded successfully:', response.$id);
      return response.$id;
    } catch (error: any) {
      console.error('Error uploading QR code:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      throw new Error(`Failed to upload QR code: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let qrCodeUrl = '';
      
      // Upload QR code if provided
      if (formData.qrCodeFile) {
        const fileId = await handleFileUpload(formData.qrCodeFile);
        qrCodeUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/files/files/${fileId}/view?project=68d9353a00112ca03052`;
      }

      const paymentMethodTypeData = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        category: formData.category,
        requiredFields: formData.requiredFields,
        optionalFields: formData.optionalFields,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        qrCodeUrl: qrCodeUrl
      };

      if (selectedType) {
        // Update existing payment method type
        await databases.updateDocument(
          DATABASE_ID,
          'payment-method-types',
          selectedType.$id,
          paymentMethodTypeData
        );
        toast.success('Payment method type updated successfully!');
      } else {
        // Create new payment method type
        await databases.createDocument(
          DATABASE_ID,
          'payment-method-types',
          formData.type,
          paymentMethodTypeData
        );
        toast.success('Payment method type added successfully!');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
      fetchPaymentMethodTypes();
    } catch (error: any) {
      console.error('Error saving payment method type:', error);
      toast.error(error.message || 'Failed to save payment method type');
    }
  };

  const handleEdit = (paymentMethodType: PaymentMethodType) => {
    setSelectedType(paymentMethodType);
    setFormData({
      type: paymentMethodType.type,
      name: paymentMethodType.name,
      description: paymentMethodType.description || '',
      icon: paymentMethodType.icon || 'CreditCard',
      category: paymentMethodType.category,
      requiredFields: paymentMethodType.requiredFields || '',
      optionalFields: paymentMethodType.optionalFields || '',
      isActive: paymentMethodType.isActive,
      sortOrder: paymentMethodType.sortOrder,
      qrCodeFile: null
    });
    setShowEditModal(true);
  };

  const handleDelete = async (paymentMethodTypeId: string) => {
    if (!confirm('Are you sure you want to delete this payment method type? This action cannot be undone.')) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        'payment-method-types',
        paymentMethodTypeId
      );
      toast.success('Payment method type deleted successfully!');
      fetchPaymentMethodTypes();
    } catch (error) {
      console.error('Error deleting payment method type:', error);
      toast.error('Failed to delete payment method type');
    }
  };

  const handleToggleActive = async (paymentMethodType: PaymentMethodType) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'payment-method-types',
        paymentMethodType.$id,
        { isActive: !paymentMethodType.isActive }
      );
      toast.success(`Payment method type ${!paymentMethodType.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchPaymentMethodTypes();
    } catch (error) {
      console.error('Error updating payment method type status:', error);
      toast.error('Failed to update payment method type status');
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      name: '',
      description: '',
      icon: 'CreditCard',
      category: 'digital_wallet',
      requiredFields: '',
      optionalFields: '',
      isActive: true,
      sortOrder: 1,
      qrCodeFile: null
    });
  };

  const getCategoryColor = (category: string) => {
    const categoryOption = categoryOptions.find(opt => opt.value === category);
    return categoryOption ? categoryOption.color : 'bg-gray-100 text-gray-800';
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : CreditCard;
  };

  const filteredTypes = paymentMethodTypes.filter(type => {
    const matchesCategory = filterCategory === 'all' || type.category === filterCategory;
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && type.isActive) || 
      (filterActive === 'inactive' && !type.isActive);
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesActive && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show setup message if collection doesn't exist
  if (paymentMethodTypes.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Method Types Management</h1>
            <p className="text-gray-600">Manage available payment method types and their configurations</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Setup Required</h3>
              <p className="text-yellow-700 mb-4">
                The payment method types collection hasn't been created yet. You need to run the setup script first.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">To fix this, run one of these commands:</h4>
                  <div className="bg-yellow-100 rounded-md p-3 space-y-2">
                    <div>
                      <span className="font-mono text-sm text-yellow-800">Windows:</span>
                      <div className="font-mono text-sm text-yellow-700 bg-white rounded px-2 py-1 mt-1">
                        setup-payment-method-types.bat
                      </div>
                    </div>
                    <div>
                      <span className="font-mono text-sm text-yellow-800">Linux/Mac:</span>
                      <div className="font-mono text-sm text-yellow-700 bg-white rounded px-2 py-1 mt-1">
                        chmod +x setup-payment-method-types.sh && ./setup-payment-method-types.sh
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Also create the QR code storage bucket:</h4>
                  <div className="bg-yellow-100 rounded-md p-3 space-y-2">
                    <div>
                      <span className="font-mono text-sm text-yellow-800">Windows:</span>
                      <div className="font-mono text-sm text-yellow-700 bg-white rounded px-2 py-1 mt-1">
                        setup-payment-qr-storage.bat
                      </div>
                    </div>
                    <div>
                      <span className="font-mono text-sm text-yellow-800">Linux/Mac:</span>
                      <div className="font-mono text-sm text-yellow-700 bg-white rounded px-2 py-1 mt-1">
                        chmod +x setup-payment-qr-storage.sh && ./setup-payment-qr-storage.sh
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={fetchPaymentMethodTypes}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Retry After Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Method Types Management</h1>
          <p className="text-gray-600">Manage available payment method types and their configurations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Payment Method Type</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payment method types..."
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Payment Method Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes.map((type) => {
          const IconComponent = getIconComponent(type.icon || 'CreditCard');
          return (
            <div key={type.$id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <IconComponent className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-500">{type.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleActive(type)}
                    className={`p-1 rounded ${
                      type.isActive 
                        ? 'text-green-600 hover:bg-green-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={type.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {type.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-1 text-primary-600 hover:bg-primary-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.$id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {type.description && (
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(type.category)}`}>
                    {categoryOptions.find(opt => opt.value === type.category)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {type.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sort Order:</span>
                  <span className="text-sm text-gray-600">{type.sortOrder}</span>
                </div>
              </div>

              {(type.requiredFields || type.optionalFields || type.qrCodeUrl) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {type.qrCodeUrl && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code:</h4>
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-4 h-4 text-primary-600" />
                        <span className="text-xs text-green-600">QR Code Available</span>
                      </div>
                    </div>
                  )}
                  {(type.requiredFields || type.optionalFields) && (
                    <>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fields:</h4>
                      <div className="space-y-1">
                        {type.requiredFields && (
                          <div className="text-xs">
                            <span className="font-medium text-red-600">Required:</span>
                            <span className="text-gray-600 ml-1">{type.requiredFields}</span>
                          </div>
                        )}
                        {type.optionalFields && (
                          <div className="text-xs">
                            <span className="font-medium text-blue-600">Optional:</span>
                            <span className="text-gray-600 ml-1">{type.optionalFields}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment method types found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' || filterActive !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first payment method type.'}
          </p>
          {!searchTerm && filterCategory === 'all' && filterActive === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Payment Method Type
            </button>
          )}
        </div>
      )}

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
                    {selectedType ? 'Edit Payment Method Type' : 'Add Payment Method Type'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedType(null);
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
                        Type ID *
                      </label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., paypal, venmo, cashapp"
                        required
                        disabled={!!selectedType}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Unique identifier (cannot be changed after creation)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., PayPal, Venmo"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Brief description of this payment method type"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Required Fields (JSON)
                      </label>
                      <input
                        type="text"
                        value={formData.requiredFields}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiredFields: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder='["email", "username"]'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        JSON array of required field names
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Optional Fields (JSON)
                      </label>
                      <input
                        type="text"
                        value={formData.optionalFields}
                        onChange={(e) => setFormData(prev => ({ ...prev, optionalFields: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder='["phoneNumber", "address"]'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        JSON array of optional field names
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR Code Image
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => setFormData(prev => ({ ...prev, qrCodeFile: e.target.files?.[0] || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a QR code image (JPG, PNG, GIF, or WebP format)
                    </p>
                    {selectedType?.qrCodeUrl && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Current QR Code:</p>
                        <div className="flex items-center space-x-2">
                          <QrCode className="w-4 h-4 text-primary-600" />
                          <span className="text-xs text-green-600">QR Code Available</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedType(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{selectedType ? 'Update' : 'Add'} Payment Method Type</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentMethodTypes;

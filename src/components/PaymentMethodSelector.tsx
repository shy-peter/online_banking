import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  CreditCard,
  Smartphone,
  DollarSign,
  Building2,
  MoreHorizontal,
  QrCode,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { PaymentMethodType } from "../types/appwrite";

interface PaymentMethodSelectorProps {
  onSelect?: (paymentMethodType: PaymentMethodType) => void;
  showQRCode?: boolean;
  title?: string;
  description?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  showQRCode = true,
  title = "Select Payment Method",
  description = "Choose your preferred payment method for deposits",
}) => {
  const { getPaymentMethodTypes } = useAuth();
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<
    PaymentMethodType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(
    null,
  );
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchPaymentMethodTypes();
  }, []);

  const fetchPaymentMethodTypes = async () => {
    try {
      setLoading(true);
      const types = await getPaymentMethodTypes();
      // Filter only active types and sort by sortOrder
      const activeTypes = types
        .filter((type) => type.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setPaymentMethodTypes(activeTypes);
    } catch (error) {
      console.error("Error fetching payment method types:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return <CreditCard className="w-6 h-6" />;
      case "Smartphone":
        return <Smartphone className="w-6 h-6" />;
      case "DollarSign":
        return <DollarSign className="w-6 h-6" />;
      case "Building2":
        return <Building2 className="w-6 h-6" />;
      case "MoreHorizontal":
        return <MoreHorizontal className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "digital_wallet":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mobile_payment":
        return "bg-green-100 text-green-800 border-green-200";
      case "cryptocurrency":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "bank_transfer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "digital_wallet":
        return "Digital Wallet";
      case "mobile_payment":
        return "Mobile Payment";
      case "cryptocurrency":
        return "Cryptocurrency";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return "Other";
    }
  };

  const handleSelect = (type: PaymentMethodType) => {
    setSelectedType(type);
    if (onSelect) {
      onSelect(type);
    }
  };

  const handleViewQR = (type: PaymentMethodType) => {
    setSelectedType(type);
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (paymentMethodTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Payment Methods Available
        </h3>
        <p className="text-gray-600">
          There are currently no active payment methods available for deposits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Payment Method Types Grid */}
      <div className="grid grid-cols-1  gap-4">
        {paymentMethodTypes.map((type) => (
          <motion.div
            key={type.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-lg border-2 p-6 w-full cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType?.$id === type.$id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-primary-300"
            }`}
            onClick={() => handleSelect(type)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-lg ${
                    selectedType?.$id === type.$id
                      ? "bg-primary-100"
                      : "bg-gray-100"
                  }`}
                >
                  {getIconComponent(type.icon || "CreditCard")}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(type.category)}`}
                  >
                    {getCategoryLabel(type.category)}
                  </span>
                </div>
              </div>
              {selectedType?.$id === type.$id && (
                <CheckCircle className="w-5 h-5 text-primary-600" />
              )}
            </div>

            {type.description && (
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>
            )}

            {/* QR Code Section */}
            {showQRCode && type.qrCodeUrl && (
              <div className="mt-4 pt-4 border-t flex items-center border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewQR(type);
                  }}
                  className="w-fit flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-sm lg:text-lg">View QR Code</span>
                </button>
              </div>
            )}

            {/* Required Fields Info */}
            {type.requiredFields && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">
                  Required Information:
                </p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(type.requiredFields).map(
                    (field: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(field);
                            toast.success("Copied to clipboard");
                          } catch (err) {
                            console.error("Copy failed", err);
                          }
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                      >
                        {field}
                      </button>
                    ),
                  )}{" "}
                  
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Selected method extra info */}
      {selectedType && selectedType.requiredFields && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            {selectedType.name} details
          </h4>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(selectedType.requiredFields).map(
              (field: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(field);
                      toast.success("Copied to clipboard");
                    } catch (err) {
                      console.error("Copy failed", err);
                    }
                  }}
                  className="px-3 py-1 bg-primary-100 text-primary-800 text-xs rounded hover:bg-primary-200 transition-colors"
                >
                  {field}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedType.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Scan QR code to make payment
                    </p>
                  </div>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <img
                      src={selectedType.qrCodeUrl}
                      alt={`${selectedType.name} QR Code`}
                      className="max-w-full h-auto mx-auto rounded-lg"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your {selectedType.name} app
                    </p>
                    {selectedType.description && (
                      <p className="text-xs text-gray-500">
                        {selectedType.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentMethodSelector;

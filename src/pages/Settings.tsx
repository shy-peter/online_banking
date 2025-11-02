import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import ClickToCopy from "../components/ClickToCopy";
import {
  User,
  Bell,
  Shield,
  Globe,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Calendar,
  Hash,
  TrendingUp,
  Edit3,
  Check,
  X,
  Camera,
  Upload,
  Trash2,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  Key,
  CreditCard,
  Plus,
  Edit,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../lib/appwrite";
import LoadingSpinner from "../components/LoadingSpinner";
import PasswordChangeModal from "../components/PasswordChangeModal";
import LoginHistoryModal from "../components/LoginHistoryModal";
import UserReferralPanel from "../components/UserReferralPanel";

const Settings = () => {
  const {
    user,
    userProfile,
    investments,
    paymentMethods,
    updateUserProfile,
    changePassword,
    getLoginHistory,
    terminateSession,
    terminateAllOtherSessions,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getPaymentMethodTypes,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [showBalance, setShowBalance] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });

  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userProfile?.name || "",
    phone: userProfile?.phone || "",
    firstName: userProfile?.personalInfo?.firstName || "",
    lastName: userProfile?.personalInfo?.lastName || "",
    dateOfBirth: userProfile?.personalInfo?.dateOfBirth || "",
    address: userProfile?.personalInfo?.address || "",
    city: userProfile?.personalInfo?.city || "",
    state: userProfile?.personalInfo?.state || "",
    zipCode: userProfile?.personalInfo?.zipCode || "",
    country: userProfile?.personalInfo?.country || "",
    occupation: userProfile?.personalInfo?.occupation || "",
    annualIncome: userProfile?.personalInfo?.annualIncome || "",
    ssn: userProfile?.personalInfo?.ssn || "",
    idType: userProfile?.personalInfo?.idType || "",
    secretPhrase: userProfile?.secretPhrase || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | File | null>(
    userProfile?.profilePicture ||
      localStorage.getItem(`profilePicture_${user?.$id}`) ||
      null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [showSecretPhrase, setShowSecretPhrase] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<any[]>([]);

  // Payment methods are now managed by AuthContext
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "paypal",
    name: "",
    email: "",
    username: "",
    phoneNumber: "",
    address: "",
  });

  // Handle URL query parameter to automatically open payment methods tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "payment") {
      setActiveTab("payment");
    }
    fetchPaymentMethodTypes();
  }, [searchParams]);

  const fetchPaymentMethodTypes = async () => {
    try {
      const types = await getPaymentMethodTypes();
      setPaymentMethodTypes(types);
    } catch (error) {
      console.error("Error fetching payment method types:", error);
    }
  };

  // Load user preferences on component mount
  useEffect(() => {
    if (userProfile?.preferences) {
      const prefs = userProfile.preferences;

      // Load dark mode preference
      if (prefs.darkMode !== undefined) {
        setIsDarkMode(prefs.darkMode);
        if (prefs.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }

      // Load currency preference
      if (prefs.currency) {
        setPreferredCurrency(prefs.currency);
      }

      // Load show balance preference
      if (prefs.showBalance !== undefined) {
        setShowBalance(prefs.showBalance);
      }
    }
  }, [userProfile]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: editData.name,
        phone: editData.phone,
        personalInfo: {
          firstName: editData.firstName,
          lastName: editData.lastName,
          dateOfBirth: editData.dateOfBirth,
          address: editData.address,
          city: editData.city,
          state: editData.state,
          zipCode: editData.zipCode,
          country: editData.country,
          occupation: editData.occupation,
          annualIncome: editData.annualIncome
            ? Number(editData.annualIncome)
            : undefined,
          ssn: editData.ssn,
          idType: editData.idType,
        },
        secretPhrase: editData.secretPhrase,
      });

      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      firstName: userProfile?.personalInfo?.firstName || "",
      lastName: userProfile?.personalInfo?.lastName || "",
      dateOfBirth: userProfile?.personalInfo?.dateOfBirth || "",
      address: userProfile?.personalInfo?.address || "",
      city: userProfile?.personalInfo?.city || "",
      state: userProfile?.personalInfo?.state || "",
      zipCode: userProfile?.personalInfo?.zipCode || "",
      country: userProfile?.personalInfo?.country || "",
      occupation: userProfile?.personalInfo?.occupation || "",
      annualIncome: userProfile?.personalInfo?.annualIncome || "",
      ssn: userProfile?.personalInfo?.ssn || "",
      idType: userProfile?.personalInfo?.idType || "",
      secretPhrase: userProfile?.secretPhrase || "",
    });
    setIsEditing(false);
  };

  // Profile picture upload functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProfilePicture(file);
    }
  };

  const handleUploadPicture = async () => {
    if (!profilePicture) return;

    setIsUploading(true);
    try {
      // Convert file to base64 for storage
      const base64 = await convertToBase64(profilePicture as unknown as File);

      // Update user profile with new picture
      const result = await updateUserProfile({
        profilePicture: base64 as string,
      });

      if (result.success) {
        setPreviewUrl(null);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    setIsUploading(true);
    try {
      const result = await updateUserProfile({
        profilePicture: null,
      });

      if (result.success) {
        setProfilePicture(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      alert("Failed to remove profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const convertToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Get user's investment plan
  const userPlan: any = null; // Could be calculated from user's investments if needed

  // Calculate portfolio stats
  const totalInvested =
    investments?.reduce(
      (sum, inv) => sum + (inv.status === "active" ? inv.amount : 0),
      0
    ) || 0;
  const activeInvestments =
    investments?.filter((inv) => inv.status === "active").length || 0;
  const joinDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US")
    : "N/A";

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "payment", name: "Payment Methods", icon: CreditCard },
    { id: "referrals", name: "Referrals", icon: Users },
    { id: "preferences", name: "Preferences", icon: Globe },
  ];

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = async (enabled: boolean) => {
    setIsDarkMode(enabled);

    // Apply dark mode to the document
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to user profile
    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          darkMode: enabled,
        },
      } as any);
    } catch (error) {
      console.error("Failed to save dark mode preference:", error);
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (currency: string) => {
    setPreferredCurrency(currency);

    // Save to user profile
    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          currency: currency,
        },
      } as any);
    } catch (error) {
      console.error("Failed to save currency preference:", error);
    }
  };

  // Handle show balance toggle
  const handleShowBalanceToggle = async (enabled: boolean) => {
    setShowBalance(enabled);

    // Save to user profile
    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          showBalance: enabled,
        },
      } as any);
    } catch (error) {
      console.error("Failed to save show balance preference:", error);
    }
  };

  // Payment method handlers
  const handleAddPaymentMethod = async () => {
    let displayName = "";
    let displayAccount = "";
    let isValid = false;

    switch (newPaymentMethod.type) {
      case "paypal":
        if (
          newPaymentMethod.email ||
          newPaymentMethod.username ||
          newPaymentMethod.phoneNumber
        ) {
          displayName = "PayPal";
          displayAccount =
            newPaymentMethod.email ||
            newPaymentMethod.username ||
            newPaymentMethod.phoneNumber;
          isValid = true;
        }
        break;
      case "venmo":
        if (
          newPaymentMethod.email ||
          newPaymentMethod.username ||
          newPaymentMethod.phoneNumber
        ) {
          displayName = "Venmo";
          displayAccount = newPaymentMethod.username
            ? `@${newPaymentMethod.username}`
            : newPaymentMethod.email || newPaymentMethod.phoneNumber;
          isValid = true;
        }
        break;
      case "cashapp":
        if (newPaymentMethod.username || newPaymentMethod.phoneNumber) {
          displayName = "Cash App";
          displayAccount = newPaymentMethod.username
            ? `$${newPaymentMethod.username}`
            : newPaymentMethod.phoneNumber;
          isValid = true;
        }
        break;
      case "usdt":
        if (newPaymentMethod.address) {
          displayName = "USDT";
          displayAccount = `${newPaymentMethod.address.slice(
            0,
            6
          )}...${newPaymentMethod.address.slice(-4)}`;
          isValid = true;
        }
        break;
      case "ethereum":
        if (newPaymentMethod.address) {
          displayName = "Ethereum";
          displayAccount = `${newPaymentMethod.address.slice(
            0,
            6
          )}...${newPaymentMethod.address.slice(-4)}`;
          isValid = true;
        }
        break;
      case "bitcoin":
        if (newPaymentMethod.address) {
          displayName = "Bitcoin";
          displayAccount = `${newPaymentMethod.address.slice(
            0,
            6
          )}...${newPaymentMethod.address.slice(-4)}`;
          isValid = true;
        }
        break;
    }

    if (!isValid) {
      alert("Please fill in the required information for this payment method");
      return;
    }

    const paymentMethodData = {
      type: newPaymentMethod.type as
        | "paypal"
        | "venmo"
        | "cashapp"
        | "usdt"
        | "ethereum"
        | "bitcoin",
      name: displayName,
      accountNumber: displayAccount,
      isDefault: paymentMethods.length === 0,
      status: "pending" as "pending" | "verified" | "rejected",
      email: newPaymentMethod.email || "",
      username: newPaymentMethod.username || "",
      phoneNumber: newPaymentMethod.phoneNumber || "",
      address: newPaymentMethod.address || "",
    };

    const result = await addPaymentMethod(paymentMethodData);

    if (result.success) {
      setNewPaymentMethod({
        type: "paypal",
        name: "",
        email: "",
        username: "",
        phoneNumber: "",
        address: "",
      });
      setShowAddPaymentModal(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this payment method?")
    ) {
      await deletePaymentMethod(id);
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    await setDefaultPaymentMethod(id);
  };

  const handleEditPaymentMethod = (method: any) => {
    setEditingPayment(method);
    setNewPaymentMethod({
      type: method.type,
      name: "",
      email: method.email || "",
      username: method.username || "",
      phoneNumber: method.phoneNumber || "",
      address: method.address || "",
    });
    setShowAddPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex px-2 md:px-6 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex md:hidden items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:block">Back to Dashboard</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="card">
            <div className="card-body p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          activeTab === tab.id
                            ? "text-primary-600"
                            : "text-gray-400"
                        }`}
                      />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="card">
            <div className="card-body p-3 md:p-6">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Information */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-2"
                  >
                    <div className="card ">
                      <div className="card-header">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Personal Information
                              </h3>
                              <p className="text-sm text-gray-600">
                                Update your account details
                              </p>
                            </div>
                          </div>
                          {!isEditing ? (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="btn-secondary px-4 py-2 text-sm"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="btn-success px-4 py-2 text-sm disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="btn-secondary px-4 py-2 text-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-body space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                              {previewUrl ||
                              (profilePicture &&
                                typeof profilePicture === "string") ? (
                                <img
                                  src={
                                    previewUrl ||
                                    (typeof profilePicture === "string"
                                      ? profilePicture
                                      : "")
                                  }
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-bold text-white">
                                  {(userProfile?.name || user?.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Upload overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {userProfile?.name || user?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {userPlan?.name || "Investment Plan"}
                            </p>

                            <div className="flex items-center space-x-3 mt-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                              />

                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                {previewUrl ? "Change Photo" : "Upload Photo"}
                              </button>

                              {(previewUrl || profilePicture) && (
                                <button
                                  onClick={handleRemovePicture}
                                  disabled={isUploading}
                                  className="text-sm text-red-600 hover:text-red-700 flex items-center disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </button>
                              )}
                            </div>

                            {/* Upload/Remove buttons */}
                            {previewUrl && (
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={handleUploadPicture}
                                  disabled={isUploading}
                                  className="btn-primary px-3 py-1 text-xs disabled:opacity-50"
                                >
                                  {isUploading ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Save
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setPreviewUrl(null);
                                    setProfilePicture(
                                      userProfile?.profilePicture || null
                                    );
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = "";
                                    }
                                  }}
                                  className="btn-secondary px-3 py-1 text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="form-label">Display Name</label>
                            {isEditing ? (
                              <input
                                name="name"
                                type="text"
                                className="input-field p-2"
                                value={editData.name}
                                onChange={handleEditChange}
                              />
                            ) : (
                              <div className="form-input py-2 px-1 flex items-center">
                                <User className="w-4 h-4 text-gray-50  mr-3" />
                                {userProfile?.name || "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Phone Number</label>
                            {isEditing ? (
                              <input
                                name="phone"
                                type="tel"
                                className="input-field p-2"
                                value={editData.phone}
                                onChange={handleEditChange}
                                placeholder="Enter your phone number"
                              />
                            ) : (
                              <ClickToCopy
                                text={userProfile?.phone || ""}
                                className="form-input py-2 px-1 bg-gray-50 flex items-center"
                              >
                                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                <span>
                                  {userProfile?.phone || "Not provided"}
                                </span>
                              </ClickToCopy>
                            )}
                          </div>

                          <div>
                            <label className="form-label ">Email Address</label>
                            <div
                              text={user?.email || ""}
                              className="form-input py-2 px-1 bg-gray-50 flex items-center"
                            >
                              <Mail className="w-4 h-4 text-gray-400 mr-3" />
                              <span>{user?.email || "Not provided"}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Email cannot be changed
                            </p>
                          </div>

                          <div>
                            <label className="form-label">Member Since</label>
                            <div className="form-input bg-gray-50 flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                              {joinDate}
                            </div>
                          </div>

                          <div>
                            <label className="form-label">Account Status</label>
                            <div className="form-input  bg-gray-50 flex items-center">
                              <Shield className="w-4 h-4  text-success-500 mr-3" />
                              <span className="text-success-600 py-1 font-medium">
                                {userProfile?.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="form-label">Account Number</label>
                            <div className="form-input bg-gray-50 flex items-center justify-between">
                              <div className="flex items-center">
                                <Hash className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.accountNumber ? (
                                  <span className="font-mono text-lg font-semibold">
                                    {userProfile.accountNumber}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 italic">
                                    Not assigned
                                  </span>
                                )}
                              </div>
                              {userProfile?.accountNumber ? (
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      userProfile.accountNumber
                                    )
                                  }
                                  className="text-primary-600 hover:text-primary-700 text-sm ml-2"
                                  title="Copy account number"
                                >
                                  Copy
                                </button>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  Contact support
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Personal Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="form-label">First Name</label>
                            {isEditing ? (
                              <input
                                name="firstName"
                                type="text"
                                className="input-field p-2"
                                value={editData.firstName}
                                onChange={handleEditChange}
                                placeholder="Enter your first name"
                              />
                            ) : (
                              <div className="form-input py-2 px-1 bg-gray-50 flex items-center">
                                <User className="w-4 h-4  text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.firstName ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Last Name</label>
                            {isEditing ? (
                              <input
                                name="lastName"
                                type="text"
                                className="input-field p-2"
                                value={editData.lastName}
                                onChange={handleEditChange}
                                placeholder="Enter your last name"
                              />
                            ) : (
                              <div className="form-input py-2 px-1 bg-gray-50 flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.lastName ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Date of Birth</label>
                            {isEditing ? (
                              <input
                                name="dateOfBirth"
                                type="date"
                                className="input-field p-2"
                                value={editData.dateOfBirth}
                                onChange={handleEditChange}
                              />
                            ) : (
                              <div className="form-input py-2 px-1 bg-gray-50 flex items-center">
                                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.dateOfBirth ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Occupation</label>
                            {isEditing ? (
                              <input
                                name="occupation"
                                type="text"
                                className="input-field p-2"
                                value={editData.occupation}
                                onChange={handleEditChange}
                                placeholder="Enter your occupation"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.occupation ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Annual Income</label>
                            {isEditing ? (
                              <input
                                name="annualIncome"
                                type="number"
                                className="input-field p-2"
                                value={editData.annualIncome}
                                onChange={handleEditChange}
                                placeholder="Enter your annual income"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.annualIncome
                                  ? formatCurrency(
                                      userProfile.personalInfo.annualIncome
                                    )
                                  : "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Address</label>
                            {isEditing ? (
                              <input
                                name="address"
                                type="text"
                                className="input-field p-2"
                                value={editData.address}
                                onChange={handleEditChange}
                                placeholder="Enter your address"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.address ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">City</label>
                            {isEditing ? (
                              <input
                                name="city"
                                type="text"
                                className="input-field p-2"
                                value={editData.city}
                                onChange={handleEditChange}
                                placeholder="Enter your city"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.city ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">State</label>
                            {isEditing ? (
                              <input
                                name="state"
                                type="text"
                                className="input-field p-2"
                                value={editData.state}
                                onChange={handleEditChange}
                                placeholder="Enter your state"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.state ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">ZIP Code</label>
                            {isEditing ? (
                              <input
                                name="zipCode"
                                type="text"
                                className="input-field p-2"
                                value={editData.zipCode}
                                onChange={handleEditChange}
                                placeholder="Enter your ZIP code"
                              />
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <Hash className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.zipCode ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Country</label>
                            {isEditing ? (
                              <select
                                name="country"
                                className="input-field p-2"
                                value={editData.country}
                                onChange={handleEditChange}
                              >
                                <option value="">Select country</option>
                                <option value="US">United States</option>
                                <option value="CA">Canada</option>
                                <option value="UK">United Kingdom</option>
                                <option value="AU">Australia</option>
                                <option value="DE">Germany</option>
                                <option value="FR">France</option>
                                <option value="IT">Italy</option>
                                <option value="ES">Spain</option>
                                <option value="NL">Netherlands</option>
                                <option value="SE">Sweden</option>
                                <option value="NO">Norway</option>
                                <option value="DK">Denmark</option>
                                <option value="FI">Finland</option>
                                <option value="CH">Switzerland</option>
                                <option value="AT">Austria</option>
                                <option value="BE">Belgium</option>
                                <option value="IE">Ireland</option>
                                <option value="PT">Portugal</option>
                                <option value="GR">Greece</option>
                                <option value="LU">Luxembourg</option>
                                <option value="MT">Malta</option>
                                <option value="CY">Cyprus</option>
                                <option value="EE">Estonia</option>
                                <option value="LV">Latvia</option>
                                <option value="LT">Lithuania</option>
                                <option value="PL">Poland</option>
                                <option value="CZ">Czech Republic</option>
                                <option value="SK">Slovakia</option>
                                <option value="SI">Slovenia</option>
                                <option value="HU">Hungary</option>
                                <option value="RO">Romania</option>
                                <option value="BG">Bulgaria</option>
                                <option value="HR">Croatia</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.country ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">
                              Social Security Number
                            </label>
                            {isEditing ? (
                              <div className="relative ">
                                <input
                                  name="ssn"
                                  type={showSSN ? "text" : "password"}
                                  className="form-input pr-10 "
                                  value={editData.ssn}
                                  onChange={handleEditChange}
                                  placeholder="XXX-XX-XXXX"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSSN(!showSSN)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showSSN ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <Shield className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.ssn
                                  ? "•••-••-••••"
                                  : "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">ID Type</label>
                            {isEditing ? (
                              <select
                                name="idType"
                                className="input-field p-2"
                                value={editData.idType}
                                onChange={handleEditChange}
                              >
                                <option value="">Select ID type</option>
                                <option value="drivers-license">
                                  Driver's License
                                </option>
                                <option value="passport">Passport</option>
                                <option value="state-id">State ID</option>
                                <option value="national-id">National ID</option>
                              </select>
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.personalInfo?.idType ||
                                  "Not provided"}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="form-label">Secret Phrase</label>
                            {isEditing ? (
                              <div className="relative y65u65ttttttttttttttt">
                                <input
                                  name="secretPhrase"
                                  type={showSecretPhrase ? "text" : "password"}
                                  className="form-input pr-10"
                                  value={editData.secretPhrase}
                                  onChange={handleEditChange}
                                  placeholder="Enter your secret phrase"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowSecretPhrase(!showSecretPhrase)
                                  }
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showSecretPhrase ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="form-input bg-gray-50 flex items-center">
                                <Key className="w-4 h-4 text-gray-400 mr-3" />
                                {userProfile?.secretPhrase
                                  ? "••••••"
                                  : "Not provided"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Investment Plan & Stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Current Plan */}
                    <div className="card">
                      <div className="card-header">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-success-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Investment Plan
                            </h3>
                            <p className="text-sm text-gray-600">
                              Current subscription
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        {userPlan ? (
                          <div>
                            <div className="text-center mb-4">
                              <h4 className="text-xl font-bold text-gray-900">
                                {userPlan.name}
                              </h4>
                              <div className="text-3xl font-bold text-primary-600 mt-2">
                                {userPlan.interestRate}%
                              </div>
                              <p className="text-sm text-gray-600">
                                Annual Interest Rate
                              </p>
                            </div>
                            <div className="space-y-3">
                              {userPlan.features.map(
                                (feature: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center text-sm text-gray-600"
                                  >
                                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-3"></div>
                                    {feature}
                                  </div>
                                )
                              )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-center">
                                <button className="btn-primary w-full py-2 text-sm">
                                  Upgrade Plan
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-center">
                            No plan selected
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Portfolio Summary
                        </h3>
                      </div>
                      <div className="card-body space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">
                            Total Invested
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(totalInvested)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">
                            Active Investments
                          </span>
                          <span className="font-semibold text-gray-900">
                            {activeInvestments}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600">
                            Account Type
                          </span>
                          <span className="font-semibold text-primary-600">
                            {userPlan?.name || "Standard"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Notification Preferences
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Email Notifications
                          </h4>
                          <p className="text-sm text-gray-600">
                            Receive notifications via email
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={(e) =>
                              handleNotificationChange(
                                "email",
                                e.target.checked
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Push Notifications
                          </h4>
                          <p className="text-sm text-gray-600">
                            Receive push notifications in browser
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) =>
                              handleNotificationChange("push", e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            SMS Notifications
                          </h4>
                          <p className="text-sm text-gray-600">
                            Receive notifications via SMS
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={(e) =>
                              handleNotificationChange("sms", e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Add an extra layer of security to your account
                        </p>
                        <button className="btn-secondary px-4 py-2">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Change Password
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Update your account password
                        </p>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="btn-secondary px-4 py-2"
                        >
                          Change Password
                        </button>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Login History
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          View your recent login activity
                        </p>
                        <button
                          onClick={() => setShowLoginHistoryModal(true)}
                          className="btn-secondary px-4 py-2"
                        >
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {activeTab === "payment" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className=" text-base md:text-lg font-semibold text-gray-900">
                        Payment Methods
                      </h3>
                      <button
                        onClick={() => {
                          setEditingPayment(null);
                          setNewPaymentMethod({
                            type: "paypal",
                            name: "",
                            email: "",
                            username: "",
                            phoneNumber: "",
                            address: "",
                          });
                          setShowAddPaymentModal(true);
                        }}
                        className="btn-primary px-4 py-2 text-sm md:text-base"
                      >
                        <Plus className="w-4 h-4  md:mr-2 " />
                        Add Payment Method
                      </button>
                    </div>

                    {/* Verification Notice */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            Verification Required
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Payment method details must match your account
                            information exactly. All payment methods will be
                            pending verification before they can be approved for
                            withdrawals. Please ensure all information is
                            accurate and up-to-date.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.$id}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {method.name}
                                </h4>
                                <ClickToCopy
                                  text={method.accountNumber}
                                  copyMessage="Account number copied to clipboard!"
                                >
                                  <p className="text-sm text-gray-600">
                                    {method.accountNumber}
                                  </p>
                                </ClickToCopy>
                                {method.email && (
                                  <ClickToCopy
                                    text={method.email}
                                    copyMessage="Email copied to clipboard!"
                                  >
                                    <p className="text-sm text-gray-500">
                                      {method.email}
                                    </p>
                                  </ClickToCopy>
                                )}
                                <div className="flex items-center space-x-2 mt-1">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      method.status === "verified"
                                        ? "bg-green-100 text-green-800"
                                        : method.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {method.status === "verified"
                                      ? "Verified"
                                      : method.status === "rejected"
                                      ? "Rejected"
                                      : "Pending"}
                                  </span>
                                  {method.isDefault && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!method.isDefault && (
                                <button
                                  onClick={() =>
                                    handleSetDefaultPayment(method.$id)
                                  }
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  Set as Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEditPaymentMethod(method)}
                                className="p-2 text-gray-400 hover:text-gray-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePaymentMethod(method.$id)
                                }
                                className="p-2 text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {paymentMethods.length === 0 && (
                        <div className="text-center py-12">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No payment methods
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Add a payment method to enable withdrawals
                          </p>
                          <button
                            onClick={() => setShowAddPaymentModal(true)}
                            className="btn-primary px-4 py-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Method
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {/* Referrals */}
              {activeTab === "referrals" && <UserReferralPanel />}

              {/* Preferences */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Preferences
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Dark Mode
                          </h4>
                          <p className="text-sm text-gray-600">
                            Switch to dark theme
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDarkMode}
                            onChange={(e) =>
                              handleDarkModeToggle(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Show Balance
                          </h4>
                          <p className="text-sm text-gray-600">
                            Display account balance in dashboard
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showBalance}
                            onChange={(e) =>
                              handleShowBalanceToggle(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Currency
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Select your preferred currency
                        </p>
                        <select
                          className="form-input max-w-xs"
                          value={preferredCurrency}
                          onChange={(e) => handleCurrencyChange(e.target.value)}
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                          <option value="CHF">CHF - Swiss Franc</option>
                          <option value="CNY">CNY - Chinese Yuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={changePassword}
      />

      {/* Login History Modal */}
      <LoginHistoryModal
        isOpen={showLoginHistoryModal}
        onClose={() => setShowLoginHistoryModal(false)}
        onGetLoginHistory={getLoginHistory}
        onTerminateSession={terminateSession}
        onTerminateAllOtherSessions={terminateAllOtherSessions}
      />

      {/* Add/Edit Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPayment ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Verification Notice in Modal */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Shield className="w-4 h-4 text-amber-600 mt-0.5" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-amber-800">
                      <strong>Important:</strong> Payment details must match
                      your account information. All methods require verification
                      before approval.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Payment Type</label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) =>
                    setNewPaymentMethod((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="form-input"
                >
                  <option value="">Select Payment Method Type</option>
                  {paymentMethodTypes
                    .filter((type) => type.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((type) => (
                      <option key={type.$id} value={type.type}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>

              {newPaymentMethod.type === "paypal" && (
                <>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={newPaymentMethod.email}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter PayPal email address"
                    />
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={newPaymentMethod.username}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter PayPal username"
                    />
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="form-label ">Phone Number</label>
                    <input
                      type="tel"
                      value={newPaymentMethod.phoneNumber}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="form-input "
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}

              {newPaymentMethod.type === "venmo" && (
                <>
                  <div>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={newPaymentMethod.username}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter Venmo username (without @)"
                    />
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={newPaymentMethod.email}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={newPaymentMethod.phoneNumber}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}

              {newPaymentMethod.type === "cashapp" && (
                <>
                  <div>
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={newPaymentMethod.username}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter Cash App username (without $)"
                    />
                  </div>
                  <div className="text-center text-gray-500 text-sm">OR</div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={newPaymentMethod.phoneNumber}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                </>
              )}

              {(newPaymentMethod.type === "usdt" ||
                newPaymentMethod.type === "ethereum" ||
                newPaymentMethod.type === "bitcoin") && (
                <div>
                  <label className="form-label">
                    {newPaymentMethod.type === "usdt"
                      ? "USDT Address"
                      : newPaymentMethod.type === "ethereum"
                      ? "Ethereum Address"
                      : "Bitcoin Address"}
                  </label>
                  <input
                    type="text"
                    value={newPaymentMethod.address}
                    onChange={(e) =>
                      setNewPaymentMethod((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="form-input"
                    placeholder={`Enter ${newPaymentMethod.type} address`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure to use the correct network for{" "}
                    {newPaymentMethod.type.toUpperCase()}.
                    <span className="text-amber-600 font-medium">
                      {" "}
                      This address must be under your control and match your
                      account verification.
                    </span>
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddPaymentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="btn-primary flex-1"
                >
                  {editingPayment ? "Update" : "Add"} Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ClickToCopy from "../components/ClickToCopy";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Hash,
  TrendingUp,
  Settings,
  Bell,
  Lock,
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
  Eye,
  EyeOff,
  Monitor,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../lib/appwrite";
import {
  checkProfileCompletion,
  getVerificationStatus,
} from "../lib/verification";
import LoadingSpinner from "../components/LoadingSpinner";
import VerificationBadge from "../components/VerificationBadge";
import PasswordChangeModal from "../components/PasswordChangeModal";
import LoginHistoryModal from "../components/LoginHistoryModal";
import IDDocumentUpload from "../components/IDDocumentUpload";
import IDDocumentUploadFallback from "../components/IDDocumentUploadFallback";

const Profile = () => {
  const {
    user,
    userProfile,
    investments,
    updateUserProfile,
    changePassword,
    getLoginHistory,
    terminateSession,
    terminateAllOtherSessions,
    resendVerificationEmail,
  } = useAuth();
  const navigate = useNavigate();
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
  const [documents, setDocuments] = useState({
    front: undefined as { id: string; name: string } | undefined,
    back: undefined as { id: string; name: string } | undefined,
    dataPage: undefined as { id: string; name: string } | undefined,
  });
  const [useStorageFallback] = useState(true); // Set to true to use fallback
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef(null);
  const [showSSN, setShowSSN] = useState(false);
  const [showSecretPhrase, setShowSecretPhrase] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDocumentUpload = (
    fileId: string,
    fileName: string,
    documentSide: string
  ) => {
    setDocuments((prev) => ({
      ...prev,
      [documentSide]: { id: fileId, name: fileName },
    }));
  };

  const handleDocumentRemove = (documentSide: string) => {
    setDocuments((prev) => ({
      ...prev,
      [documentSide]: undefined,
    }));
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
        documents: {
          front: documents.front,
          back: documents.back,
          dataPage: documents.dataPage,
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

  const handleResendVerificationEmail = async () => {
    setIsResendingEmail(true);
    try {
      await resendVerificationEmail();
    } catch (error) {
      console.error("Error resending verification email:", error);
    } finally {
      setIsResendingEmail(false);
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
          (fileInputRef.current as HTMLInputElement).value = "";
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
          (fileInputRef.current as HTMLInputElement).value = "";
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
  // Since investmentPlan is not stored in user profile, we'll show a default or calculate from investments
  const userPlan: any = null; // Could be calculated from user's investments if needed

  // Calculate portfolio stats
  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv.status === "active" ? inv.amount : 0),
    0
  );
  const activeInvestments = investments.filter(
    (inv) => inv.status === "active"
  ).length;
  const joinDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US")
    : "N/A";
  const profileCompletion = checkProfileCompletion(userProfile);

  return (
    <div className="space-y-3 px-2 md:px-6 md:py-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=""
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-50">
                Profile Settings
              </h1>
              <VerificationBadge
                status={getVerificationStatus(userProfile)}
                size="xs"
              />
            </div>
            <p className="text-gray-600 mt-1">
              Manage your account information and preferences
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

      {/* Profile Completion Status */}
      {!profileCompletion.isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card border-yellow-200 bg-yellow-50"
        >
          <div className="card-body p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Complete Your Profile for Verification
                </h3>
                <p className="text-yellow-700 mb-4">
                  Your profile is {profileCompletion.completionPercentage}%
                  complete. Please complete all required fields to enable
                  withdrawals and get verified.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-800">
                    Missing fields:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileCompletion.missingFields.map((field, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card">
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
                    (profilePicture && typeof profilePicture === "string") ? (
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
                      onClick={() =>
                        (
                          fileInputRef.current as unknown as HTMLInputElement
                        )?.click()
                      }
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
                            (fileInputRef.current as HTMLInputElement).value =
                              "";
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
                  <label className="form-label">Full Name</label>
                  {isEditing ? (
                    <input
                      name="name"
                      type="text"
                      className="input-field  border-red-500 p-2"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <div className="form-input bg-gray-700   flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
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
                      className="form-input bg-gray-700 flex items-center"
                    >
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span>{userProfile?.phone || "Not provided"}</span>
                    </ClickToCopy>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <ClickToCopy
                    text={user?.email || ""}
                    className="form-input bg-gray-700  flex items-center"
                  >
                    <Mail className="w-4 h-4  text-gray-400 mr-3" />
                    <span>{user?.email || "Not provided"}</span>
                  </ClickToCopy>
                  <p className="text-xs  text-red-500 mt-1 ">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="form-label">Member Since</label>
                  <div className="form-input bg-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    {joinDate}
                  </div>
                </div>

                <div>
                  <label className="form-label">Account Status</label>
                  <div className="form-input bg-gray-700 flex items-center">
                    <Shield className="w-4 h-4 text-success-500 mr-3" />
                    <span className="text-success-600 font-medium">
                      {userProfile?.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Account Number</label>
                  <div className="form-input bg-gray-700 flex items-center justify-between">
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

                {/* Email Verification Status */}
                <div>
                  <label className="form-label">Email Verification</label>
                  <div className="form-input bg-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm">
                        {userProfile?.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </span>
                    </div>
                    {!userProfile?.isVerified && (
                      <button
                        onClick={handleResendVerificationEmail}
                        disabled={isResendingEmail}
                        className="text-primary-600 hover:text-primary-700 text-sm disabled:opacity-50"
                      >
                        {isResendingEmail ? "Sending..." : "Resend Email"}
                      </button>
                    )}
                  </div>
                  {!userProfile?.isVerified && (
                    <p className="text-xs text-gray-500 mt-1">
                      Please check your email and click the verification link to
                      activate your account.
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label">Secret Phrase</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        name="secretPhrase"
                        type={showSecretPhrase ? "text" : "password"}
                        className="input-field pr-10 p-2"
                        value={editData.secretPhrase}
                        onChange={handleEditChange}
                        placeholder="Enter your secret phrase"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretPhrase(!showSecretPhrase)}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <Key className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.secretPhrase ? "••••••" : "Not provided"}
                    </div>
                  )}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.firstName || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.lastName || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.dateOfBirth || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.occupation || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.annualIncome
                        ? formatCurrency(userProfile.personalInfo.annualIncome)
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.address || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.city || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.state || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <Hash className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.zipCode || "Not provided"}
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
                    <div className="form-input bg-gray-700 flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.country || "Not provided"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Social Security Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        name="ssn"
                        type={showSSN ? "text" : "password"}
                        className="input-field pr-10 p-2"
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
                    <div className="form-input bg-gray-700 flex items-center">
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
                      <option value="drivers-license">Driver's License</option>
                      <option value="passport">Passport</option>
                      <option value="state-id">State ID</option>
                      <option value="national-id">National ID</option>
                    </select>
                  ) : (
                    <div className="form-input bg-gray-700 flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.personalInfo?.idType || "Not provided"}
                    </div>
                  )}
                </div>

                {/* Document Upload Section */}
                {isEditing && editData.idType && (
                  <div className="col-span-2">
                    <label className="form-label">Upload ID Documents</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Identity Verification
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Please upload clear, high-quality images of your{" "}
                            {editData.idType.replace("-", " ")}. All documents
                            will be securely stored and used for verification
                            purposes only.
                          </p>
                        </div>
                      </div>
                    </div>

                    {useStorageFallback ? (
                      <IDDocumentUploadFallback
                        idType={
                          editData.idType as
                            | "drivers-license"
                            | "passport"
                            | "state-id"
                            | "national-id"
                        }
                        onUpload={handleDocumentUpload}
                        onRemove={handleDocumentRemove}
                        currentFiles={documents}
                      />
                    ) : (
                      <IDDocumentUpload
                        idType={
                          editData.idType as
                            | "drivers-license"
                            | "passport"
                            | "state-id"
                            | "national-id"
                        }
                        userId={user?.$id || ""}
                        onUpload={handleDocumentUpload}
                        onRemove={handleDocumentRemove}
                        currentFiles={documents}
                      />
                    )}
                  </div>
                )}

                
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
                  <p className="text-sm text-gray-600">Current subscription</p>
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
                    {userPlan.features.map((feature: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
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
                <p className="text-gray-600 text-center">No plan selected</p>
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
                <span className="text-sm text-gray-600">Total Invested</span>
                <span className="font-semibold text-gray-500">
                  {formatCurrency(totalInvested)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">
                  Active Investments
                </span>
                <span className="font-semibold text-gray-500">
                  {activeInvestments}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="font-semibold text-primary-600">
                  {userPlan?.name || "Standard"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Security
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your account security
                </p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">
                  Change Password
                </span>
              </div>
              <span className="text-sm text-gray-400">Update</span>
            </button>

            <button
              onClick={() => setShowLoginHistoryModal(true)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">
                  Login History
                </span>
              </div>
              <span className="text-sm text-gray-400">View</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">
                  Two-Factor Authentication
                </span>
              </div>
              <span className="text-sm text-success-600">Enabled</span>
            </button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600">
                  Manage your notification preferences
                </p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Email Notifications
                </span>
                <p className="text-xs text-gray-600">
                  Receive investment updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  SMS Notifications
                </span>
                <p className="text-xs text-gray-500">Receive alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Push Notifications
                </span>
                <p className="text-xs text-gray-600">
                  Receive browser notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="card border-danger-200"
      >
        <div className="card-header border-danger-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-danger-900">
                Danger Zone
              </h3>
              <p className="text-sm text-danger-600">
                Irreversible and destructive actions
              </p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Delete Account
              </h4>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="btn-danger px-4 py-2 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

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
    </div>
  );
};

export default Profile;

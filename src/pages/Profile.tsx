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
  <div className="min-h-screen bg-[#0b1120] text-white px-4 md:px-8 py-8">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* PROFILE HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          {/* LEFT */}
          <div className="flex items-center gap-6 flex-wrap">

            {/* PROFILE IMAGE */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl flex items-center justify-center">

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
                  <span className="text-3xl font-bold text-white">
                    {(userProfile?.name || user?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <button
                onClick={() =>
                  (
                    fileInputRef.current as unknown as HTMLInputElement
                  )?.click()
                }
                className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-xl transition-all"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* USER INFO */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {userProfile?.name || user?.name}
                </h1>

                <VerificationBadge
                  status={getVerificationStatus(userProfile)}
                  size="xs"
                />
              </div>

              <p className="text-gray-400 mt-2">
                {user?.email}
              </p>

              <div className="flex flex-wrap gap-3 mt-4">

                <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {userProfile?.status === "active"
                    ? "Active Account"
                    : "Inactive"}
                </div>

                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                  Member Since {joinDate}
                </div>

              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 flex-wrap">

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-medium transition-all"
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </>
            )}

          </div>
        </div>
      </motion.div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.8fr] gap-8">

        {/* LEFT CONTENT */}
        <div className="space-y-8">

          {/* ACCOUNT INFORMATION */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8">

            <h2 className="text-2xl font-semibold mb-6">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DISPLAY NAME */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Display Name
                </label>

                {isEditing ? (
                  <input
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3 outline-none"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.name || "Not provided"}
                  </div>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email Address
                </label>

                <div className="bg-[#1f2937] rounded-2xl px-4 py-3 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user?.email || "Not provided"}
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Phone Number
                </label>

                {isEditing ? (
                  <input
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3 outline-none"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.phone || "Not provided"}
                  </div>
                )}
              </div>

              {/* ACCOUNT NUMBER */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Account Number
                </label>

                <div className="bg-[#1f2937] rounded-2xl px-4 py-3 flex items-center justify-between">

                  <span className="font-mono">
                    {userProfile?.accountNumber || "Not Assigned"}
                  </span>

                  {userProfile?.accountNumber && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          userProfile.accountNumber
                        )
                      }
                      className="text-blue-400 text-sm hover:text-blue-300"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8">

            <h2 className="text-2xl font-semibold mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FIRST NAME */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  First Name
                </label>

                {isEditing ? (
                  <input
                    name="firstName"
                    value={editData.firstName}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.firstName ||
                      "Not provided"}
                  </div>
                )}
              </div>

              {/* LAST NAME */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Last Name
                </label>

                {isEditing ? (
                  <input
                    name="lastName"
                    value={editData.lastName}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.lastName ||
                      "Not provided"}
                  </div>
                )}
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Date of Birth
                </label>

                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editData.dateOfBirth}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.dateOfBirth ||
                      "Not provided"}
                  </div>
                )}
              </div>

              {/* OCCUPATION */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Occupation
                </label>

                {isEditing ? (
                  <input
                    name="occupation"
                    value={editData.occupation}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.occupation ||
                      "Not provided"}
                  </div>
                )}
              </div>

              {/* CITY */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  City
                </label>

                {isEditing ? (
                  <input
                    name="city"
                    value={editData.city}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.city ||
                      "Not provided"}
                  </div>
                )}
              </div>

              {/* COUNTRY */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Country
                </label>

                {isEditing ? (
                  <input
                    name="country"
                    value={editData.country}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.country ||
                      "Not provided"}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6 md:p-8">

            <h2 className="text-2xl font-semibold mb-6">
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Address
                </label>

                {isEditing ? (
                  <input
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.address ||
                      "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  State
                </label>

                {isEditing ? (
                  <input
                    name="state"
                    value={editData.state}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.state ||
                      "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ZIP Code
                </label>

                {isEditing ? (
                  <input
                    name="zipCode"
                    value={editData.zipCode}
                    onChange={handleEditChange}
                    className="w-full bg-[#1f2937] border border-white/10 rounded-2xl px-4 py-3"
                  />
                ) : (
                  <div className="bg-[#1f2937] rounded-2xl px-4 py-3">
                    {userProfile?.personalInfo?.zipCode ||
                      "Not provided"}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-8">

          {/* PORTFOLIO */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Portfolio Summary
            </h2>

            <div className="space-y-4">

              <div className="bg-[#1f2937] rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Total Invested
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {formatCurrency(totalInvested)}
                </h3>
              </div>

              <div className="bg-[#1f2937] rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Active Investments
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {activeInvestments}
                </h3>
              </div>

            </div>
          </div>

          {/* SECURITY */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">

            <h2 className="text-2xl font-semibold mb-6">
              Security
            </h2>

            <div className="space-y-4">

              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-[#1f2937] hover:bg-[#243244] rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  Change Password
                </div>
              </button>

              <button
                onClick={() => setShowLoginHistoryModal(true)}
                className="w-full bg-[#1f2937] hover:bg-[#243244] rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  Login History
                </div>
              </button>

            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-3xl p-6">

            <h2 className="text-xl font-semibold text-red-400">
              Danger Zone
            </h2>

            <p className="text-red-300/70 text-sm mt-2">
              Permanently delete your account and all associated data.
            </p>

            <button className="mt-6 w-full bg-red-600 hover:bg-red-700 py-3 rounded-2xl transition-all">
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onChangePassword={changePassword}
      />

      <LoginHistoryModal
        isOpen={showLoginHistoryModal}
        onClose={() => setShowLoginHistoryModal(false)}
        onGetLoginHistory={getLoginHistory}
        onTerminateSession={terminateSession}
        onTerminateAllOtherSessions={terminateAllOtherSessions}
      />

    </div>
  </div>
)

};

export default Profile;

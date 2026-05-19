import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../lib/appwrite";
import LoadingSpinner from "../components/LoadingSpinner";
import PasswordChangeModal from "../components/PasswordChangeModal";
import LoginHistoryModal from "../components/LoginHistoryModal";
import UserReferralPanel from "../components/UserReferralPanel";

/* ─────────────────────────────────────────────
   Inline styles / design tokens
───────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a14 0%, #111128 50%, #0d0d1f 100%)",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: "#e2e2f0",
    padding: "2rem 1.5rem",
  },
  glassCard: {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    overflow: "hidden",
  },
  glassCardActive: {
    background: "rgba(139,92,246,0.12)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(139,92,246,0.35)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  accentGradient: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  },
  accentGradientText: {
    background: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "10px 14px",
    color: "#e2e2f0",
    fontSize: "0.875rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  },
  select: {
    width: "100%",
    background: "rgba(20,20,40,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "10px 14px",
    color: "#e2e2f0",
    fontSize: "0.875rem",
    outline: "none",
    cursor: "pointer",
  },
  label: {
    fontSize: "0.72rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#9090b0",
    marginBottom: "6px",
    display: "block",
  },
  fieldDisplay: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.875rem",
    color: "#c4c4dc",
    minHeight: "42px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "opacity 0.2s, transform 0.15s",
    letterSpacing: "0.02em",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "10px 20px",
    color: "#c4c4dc",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s",
    letterSpacing: "0.02em",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "opacity 0.2s",
  },
  btnDanger: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "#f87171",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "20px 0",
  },
};

/* Toggle Switch */
const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: "52px",
      height: "28px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: "background 0.3s",
      background: checked
        ? "linear-gradient(135deg, #8b5cf6, #ec4899)"
        : "rgba(255,255,255,0.12)",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        position: "absolute",
        top: "3px",
        left: checked ? "27px" : "3px",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.3s",
        boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}
    />
  </button>
);

/* Badge */
const Badge = ({
  status,
}: {
  status: "verified" | "rejected" | "pending" | string;
}) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    verified: { bg: "rgba(16,185,129,0.15)", color: "#34d399", label: "Verified" },
    rejected: { bg: "rgba(239,68,68,0.15)", color: "#f87171", label: "Rejected" },
    pending: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", label: "Pending" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: "8px",
        padding: "3px 10px",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
};

/* Section Header */
const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "28px",
      gap: "12px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25))",
          border: "1px solid rgba(139,92,246,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: "#a78bfa" }} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#f0f0fa" }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#7070a0" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
);

/* Settings Row (toggle/preference row) */
const SettingsRow = ({
  icon: Icon,
  title,
  description,
  right,
}: {
  icon?: any;
  title: string;
  description: string;
  right: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 20px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      gap: "16px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
      {Icon && (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(139,92,246,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={16} style={{ color: "#a78bfa" }} />
        </div>
      )}
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e2e2f0" }}>{title}</div>
        <div style={{ fontSize: "0.78rem", color: "#7070a0", marginTop: "2px" }}>{description}</div>
      </div>
    </div>
    {right}
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
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
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

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
    userProfile?.profilePicture || localStorage.getItem(`profilePicture_${user?.$id}`) || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSSN, setShowSSN] = useState(false);
  const [showSecretPhrase, setShowSecretPhrase] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<any[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "paypal", name: "", email: "", username: "", phoneNumber: "", address: "",
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "payment") setActiveTab("payment");
    fetchPaymentMethodTypes();
  }, [searchParams]);

  const fetchPaymentMethodTypes = async () => {
    try { setPaymentMethodTypes(await getPaymentMethodTypes()); } catch {}
  };

  useEffect(() => {
    if (userProfile?.preferences) {
      const p = userProfile.preferences;
      if (p.darkMode !== undefined) setIsDarkMode(p.darkMode);
      if (p.currency) setPreferredCurrency(p.currency);
      if (p.showBalance !== undefined) setShowBalance(p.showBalance);
    }
  }, [userProfile]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: editData.name, phone: editData.phone,
        personalInfo: {
          firstName: editData.firstName, lastName: editData.lastName,
          dateOfBirth: editData.dateOfBirth, address: editData.address,
          city: editData.city, state: editData.state, zipCode: editData.zipCode,
          country: editData.country, occupation: editData.occupation,
          annualIncome: editData.annualIncome ? Number(editData.annualIncome) : undefined,
          ssn: editData.ssn, idType: editData.idType,
        },
        secretPhrase: editData.secretPhrase,
      });
      if (result.success) setIsEditing(false);
    } finally { setIsLoading(false); }
  };

  const handleCancel = () => {
    setEditData({
      name: userProfile?.name || "", phone: userProfile?.phone || "",
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    setPreviewUrl(URL.createObjectURL(file));
    setProfilePicture(file);
  };

  const handleUploadPicture = async () => {
    if (!profilePicture) return;
    setIsUploading(true);
    try {
      const base64 = await convertToBase64(profilePicture as unknown as File);
      const result = await updateUserProfile({ profilePicture: base64 as string });
      if (result.success) { setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
    } catch { alert("Failed to upload profile picture"); }
    finally { setIsUploading(false); }
  };

  const handleRemovePicture = async () => {
    setIsUploading(true);
    try {
      const result = await updateUserProfile({ profilePicture: null });
      if (result.success) { setProfilePicture(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
    } catch { alert("Failed to remove profile picture"); }
    finally { setIsUploading(false); }
  };

  const convertToBase64 = (file: File) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.readAsDataURL(file);
      r.onload = () => res(r.result);
      r.onerror = rej;
    });

  const userPlan: any = null;
  const totalInvested = investments?.reduce((s, i) => s + (i.status === "active" ? i.amount : 0), 0) || 0;
  const activeInvestments = investments?.filter((i) => i.status === "active").length || 0;
  const joinDate = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString("en-US") : "N/A";

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "referrals", name: "Referrals", icon: Users },
    { id: "preferences", name: "Preferences", icon: Globe },
  ];

  const handleAddPaymentMethod = async () => {
    let displayName = "", displayAccount = "", isValid = false;
    switch (newPaymentMethod.type) {
      case "paypal":
        if (newPaymentMethod.email || newPaymentMethod.username || newPaymentMethod.phoneNumber) {
          displayName = "PayPal";
          displayAccount = newPaymentMethod.email || newPaymentMethod.username || newPaymentMethod.phoneNumber;
          isValid = true;
        } break;
      case "venmo":
        if (newPaymentMethod.email || newPaymentMethod.username || newPaymentMethod.phoneNumber) {
          displayName = "Venmo";
          displayAccount = newPaymentMethod.username ? `@${newPaymentMethod.username}` : newPaymentMethod.email || newPaymentMethod.phoneNumber;
          isValid = true;
        } break;
      case "cashapp":
        if (newPaymentMethod.username || newPaymentMethod.phoneNumber) {
          displayName = "Cash App";
          displayAccount = newPaymentMethod.username ? `$${newPaymentMethod.username}` : newPaymentMethod.phoneNumber;
          isValid = true;
        } break;
      case "usdt": case "ethereum": case "bitcoin":
        if (newPaymentMethod.address) {
          displayName = newPaymentMethod.type === "usdt" ? "USDT" : newPaymentMethod.type === "ethereum" ? "Ethereum" : "Bitcoin";
          displayAccount = `${newPaymentMethod.address.slice(0, 6)}...${newPaymentMethod.address.slice(-4)}`;
          isValid = true;
        } break;
    }
    if (!isValid) { alert("Please fill in the required information"); return; }
    const data = {
      type: newPaymentMethod.type as any, name: displayName, accountNumber: displayAccount,
      isDefault: paymentMethods.length === 0, status: "pending" as any,
      email: newPaymentMethod.email || "", username: newPaymentMethod.username || "",
      phoneNumber: newPaymentMethod.phoneNumber || "", address: newPaymentMethod.address || "",
    };
    const result = await addPaymentMethod(data);
    if (result.success) {
      setNewPaymentMethod({ type: "paypal", name: "", email: "", username: "", phoneNumber: "", address: "" });
      setShowAddPaymentModal(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (window.confirm("Delete this payment method?")) await deletePaymentMethod(id);
  };

  /* ── Field pair component ── */
  const Field = ({
    label, icon: Icon, editing, name, type = "text", value, display, placeholder, children,
  }: any) => (
    <div>
      <label style={S.label}>{label}</label>
      {editing ? (
        children || (
          <input
            name={name} type={type} value={value}
            onChange={handleEditChange} placeholder={placeholder}
            style={S.input}
            onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
          />
        )
      ) : (
        <div style={S.fieldDisplay}>
          {Icon && <Icon size={15} style={{ color: "#7070a0", flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {display || "Not provided"}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div style={S.root}>
      {/* Ambient background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto" }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <Sparkles size={20} style={{ color: "#a78bfa" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7070a0" }}>
                Account Settings
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, ...S.accentGradientText }}>
              Settings
            </h1>
            <p style={{ margin: "6px 0 0", color: "#6060a0", fontSize: "0.9rem" }}>
              Manage your account, security & preferences
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ ...S.btnSecondary, fontSize: "0.8rem" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            <ArrowLeft size={15} />
            <span style={{ display: "none" }} className="md-show">Dashboard</span>
          </button>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>

          {/* ── Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div style={{ ...S.glassCard, padding: "8px" }}>
              {/* Avatar mini */}
              <div style={{ padding: "16px 12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 800, color: "#fff", overflow: "hidden", flexShrink: 0 }}>
                    {previewUrl || (profilePicture && typeof profilePicture === "string")
                      ? <img src={previewUrl || (typeof profilePicture === "string" ? profilePicture : "")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (userProfile?.name || user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f0f0fa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {userProfile?.name || user?.name || "User"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7070a0" }}>
                      {userProfile?.status === "active" ? "✦ Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              <nav>
                {tabs.map((tab, i) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 14px", borderRadius: "12px", border: "none", cursor: "pointer",
                        background: active ? "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(236,72,153,0.12))" : "transparent",
                        color: active ? "#d4b3ff" : "#7070a0",
                        fontWeight: active ? 700 : 500, fontSize: "0.85rem",
                        marginBottom: "2px", transition: "all 0.2s",
                        outline: "none",
                        boxShadow: active ? "inset 0 0 0 1px rgba(139,92,246,0.3)" : "none",
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Icon size={16} style={{ color: active ? "#a78bfa" : "#505070" }} />
                        {tab.name}
                      </span>
                      {active && <ChevronRight size={14} style={{ color: "#a78bfa" }} />}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* ── Main Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >

                {/* ════════════ PROFILE ════════════ */}
                {activeTab === "profile" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>
                    {/* Personal Info */}
                    <div style={{ ...S.glassCard, padding: "28px" }}>
                      <SectionHeader
                        icon={User} title="Personal Information" subtitle="Update your account details"
                        action={
                          !isEditing ? (
                            <button style={S.btnSecondary} onClick={() => setIsEditing(true)}>
                              <Edit3 size={15} /> Edit
                            </button>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button style={S.btnSuccess} onClick={handleSave} disabled={isLoading}>
                                {isLoading ? <LoadingSpinner size="sm" /> : <Check size={15} />}
                              </button>
                              <button style={S.btnSecondary} onClick={handleCancel}>
                                <X size={15} />
                              </button>
                            </div>
                          )
                        }
                      />

                      {/* Avatar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "28px", padding: "20px", background: "rgba(139,92,246,0.06)", borderRadius: "16px", border: "1px solid rgba(139,92,246,0.15)" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 800, color: "#fff", overflow: "hidden", border: "3px solid rgba(139,92,246,0.4)" }}>
                            {previewUrl || (profilePicture && typeof profilePicture === "string")
                              ? <img src={previewUrl || (typeof profilePicture === "string" ? profilePicture : "")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : (userProfile?.name || user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            onClick={() => fileInputRef.current?.click()}>
                            <Camera size={12} style={{ color: "#fff" }} />
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#f0f0fa" }}>{userProfile?.name || user?.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "#7070a0", marginBottom: "12px" }}>{user?.email}</div>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button style={{ ...S.btnSecondary, fontSize: "0.75rem", padding: "6px 12px" }} onClick={() => fileInputRef.current?.click()}>
                              <Upload size={13} /> {previewUrl ? "Change" : "Upload"}
                            </button>
                            {(previewUrl || profilePicture) && (
                              <button style={{ ...S.btnDanger, padding: "6px 12px", fontSize: "0.75rem" }} onClick={handleRemovePicture} disabled={isUploading}>
                                <Trash2 size={13} /> Remove
                              </button>
                            )}
                            {previewUrl && (
                              <button style={{ ...S.btnPrimary, fontSize: "0.75rem", padding: "6px 12px" }} onClick={handleUploadPicture} disabled={isUploading}>
                                {isUploading ? <LoadingSpinner size="sm" /> : <><Check size={13} /> Save</>}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Form Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                        <Field label="Display Name" icon={User} editing={isEditing} name="name" value={editData.name} display={userProfile?.name} placeholder="Your name" />
                        <Field label="Phone Number" icon={Mail} editing={isEditing} name="phone" type="tel" value={editData.phone} display={userProfile?.phone} placeholder="+1 (555) 000-0000" />

                        <div>
                          <label style={S.label}>Email Address</label>
                          <div style={S.fieldDisplay}><Mail size={15} style={{ color: "#7070a0" }} />{user?.email || "Not provided"}</div>
                          <p style={{ fontSize: "0.7rem", color: "#505070", marginTop: "4px" }}>Cannot be changed</p>
                        </div>

                        <div>
                          <label style={S.label}>Member Since</label>
                          <div style={S.fieldDisplay}><Calendar size={15} style={{ color: "#7070a0" }} />{joinDate}</div>
                        </div>

                        <div>
                          <label style={S.label}>Account Status</label>
                          <div style={S.fieldDisplay}><Shield size={15} style={{ color: "#10b981" }} /><span style={{ color: "#34d399", fontWeight: 600 }}>{userProfile?.status === "active" ? "Active" : "Inactive"}</span></div>
                        </div>

                        <div>
                          <label style={S.label}>Account Number</label>
                          <div style={{ ...S.fieldDisplay, justifyContent: "space-between" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Hash size={15} style={{ color: "#7070a0" }} />
                              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.95rem" }}>{userProfile?.accountNumber || "Not assigned"}</span>
                            </span>
                            {userProfile?.accountNumber && (
                              <button onClick={() => navigator.clipboard.writeText(userProfile.accountNumber)} style={{ fontSize: "0.72rem", color: "#a78bfa", background: "none", border: "none", cursor: "pointer" }}>Copy</button>
                            )}
                          </div>
                        </div>

                        <Field label="First Name" icon={User} editing={isEditing} name="firstName" value={editData.firstName} display={userProfile?.personalInfo?.firstName} placeholder="First name" />
                        <Field label="Last Name" icon={User} editing={isEditing} name="lastName" value={editData.lastName} display={userProfile?.personalInfo?.lastName} placeholder="Last name" />
                        <Field label="Date of Birth" icon={Calendar} editing={isEditing} name="dateOfBirth" type="date" value={editData.dateOfBirth} display={userProfile?.personalInfo?.dateOfBirth} />
                        <Field label="Occupation" icon={Briefcase} editing={isEditing} name="occupation" value={editData.occupation} display={userProfile?.personalInfo?.occupation} placeholder="Your occupation" />
                        <Field label="Annual Income" icon={DollarSign} editing={isEditing} name="annualIncome" type="number" value={editData.annualIncome} display={userProfile?.personalInfo?.annualIncome ? formatCurrency(userProfile.personalInfo.annualIncome) : undefined} placeholder="Annual income" />
                        <Field label="Address" icon={MapPin} editing={isEditing} name="address" value={editData.address} display={userProfile?.personalInfo?.address} placeholder="Street address" />
                        <Field label="City" icon={MapPin} editing={isEditing} name="city" value={editData.city} display={userProfile?.personalInfo?.city} placeholder="City" />
                        <Field label="State" icon={MapPin} editing={isEditing} name="state" value={editData.state} display={userProfile?.personalInfo?.state} placeholder="State" />
                        <Field label="ZIP Code" icon={Hash} editing={isEditing} name="zipCode" value={editData.zipCode} display={userProfile?.personalInfo?.zipCode} placeholder="ZIP" />

                        <div>
                          <label style={S.label}>Country</label>
                          {isEditing ? (
                            <select name="country" style={S.select} value={editData.country} onChange={handleEditChange}>
                              <option value="">Select country</option>
                              {["US","CA","UK","AU","DE","FR","IT","ES","NL","SE","NO","DK","FI","CH","AT","BE","IE","PT","GR","LU","MT","CY","EE","LV","LT","PL","CZ","SK","SI","HU","RO","BG","HR","Other"].map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <div style={S.fieldDisplay}><MapPin size={15} style={{ color: "#7070a0" }} />{userProfile?.personalInfo?.country || "Not provided"}</div>
                          )}
                        </div>

                        {/* SSN */}
                        <div>
                          <label style={S.label}>Social Security Number</label>
                          {isEditing ? (
                            <div style={{ position: "relative" }}>
                              <input name="ssn" type={showSSN ? "text" : "password"} style={{ ...S.input, paddingRight: "42px" }} value={editData.ssn} onChange={handleEditChange} placeholder="XXX-XX-XXXX"
                                onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                              <button type="button" onClick={() => setShowSSN(!showSSN)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7070a0" }}>
                                {showSSN ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          ) : (
                            <div style={S.fieldDisplay}><Shield size={15} style={{ color: "#7070a0" }} />{userProfile?.personalInfo?.ssn ? "•••-••-••••" : "Not provided"}</div>
                          )}
                        </div>

                        <div>
                          <label style={S.label}>ID Type</label>
                          {isEditing ? (
                            <select name="idType" style={S.select} value={editData.idType} onChange={handleEditChange}>
                              <option value="">Select ID type</option>
                              <option value="drivers-license">Driver's License</option>
                              <option value="passport">Passport</option>
                              <option value="state-id">State ID</option>
                              <option value="national-id">National ID</option>
                            </select>
                          ) : (
                            <div style={S.fieldDisplay}><FileText size={15} style={{ color: "#7070a0" }} />{userProfile?.personalInfo?.idType || "Not provided"}</div>
                          )}
                        </div>

                        {/* Secret Phrase */}
                        <div>
                          <label style={S.label}>Secret Phrase</label>
                          {isEditing ? (
                            <div style={{ position: "relative" }}>
                              <input name="secretPhrase" type={showSecretPhrase ? "text" : "password"} style={{ ...S.input, paddingRight: "42px" }} value={editData.secretPhrase} onChange={handleEditChange} placeholder="Your secret phrase"
                                onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                              <button type="button" onClick={() => setShowSecretPhrase(!showSecretPhrase)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7070a0" }}>
                                {showSecretPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          ) : (
                            <div style={S.fieldDisplay}><Key size={15} style={{ color: "#7070a0" }} />{userProfile?.secretPhrase ? "••••••••" : "Not provided"}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Side cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Investment Plan */}
                      <div style={{ ...S.glassCard, padding: "24px" }}>
                        <SectionHeader icon={TrendingUp} title="Investment Plan" subtitle="Current subscription" />
                        {userPlan ? (
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#f0f0fa" }}>{userPlan.name}</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 900, ...S.accentGradientText, margin: "8px 0 4px" }}>{userPlan.interestRate}%</div>
                            <div style={{ fontSize: "0.75rem", color: "#7070a0", marginBottom: "16px" }}>Monthly Interest Rate</div>
                            {userPlan.features.map((f: any, i: number) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#9090b0", marginBottom: "6px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                                {f}
                              </div>
                            ))}
                            <button style={{ ...S.btnPrimary, width: "100%", justifyContent: "center", marginTop: "16px" }}>Upgrade Plan</button>
                          </div>
                        ) : (
                          <p style={{ textAlign: "center", color: "#7070a0", fontSize: "0.85rem" }}>No plan selected</p>
                        )}
                      </div>

                      {/* Portfolio Summary */}
                      <div style={{ ...S.glassCard, padding: "24px" }}>
                        <h3 style={{ margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700, color: "#f0f0fa" }}>Portfolio Summary</h3>
                        {[
                          { label: "Total Invested", value: formatCurrency(totalInvested), color: "#a78bfa" },
                          { label: "Active Investments", value: activeInvestments, color: "#34d399" },
                          { label: "Account Type", value: userPlan?.name || "Standard", color: "#f472b6" },
                        ].map(item => (
                          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: "0.82rem", color: "#7070a0" }}>{item.label}</span>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: item.color }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════ NOTIFICATIONS ════════════ */}
                {activeTab === "notifications" && (
                  <div style={{ ...S.glassCard, padding: "28px" }}>
                    <SectionHeader icon={Bell} title="Notifications" subtitle="Choose how you want to be notified" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <SettingsRow icon={Mail} title="Email Notifications" description="Receive updates and alerts via email"
                        right={<Toggle checked={notifications.email} onChange={v => setNotifications(p => ({ ...p, email: v }))} />} />
                      <SettingsRow icon={Bell} title="Push Notifications" description="Receive push notifications in browser"
                        right={<Toggle checked={notifications.push} onChange={v => setNotifications(p => ({ ...p, push: v }))} />} />
                      <SettingsRow icon={Hash} title="SMS Notifications" description="Get text alerts sent to your phone"
                        right={<Toggle checked={notifications.sms} onChange={v => setNotifications(p => ({ ...p, sms: v }))} />} />
                    </div>
                  </div>
                )}

                {/* ════════════ SECURITY ════════════ */}
                {activeTab === "security" && (
                  <div style={{ ...S.glassCard, padding: "28px" }}>
                    <SectionHeader icon={Shield} title="Security" subtitle="Protect your account" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        { icon: Shield, title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account", btnLabel: "Enable 2FA", onClick: () => {} },
                        { icon: Key, title: "Change Password", desc: "Update your account password regularly", btnLabel: "Change Password", onClick: () => setShowPasswordModal(true) },
                        { icon: Calendar, title: "Login History", desc: "Review your recent login activity", btnLabel: "View History", onClick: () => setShowLoginHistoryModal(true) },
                      ].map(item => (
                        <SettingsRow key={item.title} icon={item.icon} title={item.title} description={item.desc}
                          right={
                            <button style={{ ...S.btnSecondary, fontSize: "0.8rem", whiteSpace: "nowrap" }} onClick={item.onClick}
                              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}>
                              {item.btnLabel}
                            </button>
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ════════════ PAYMENT METHODS ════════════ */}
                {activeTab === "payment" && (
                  <div style={{ ...S.glassCard, padding: "28px" }}>
                    <SectionHeader icon={CreditCard} title="Payment Methods" subtitle="Manage your withdrawal accounts"
                      action={
                        <button style={S.btnPrimary} onClick={() => { setEditingPayment(null); setNewPaymentMethod({ type: "paypal", name: "", email: "", username: "", phoneNumber: "", address: "" }); setShowAddPaymentModal(true); }}>
                          <Plus size={15} /> Add Method
                        </button>
                      }
                    />

                    {/* Verification notice */}
                    <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "14px", padding: "16px 18px", marginBottom: "20px", display: "flex", gap: "12px" }}>
                      <Shield size={18} style={{ color: "#60a5fa", flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#93c5fd", marginBottom: "4px" }}>Verification Required</div>
                        <div style={{ fontSize: "0.78rem", color: "#6090c0", lineHeight: 1.5 }}>Payment details must match your account info exactly. All methods are pending verification before approval for withdrawals.</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {paymentMethods.map(method => (
                        <div key={method.$id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                            <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.2))", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <CreditCard size={20} style={{ color: "#a78bfa" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f0f0fa" }}>{method.name}</div>
                              <ClickToCopy text={method.accountNumber} copyMessage="Copied!">
                                <div style={{ fontSize: "0.78rem", color: "#7070a0", fontFamily: "monospace" }}>{method.accountNumber}</div>
                              </ClickToCopy>
                              {method.email && <div style={{ fontSize: "0.75rem", color: "#606080" }}>{method.email}</div>}
                              <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                                <Badge status={method.status} />
                                {method.isDefault && (
                                  <span style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", borderRadius: "8px", padding: "3px 10px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Default</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                            {!method.isDefault && (
                              <button onClick={() => setDefaultPaymentMethod(method.$id)} style={{ fontSize: "0.75rem", color: "#a78bfa", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>Set Default</button>
                            )}
                            <button onClick={() => { setEditingPayment(method); setNewPaymentMethod({ type: method.type, name: "", email: method.email || "", username: method.username || "", phoneNumber: method.phoneNumber || "", address: method.address || "" }); setShowAddPaymentModal(true); }}
                              style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9090b0" }}>
                              <Edit size={15} />
                            </button>
                            <button onClick={() => handleDeletePaymentMethod(method.$id)}
                              style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(239,68,68,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {paymentMethods.length === 0 && (
                        <div style={{ textAlign: "center", padding: "48px 24px" }}>
                          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <CreditCard size={28} style={{ color: "#7070a0" }} />
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f0f0fa", marginBottom: "6px" }}>No payment methods</div>
                          <div style={{ fontSize: "0.82rem", color: "#7070a0", marginBottom: "20px" }}>Add a payment method to enable withdrawals</div>
                          <button style={S.btnPrimary} onClick={() => setShowAddPaymentModal(true)}><Plus size={15} /> Add Payment Method</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════════ REFERRALS ════════════ */}
                {activeTab === "referrals" && (
                  <div style={{ ...S.glassCard, padding: "28px" }}>
                    <UserReferralPanel />
                  </div>
                )}

                {/* ════════════ PREFERENCES ════════════ */}
                {activeTab === "preferences" && (
                  <div style={{ ...S.glassCard, padding: "28px" }}>
                    <SectionHeader icon={Globe} title="Preferences" subtitle="Customize your experience" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <SettingsRow icon={Globe} title="Dark Mode" description="Switch to a darker interface theme"
                        right={<Toggle checked={isDarkMode} onChange={async v => { setIsDarkMode(v); v ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark"); try { await updateUserProfile({ preferences: { ...userProfile?.preferences, darkMode: v } } as any); } catch {} }} />} />
                      <SettingsRow icon={Eye} title="Show Balance" description="Display account balance on dashboard"
                        right={<Toggle checked={showBalance} onChange={async v => { setShowBalance(v); try { await updateUserProfile({ preferences: { ...userProfile?.preferences, showBalance: v } } as any); } catch {} }} />} />
                      <div style={{ padding: "18px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e2e2f0", marginBottom: "4px" }}>Currency</div>
                        <div style={{ fontSize: "0.78rem", color: "#7070a0", marginBottom: "12px" }}>Select your preferred display currency</div>
                        <select style={{ ...S.select, maxWidth: "280px" }} value={preferredCurrency}
                          onChange={async e => { setPreferredCurrency(e.target.value); try { await updateUserProfile({ preferences: { ...userProfile?.preferences, currency: e.target.value } } as any); } catch {} }}>
                          <option value="USD">USD — US Dollar</option>
                          <option value="EUR">EUR — Euro</option>
                          <option value="GBP">GBP — British Pound</option>
                          <option value="CAD">CAD — Canadian Dollar</option>
                          <option value="AUD">AUD — Australian Dollar</option>
                          <option value="JPY">JPY — Japanese Yen</option>
                          <option value="CHF">CHF — Swiss Franc</option>
                          <option value="CNY">CNY — Chinese Yuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ── Modals ── */}
      <PasswordChangeModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} onChangePassword={changePassword} />
      <LoginHistoryModal isOpen={showLoginHistoryModal} onClose={() => setShowLoginHistoryModal(false)} onGetLoginHistory={getLoginHistory} onTerminateSession={terminateSession} onTerminateAllOtherSessions={terminateAllOtherSessions} />

      {/* ── Add/Edit Payment Modal ── */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              style={{ background: "#111128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "28px", width: "100%", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, ...S.accentGradientText }}>
                  {editingPayment ? "Edit Payment Method" : "Add Payment Method"}
                </h3>
                <button onClick={() => setShowAddPaymentModal(false)} style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.07)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9090b0" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Amber notice */}
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px", display: "flex", gap: "10px" }}>
                <Shield size={16} style={{ color: "#fbbf24", flexShrink: 0, marginTop: "1px" }} />
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#d4a840", lineHeight: 1.5 }}>
                  <strong>Important:</strong> Payment details must match your account. All methods require verification before approval.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={S.label}>Payment Type</label>
                  <select style={S.select} value={newPaymentMethod.type} onChange={e => setNewPaymentMethod(p => ({ ...p, type: e.target.value }))}>
                    <option value="">Select type</option>
                    {paymentMethodTypes.filter(t => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map(t => (
                      <option key={t.$id} value={t.type}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic fields */}
                {["paypal", "venmo"].includes(newPaymentMethod.type) && <>
                  {[
                    { label: "Email Address", key: "email", type: "email", placeholder: `Enter ${newPaymentMethod.type} email` },
                    { label: "Username", key: "username", type: "text", placeholder: `Enter ${newPaymentMethod.type} username` },
                    { label: "Phone Number", key: "phoneNumber", type: "tel", placeholder: "Enter phone number" },
                  ].map((f, i) => (
                    <React.Fragment key={f.key}>
                      {i > 0 && <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#606080", letterSpacing: "0.1em" }}>— OR —</div>}
                      <div>
                        <label style={S.label}>{f.label}</label>
                        <input type={f.type} style={S.input} value={(newPaymentMethod as any)[f.key]} placeholder={f.placeholder}
                          onChange={e => setNewPaymentMethod(p => ({ ...p, [f.key]: e.target.value }))}
                          onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    </React.Fragment>
                  ))}
                </>}

                {newPaymentMethod.type === "cashapp" && <>
                  {[
                    { label: "Username (without $)", key: "username", placeholder: "cashtag" },
                    { label: "Phone Number", key: "phoneNumber", placeholder: "Phone" },
                  ].map((f, i) => (
                    <React.Fragment key={f.key}>
                      {i > 0 && <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#606080" }}>— OR —</div>}
                      <div>
                        <label style={S.label}>{f.label}</label>
                        <input style={S.input} value={(newPaymentMethod as any)[f.key]} placeholder={f.placeholder}
                          onChange={e => setNewPaymentMethod(p => ({ ...p, [f.key]: e.target.value }))}
                          onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                      </div>
                    </React.Fragment>
                  ))}
                </>}

                {["usdt", "ethereum", "bitcoin"].includes(newPaymentMethod.type) && (
                  <div>
                    <label style={S.label}>{newPaymentMethod.type === "usdt" ? "USDT" : newPaymentMethod.type === "ethereum" ? "Ethereum" : "Bitcoin"} Address</label>
                    <input style={S.input} value={newPaymentMethod.address} placeholder={`Enter ${newPaymentMethod.type} address`}
                      onChange={e => setNewPaymentMethod(p => ({ ...p, address: e.target.value }))}
                      onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
                    <p style={{ fontSize: "0.72rem", color: "#7070a0", marginTop: "6px" }}>Use the correct network. <span style={{ color: "#fbbf24" }}>This address must match your account verification.</span></p>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button style={{ ...S.btnSecondary, flex: 1, justifyContent: "center" }} onClick={() => setShowAddPaymentModal(false)}>Cancel</button>
                  <button style={{ ...S.btnPrimary, flex: 1, justifyContent: "center" }} onClick={handleAddPaymentMethod}>
                    {editingPayment ? "Update" : "Add"} Method
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
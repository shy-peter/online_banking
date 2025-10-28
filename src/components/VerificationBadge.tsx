import React from "react";
import { CheckCircle, Clock, XCircle, AlertCircle, Mail } from "lucide-react";

interface VerificationBadgeProps {
  status: "pending" | "verified" | "rejected" | "incomplete" | "email_pending";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  res?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = "md",
  showText = true,
  className = "",
  res = "px-3",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          iconColor: "text-green-600",
          text: "Verified",
        };
      case "pending":
        return {
          icon: Clock,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-600",
          text: "Pending Review",
        };
      case "rejected":
        return {
          icon: XCircle,
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          iconColor: "text-red-600",
          text: "Rejected",
        };
      case "incomplete":
        return {
          icon: AlertCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          iconColor: "text-gray-600",
          text: "Incomplete",
        };
      case "email_pending":
        return {
          icon: Mail,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          iconColor: "text-blue-600",
          text: "Email Pending",
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          iconColor: "text-gray-600",
          text: "Unknown",
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: " text-xs",
          icon: "w-3 h-3",
          text: "text-[1px]",
        };
      case "md":
        return {
          container: " text-sm",
          icon: "w-4 h-4",
          text: "text-sm",
        };
      case "lg":
        return {
          container: " text-base",
          icon: "w-5 h-5",
          text: "text-base",
        };
      default:
        return {
          container: " text-sm",
          icon: "w-4 h-4",
          text: "text-sm",
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center rounded-full  ${res} border ${config.bgColor} ${config.textColor} ${sizeClasses.container} ${className}`}
    >
      <Icon
        className={`${config.iconColor} ${sizeClasses.icon} ${
          showText ? "mr-2" : ""
        }`}
      />
      {showText && (
        <span className={`font-medium ${sizeClasses.text}`}>{config.text}</span>
      )}
    </div>
  );
};

export default VerificationBadge;

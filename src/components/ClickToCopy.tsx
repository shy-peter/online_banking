import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface ClickToCopyProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  copyMessage?: string;
}

const ClickToCopy: React.FC<ClickToCopyProps> = ({
  text,
  children,
  className = "",
  showIcon = true,
  copyMessage = "Copied to clipboard!",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(copyMessage);

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 cursor-pointer  rounded px-2 py-1 transition-colors group ${className}`}
      onClick={handleCopy}
      title="Click to copy"
    >
      {children || <span className="text-sm text-gray-900">{text}</span>}
      {showIcon && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-green-600 group-hover:text-black" />
          )}
        </div>
      )}
    </div>
  );
};

export default ClickToCopy;

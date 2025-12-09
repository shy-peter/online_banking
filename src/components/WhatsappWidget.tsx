import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppWidget: React.FC = () => {
  return (
    <div className="fixed bottom-20 right-1 z-50 group">
      <a
        href="https://wa.me/19194435735"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-gray-800 rounded-full p-4 shadow-soft-lg hover:bg-[#2fd648] transition-all duration-200 transform hover:scale-105 flex items-center justify-center relative"
      >
        <FaWhatsapp size={28} />
        {/* Tooltip */}
        <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat customer support on WhatsApp
        </span>
      </a>
    </div>
  );
};

export default WhatsAppWidget;

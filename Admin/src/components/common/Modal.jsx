import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "default",
  className = "",
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    default: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // ✅ Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className={`relative w-full ${sizes[size]} 
          bg-white dark:bg-gray-900 
          rounded-2xl border border-gray-200 dark:border-gray-700 
          shadow-xl overflow-y-auto max-h-[90vh] ${className}`}
        onClick={(e) => e.stopPropagation()} // prevent outside close
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

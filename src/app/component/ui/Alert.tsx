// components/ui/Alert.tsx
"use client";
import React, { useState, useEffect } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";
type AlertPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "none";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  position?: AlertPosition;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  message,
  onClose,
  className = "",
  position = "none",
  autoClose = false,
  autoCloseTime = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [key, setKey] = useState(0);

  // Effect to reset visibility when message changes
  useEffect(
    () => {
      if (message) {
        setIsVisible(true);
        setKey(prevKey => prevKey + 1);
      }
    },
    [message]
  );

  // Auto-close effect
  useEffect(
    () => {
      if (autoClose && isVisible) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, autoCloseTime);

        return () => clearTimeout(timer);
      }
    },
    [autoClose, autoCloseTime, isVisible, onClose]
  );

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  // Color schemes for different variants
  const variantStyles = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-red-50 text-red-800 border-red-200"
  };

  // Position styles
  const positionStyles = {
    "top-left": "fixed top-4 left-4",
    "top-right": "fixed top-4 right-4",
    "bottom-left": "fixed bottom-4 left-4",
    "bottom-right": "fixed bottom-4 right-4",
    center:
      "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    none: "" // No positioning, just render inline
  };

  const positionClass =
    position !== "none" ? `${positionStyles[position]} z-50 max-w-md` : "";

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      key={key}
      className={`rounded-md border p-4 mb-4 ${variantStyles[
        variant
      ]} ${positionClass} ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          {title &&
            <h3 className="font-medium mb-1">
              {title}
            </h3>}
          <p className="text-sm">
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 text-sm hover:opacity-70"
          aria-label="Close"
        >
          X
        </button>
      </div>
    </div>
  );
};

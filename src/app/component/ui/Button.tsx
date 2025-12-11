// components/ui/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "text" | "black" |"white";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  type = "button"
}) => {
  const variantClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      black: "bg-black hover:bg-white hover:text-black text-white",
      white:"bg-white hover:bg-black hover:text-white text-black",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",
    text: "bg-transparent text-blue-600 hover:underline"
  };

  const sizeClasses = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4",
    large: "py-3 px-6 text-lg"
  };

  return (
    <button
      type={type}
      className={`rounded cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[
        variant
      ]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <div className="flex items-center justify-center">
        {isLoading &&
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>}
        {children}
      </div>
    </button>
  );
};

// app/component/ui/SuspendUrlModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface SuspendUrlModalProps {
  urlId: string;
  shortUrl: string;
  isOpen: boolean;
  isSuspended: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuspendUrlModal: React.FC<SuspendUrlModalProps> = ({
  urlId,
  shortUrl,
  isOpen,
  isSuspended,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const action = isSuspended ? 'unsuspend' : 'suspend';

  if (!isOpen) return null;

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/urls/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          password,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${action} URL`);
        setIsSubmitting(false);
        return;
      }

      // Success - close modal and refresh the URL list
      onSuccess();
      onClose();
      
    } catch (error) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-25 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {isSuspended ? 'Reactivate URL' : 'Suspend URL'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4">
          {isSuspended 
            ? 'This will reactivate your URL and make it accessible again.' 
            : 'This will temporarily suspend your URL. Visitors will see a suspension notice instead of being redirected.'}
        </p>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">URL to {action}:</p>
          <div className="bg-gray-100 p-2 rounded text-gray-800 break-all">
            {shortUrl}
          </div>
        </div>

        <form onSubmit={handleSuspend}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm with your password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded ${
                isSuspended
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isSubmitting
                ? "Processing..."
                : isSuspended
                  ? "Reactivate URL"
                  : "Suspend URL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
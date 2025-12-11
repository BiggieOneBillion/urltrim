// app/component/ui/RenameUrlModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface RenameUrlModalProps {
  urlId: string;
  currentShortId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RenameUrlModal: React.FC<RenameUrlModalProps> = ({
  urlId,
  currentShortId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newShortId, setNewShortId] = useState(currentShortId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate new ID (only allow alphanumeric characters, hyphens, and underscores)
    const validIdPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validIdPattern.test(newShortId)) {
      setError(
        "Custom URL can only contain letters, numbers, hyphens, and underscores"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/urls/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          newShortId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to rename URL");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Rename Short URL</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="mb-2 text-sm sm:text-base break-words">
            Current URL:{" "}
            <span className="font-medium">
              {window.location.origin}/{currentShortId}
            </span>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 italic">
            Enter a new custom ID for your short URL. This will change the URL
            that users visit.
          </p>
        </div>

        <form onSubmit={handleRename}>
          <div className="mb-4">
            <label
              htmlFor="newShortId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Custom ID
            </label>
            <div className="flex items-center flex-wrap sm:flex-nowrap">
              <span className="text-gray-500 mr-1 text-sm mb-1 sm:mb-0">
                {window.location.origin}/
              </span>
              <input
                type="text"
                id="newShortId"
                value={newShortId}
                onChange={e => setNewShortId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
                minLength={3}
                maxLength={30}
              />
            </div>
            {error &&
              <p className="text-red-600 text-sm mt-1">
                {error}
              </p>}
          </div>

          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 py-2 px-3 sm:px-4 rounded hover:bg-gray-400 text-sm sm:text-base"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white py-2 px-3 sm:px-4 rounded hover:bg-white hover:text-black disabled:bg-black text-sm sm:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Renaming..." : "Rename URL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

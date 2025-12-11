// app/component/ui/DeleteUrlModal.tsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface DeleteUrlModalProps {
  urlId: string;
  shortUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUrlModal: React.FC<DeleteUrlModalProps> = ({
  urlId,
  shortUrl,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
const Router= useRouter()
  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/urls/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete URL");
        setIsSubmitting(false);
        return;
      }

      // Success - close modal and refresh the URL list
      onSuccess();
     // Router.push("/dashboard")
      onClose();
      
    } catch (error) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return <div className="fixed inset-0 bg-opacity-25 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Delete URL</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2">Are you sure you want to delete this URL?</p>
          <p className="text-sm text-gray-600 mb-2">
            {shortUrl}
          </p>
          <p className="text-sm text-gray-500 italic">
            This action cannot be undone. The URL will be moved to a temporary
            storage for 6 months before being permanently deleted.
          </p>
        </div>

        <form onSubmit={handleDelete}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Enter your password to confirm
            </label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" required />
            {error && <p className="text-red-600 text-sm mt-1">
                {error}
              </p>}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="bg-black text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-red-400" disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete URL"}
            </button>
          </div>
        </form>
      </div>
    </div>;
};

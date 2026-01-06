import { useEffect } from "react";
import { X } from "lucide-react";

export default function SlidePanel({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-in-out ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel Content */}
      <div className={`absolute right-0 h-full w-full md:w-[600px] glass border-l border-white/10 shadow-2xl transition-transform duration-500 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Details</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-95"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

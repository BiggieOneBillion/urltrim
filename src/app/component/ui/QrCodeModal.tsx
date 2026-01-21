"use client";

import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortenedUrl: string | null;
  qrCodeSize: string;
  setQrCodeSize: (size: string) => void;
  downloadQrCode: () => void;
}

export const QrCodeModal = ({
  isOpen,
  onClose,
  shortenedUrl,
  qrCodeSize,
  setQrCodeSize,
  downloadQrCode,
}: QrCodeModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{zIndex: 'var(--z-modal)'}}>
      <div className="card max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-text-primary">QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center mb-6 qr-code-container p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={shortenedUrl || ""}
            size={250}
            level={"H"}
            includeMargin={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setQrCodeSize("svg")}
            className={`py-3 px-4 rounded-md font-medium transition-all ${
              qrCodeSize === "svg"
                ? "bg-primary text-text-inverse"
                : "bg-surface hover:bg-surface-hover text-text-primary"
            }`}
          >
            SVG
          </button>
          <button
            onClick={() => setQrCodeSize("png")}
            className={`py-3 px-4 rounded-md font-medium transition-all ${
              qrCodeSize === "png"
                ? "bg-primary text-text-inverse"
                : "bg-surface hover:bg-surface-hover text-text-primary"
            }`}
          >
            PNG
          </button>
          <button
            onClick={() => setQrCodeSize("png1200")}
            className={`py-3 px-4 rounded-md font-medium transition-all ${
              qrCodeSize === "png1200"
                ? "bg-primary text-text-inverse"
                : "bg-surface hover:bg-surface-hover text-text-primary"
            }`}
          >
            PNG 1200
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadQrCode}
            className="btn btn-primary flex-1"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-4xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClass} max-h-[90vh] overflow-hidden flex flex-col animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-200">
          <h2 className="text-lg font-bold text-forest-800 font-display">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}

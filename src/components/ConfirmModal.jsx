import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message = "Are you sure?" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-amber-50 p-4">
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        <p className="text-forest-600">{message}</p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1">Confirm</button>
        </div>
      </div>
    </Modal>
  );
}

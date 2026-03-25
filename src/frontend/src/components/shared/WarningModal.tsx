import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WarningModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
        <div className="text-center text-base font-semibold text-yellow-700 mb-4">
          {message}
        </div>
        <Button onClick={onClose} className="w-full rounded-lg" variant="outline">
          Đóng
        </Button>
      </div>
    </div>
  );
};

export default WarningModal;

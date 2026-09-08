import { AlertCircle, CheckCircle2, X } from "lucide-react";
import "../styles/AlertPopup.css";

function AlertPopup({ message, type = "error", onClose }) {
  if (!message) {
    return null;
  }

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`alert-popup ${type}`} role="alert">
      <Icon size={20} />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close alert">
        <X size={17} />
      </button>
    </div>
  );
}

export default AlertPopup;

import React, { useEffect } from "react";
import "./common.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 540,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="rx-modal-overlay" onClick={onClose}>
      <div
        className="rx-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rx-modal-header">
          <h3 className="rx-modal-title">{title}</h3>
          <button className="rx-modal-close" onClick={onClose} aria-label="Close">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="rx-modal-body">{children}</div>

        {footer && <div className="rx-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

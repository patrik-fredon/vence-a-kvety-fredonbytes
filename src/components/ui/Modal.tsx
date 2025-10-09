/**
 * Accessible modal component with focus management and keyboard navigation
 * Implements ARIA dialog pattern with proper focus trapping
 */

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAnnouncer, useFocusTrap } from "@/lib/accessibility/hooks";
import { XMarkIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  initialFocus?: React.RefObject<HTMLElement | null>;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  initialFocus,
}: ModalProps) {
  const t = useTranslations("accessibility");
  const announce = useAnnouncer();
  const modalRef = useFocusTrap(isOpen);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!(isOpen && closeOnEscape)) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
    return undefined;
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusTarget = initialFocus?.current || titleRef.current;
      if (focusTarget) {
        focusTarget.focus();
      }
      announce(`${t("openMenu")}: ${title}`, "polite");
    } else if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen, announce, title, initialFocus, modalRef.current, t]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    announce(t("closeDialog"), "polite");
    onClose();
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="absolute inset-0 bg-teal-900/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        className={cn(
          "relative bg-amber-100 rounded-lg shadow-xl w-full",
          sizeClasses[size],
          "max-h-[90vh] overflow-hidden focus:outline-none",
          "high-contrast:border-2 high-contrast:border-WindowText",
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div className="flex items-center justify-between p-6 border-b border-teal-900">
          <div className="flex-1 min-w-0">
            <h2
              id="modal-title"
              ref={titleRef}
              className="text-lg font-semibold text-teal-900 truncate"
              tabIndex={-1}
            >
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-teal-800">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="ml-4 flex-shrink-0"
              aria-label={t("closeDialog")}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t border-teal-200 bg-teal-50",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const t = useTranslations("common");
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const defaultConfirmText = confirmText || t("confirm");
  const defaultCancelText = cancelText || t("cancel");

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocus={confirmButtonRef}
    >
      <div className="space-y-4">
        <p className="text-teal-800">{message}</p>
        <ModalFooter>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {defaultCancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            loading={loading}
          >
            {defaultConfirmText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

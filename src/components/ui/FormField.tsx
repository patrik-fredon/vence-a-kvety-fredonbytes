/**
 * Enhanced form field component with comprehensive accessibility support
 * Provides proper ARIA attributes, error handling, and keyboard navigation
 */

import { useTranslations } from "next-intl";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "@/lib/accessibility/hooks";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
}

interface InputFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  type?: "text" | "email" | "password" | "tel" | "url" | "search" | "number";
}

interface TextareaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  type: "textarea";
  rows?: number;
}

interface SelectFieldProps
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  type: "select";
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, error, helpText, required, icon, iconPosition = "left", className } = props;

  const t = useTranslations("accessibility");
  const fieldId = useId("field");
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const baseStyles = cn(
    "block w-full rounded-md border px-3 py-2",
    "text-teal-900 placeholder-teal-800 bg-white",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:bg-amber-50 disabled:text-amber-500 disabled:cursor-not-allowed disabled:border-amber-200",
    "transition-all duration-200 ease-in-out",
    "shadow-sm focus:shadow-md",
    "font-normal text-sm leading-normal",
    // High contrast mode support
    "high-contrast:border-2 high-contrast:border-ButtonText",
    "high-contrast:focus:border-Highlight high-contrast:focus:ring-Highlight"
  );

  const validStyles = cn("border-amber-300 focus:border-amber-200 focus:ring-amber-500/20");

  const errorStyles = cn(
    "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30",
    "high-contrast:border-red-600 high-contrast:focus:border-red-600"
  );

  const iconStyles = icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "";

  const fieldStyles = cn(baseStyles, error ? errorStyles : validStyles, iconStyles, className);

  const commonProps = {
    id: fieldId,
    className: fieldStyles,
    "aria-invalid": error ? ("true" as const) : ("false" as const),
    "aria-describedby": describedBy,
    "aria-required": required,
  };

  const renderField = () => {
    if (props.type === "textarea") {
      const {
        type,
        label,
        error,
        helpText,
        required,
        icon,
        iconPosition,
        className,
        ...textareaProps
      } = props as TextareaFieldProps;
      return <textarea {...commonProps} {...textareaProps} rows={textareaProps.rows || 4} />;
    }

    if (props.type === "select") {
      const {
        type,
        options,
        placeholder,
        label,
        error,
        helpText,
        required,
        icon,
        iconPosition,
        className,
        ...selectProps
      } = props as SelectFieldProps;
      return (
        <select {...commonProps} {...selectProps}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const {
      type = "text",
      label: _label,
      error: _error,
      helpText: _helpText,
      required: _required,
      icon: _icon,
      iconPosition: _iconPosition,
      className: _className,
      ...inputProps
    } = props as InputFieldProps;
    return <input {...commonProps} {...inputProps} type={type} />;
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-amber-300">
          {label}
          {required && (
            <span
              className="text-red-500 ml-1"
              aria-label={t("requiredField")}
              title={t("requiredField")}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Field Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-amber-300" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}

        {/* Field */}
        {renderField()}

        {/* Right Icon */}
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-amber-300" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <p id={helpId} className="text-sm text-amber-300">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 font-medium flex items-start gap-1"
          role="alert"
          aria-live="polite"
        >
          <span className="text-red-500 mt-0.5" aria-hidden="true">
            ⚠
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Form group component for grouping related fields
 */
interface FormGroupProps {
  children: ReactNode;
  legend?: string;
  description?: string;
  className?: string;
}

export function FormGroup({ children, legend, description, className }: FormGroupProps) {
  const groupId = useId("group");
  const descriptionId = description ? `${groupId}-description` : undefined;

  return (
    <fieldset className={cn("space-y-4", className)} aria-describedby={descriptionId}>
      {legend && <legend className="text-base font-semibold text-amber-300 mb-2">{legend}</legend>}

      {description && (
        <p id={descriptionId} className="text-sm text-amber-300 mb-4">
          {description}
        </p>
      )}

      {children}
    </fieldset>
  );
}

/**
 * Form section component for organizing forms into logical sections
 */
interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormSection({ children, title, description, className }: FormSectionProps) {
  const sectionId = useId("section");
  const titleId = title ? `${sectionId}-title` : undefined;
  const descriptionId = description ? `${sectionId}-description` : undefined;

  return (
    <section
      className={cn("space-y-6", className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {title && (
        <h2 id={titleId} className="text-lg font-semibold text-amber-300">
          {title}
        </h2>
      )}

      {description && (
        <p id={descriptionId} className="text-sm text-amber-300">
          {description}
        </p>
      )}

      {children}
    </section>
  );
}

/**
 * Contact form related type definitions
 */

import { BaseEntity } from "./index";

// Contact form submission data
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Contact form validation errors
export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

// Contact form database entity
export interface ContactForm extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  ipAddress?: string;
  userAgent?: string;
}

// Contact form API request
export interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Contact form API response
export interface ContactFormResponse {
  success: boolean;
  message: string;
  id?: string;
}

// Email template data
export interface ContactEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  submittedAt: string;
}

// Admin notification email data
export interface AdminNotificationData extends ContactEmailData {
  ipAddress?: string;
  userAgent?: string;
}

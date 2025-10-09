/**
 * SMTP client configuration for Supabase SMTP with nodemailer
 * Handles connection pooling, retry logic, and environment validation
 */

import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

// SMTP configuration interface
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  pool: boolean;
  maxConnections: number;
  maxMessages: number;
}

// Email sending result interface
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryCount?: number;
}

// Environment validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * SMTP Client class with connection pooling and retry logic
 */
export class SMTPClient {
  private transporter: Transporter | null = null;
  private config: SMTPConfig;
  private isInitialized = false;

  constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Load SMTP configuration from environment variables
   */
  private loadConfiguration(): SMTPConfig {
    return {
      host: process.env['SMTP_HOST'] || 'smtp.supabase.com',
      port: parseInt(process.env['SMTP_PORT'] || '587', 10),
      secure: process.env['SMTP_SECURE'] === 'true', // true for 465, false for other ports
      auth: {
        user: process.env['SMTP_USER'] || '',
        pass: process.env['SMTP_PASS'] || '',
      },
      from: {
        name: process.env['SMTP_FROM_NAME'] || 'Pohřební věnce',
        email: process.env['SMTP_FROM_EMAIL'] || 'orders@pohrebni-vence.cz',
      },
      pool: true, // Enable connection pooling
      maxConnections: parseInt(process.env['SMTP_MAX_CONNECTIONS'] || '5', 10),
      maxMessages: parseInt(process.env['SMTP_MAX_MESSAGES'] || '100', 10),
    };
  }

  /**
   * Validate SMTP environment variables
   */
  public validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required environment variables
    const requiredVars = [
      'SMTP_HOST',
      'SMTP_PORT', 
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_FROM_EMAIL',
      'SMTP_FROM_NAME'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.config.from.email && !emailRegex.test(this.config.from.email)) {
      errors.push('SMTP_FROM_EMAIL is not a valid email address');
    }

    // Validate port
    if (isNaN(this.config.port) || this.config.port < 1 || this.config.port > 65535) {
      errors.push('SMTP_PORT must be a valid port number (1-65535)');
    }

    // Warnings for optional configurations
    if (!process.env['SMTP_SECURE']) {
      warnings.push('SMTP_SECURE not set, defaulting to false (recommended: true for port 465)');
    }

    if (!process.env['SMTP_MAX_CONNECTIONS']) {
      warnings.push('SMTP_MAX_CONNECTIONS not set, defaulting to 5');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Initialize the SMTP transporter with connection pooling
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized && this.transporter) {
      return;
    }

    const validation = this.validateEnvironment();
    if (!validation.isValid) {
      throw new Error(`SMTP configuration invalid: ${validation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('SMTP Configuration warnings:', validation.warnings);
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        pool: this.config.pool,
        maxConnections: this.config.maxConnections,
        maxMessages: this.config.maxMessages,
        // Connection timeout (30 seconds)
        connectionTimeout: 30000,
        // Socket timeout (30 seconds)
        socketTimeout: 30000,
        // TLS options for security
        tls: {
          // Don't fail on invalid certs in development
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
        // Enable debug logging in development
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      });

      // Verify connection
      await this.verifyConnection();
      this.isInitialized = true;

      console.log('SMTP client initialized successfully', {
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        pool: this.config.pool,
      });
    } catch (error) {
      console.error('Failed to initialize SMTP client:', error);
      throw new Error(`SMTP initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify SMTP connection
   */
  public async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized');
    }

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      throw new Error(`SMTP connection verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send email with exponential backoff retry logic
   */
  public async sendMail(
    mailOptions: Omit<SendMailOptions, 'from'>,
    maxRetries = 3
  ): Promise<EmailResult> {
    if (!this.isInitialized || !this.transporter) {
      await this.initialize();
    }

    const fullMailOptions: SendMailOptions = {
      ...mailOptions,
      from: `${this.config.from.name} <${this.config.from.email}>`,
    };

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Sending email (attempt ${attempt}/${maxRetries})`, {
          to: mailOptions.to,
          subject: mailOptions.subject,
        });

        const result = await this.transporter!.sendMail(fullMailOptions);
        
        console.log('Email sent successfully', {
          messageId: result.messageId,
          to: mailOptions.to,
          subject: mailOptions.subject,
          attempt,
        });

        return {
          success: true,
          messageId: result.messageId,
          retryCount: attempt - 1,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.error(`Email sending failed (attempt ${attempt}/${maxRetries}):`, {
          error: lastError.message,
          to: mailOptions.to,
          subject: mailOptions.subject,
        });

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          console.error('Non-retryable error encountered, stopping retries:', lastError.message);
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
          console.log(`Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      retryCount: maxRetries,
    };
  }

  /**
   * Check if error is non-retryable (authentication, invalid email, etc.)
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /invalid login/i,
      /authentication failed/i,
      /invalid recipient/i,
      /invalid sender/i,
      /mailbox unavailable/i,
      /recipient address rejected/i,
      /sender address rejected/i,
    ];

    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close the SMTP connection pool
   */
  public async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
      this.isInitialized = false;
      console.log('SMTP connection pool closed');
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  public getConfig(): Omit<SMTPConfig, 'auth'> {
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      from: this.config.from,
      pool: this.config.pool,
      maxConnections: this.config.maxConnections,
      maxMessages: this.config.maxMessages,
    };
  }

  /**
   * Test email sending with a simple test message
   */
  public async sendTestEmail(to: string): Promise<EmailResult> {
    const testMailOptions = {
      to,
      subject: 'SMTP Test Email - Pohřební věnce',
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <h2>SMTP Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>If you receive this email, the SMTP setup is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    };

    return this.sendMail(testMailOptions);
  }
}

// Export singleton instance
export const smtpClient = new SMTPClient();

// Export utility functions
export async function initializeSMTP(): Promise<void> {
  await smtpClient.initialize();
}

export async function validateSMTPConfig(): Promise<ValidationResult> {
  return smtpClient.validateEnvironment();
}

export async function sendTestEmail(to: string): Promise<EmailResult> {
  return smtpClient.sendTestEmail(to);
}
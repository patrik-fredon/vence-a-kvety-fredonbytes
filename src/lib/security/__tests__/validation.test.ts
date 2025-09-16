/**
 * Security validation tests
 */

import {
  validateEmail,
  validatePhone,
  validateRequiredString,
  validateUUID,
  validateNumber,
  sanitizeString,
  VALIDATION_PATTERNS,
} from '../validation';

describe('Security Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.data).toBe('test@example.com');
    });

    it('should reject invalid email addresses', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('INVALID_FORMAT');
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('REQUIRED');
    });
  });

  describe('validatePhone', () => {
    it('should validate Czech phone numbers', () => {
      const result = validatePhone('+420123456789');
      expect(result.isValid).toBe(true);
      expect(result.data).toBe('+420123456789');
    });

    it('should validate phone numbers without country code', () => {
      const result = validatePhone('123456789');
      expect(result.isValid).toBe(true);
      expect(result.data).toBe('123456789');
    });

    it('should reject invalid phone numbers', () => {
      const result = validatePhone('123');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = validateUUID(uuid);
      expect(result.isValid).toBe(true);
      expect(result.data).toBe(uuid);
    });

    it('should reject invalid UUIDs', () => {
      const result = validateUUID('invalid-uuid');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('INVALID_FORMAT');
    });
  });

  describe('validateNumber', () => {
    it('should validate numbers within range', () => {
      const result = validateNumber(5, 'quantity', 1, 10);
      expect(result.isValid).toBe(true);
      expect(result.data).toBe(5);
    });

    it('should reject numbers below minimum', () => {
      const result = validateNumber(0, 'quantity', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('MIN_VALUE');
    });

    it('should reject numbers above maximum', () => {
      const result = validateNumber(15, 'quantity', 1, 10);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('MAX_VALUE');
    });

    it('should reject non-numeric values', () => {
      const result = validateNumber('abc', 'quantity');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.code).toBe('INVALID_TYPE');
    });
  });

  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeString(input);
      expect(result).toBe('Hello');
    });

    it('should remove HTML tags', () => {
      const input = '<div>Hello <b>World</b></div>';
      const result = sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeString(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick="alert()" Hello';
      const result = sanitizeString(input);
      expect(result).toBe('Hello');
    });

    it('should respect length limits', () => {
      const input = 'This is a very long string';
      const result = sanitizeString(input, 10);
      expect(result).toBe('This is a ');
    });
  });

  describe('VALIDATION_PATTERNS', () => {
    it('should have correct email pattern', () => {
      expect(VALIDATION_PATTERNS.email.test('test@example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.email.test('invalid-email')).toBe(false);
    });

    it('should have correct phone pattern', () => {
      expect(VALIDATION_PATTERNS.phone.test('+420123456789')).toBe(true);
      expect(VALIDATION_PATTERNS.phone.test('123456789')).toBe(true);
      expect(VALIDATION_PATTERNS.phone.test('123')).toBe(false);
    });

    it('should have correct UUID pattern', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(VALIDATION_PATTERNS.uuid.test(uuid)).toBe(true);
      expect(VALIDATION_PATTERNS.uuid.test('invalid-uuid')).toBe(false);
    });
  });
});

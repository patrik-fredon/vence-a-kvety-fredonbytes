/**
 * Tests for delivery calculator utilities
 */

import {
  isCzechHoliday,
  isWeekend,
  isWorkingDay,
  getNextWorkingDay,
  calculateEarliestDeliveryDate,
  generateAvailableDeliveryDates,
  calculateDeliveryCost,
  findDeliveryZone,
  validateDeliveryRequest,
  DEFAULT_DELIVERY_SETTINGS
} from '../delivery-calculator';
import { Address, DeliveryUrgency } from '@/types/delivery';

describe('Delivery Calculator', () => {
  describe('isCzechHoliday', () => {
    it('should identify Czech holidays correctly', () => {
      // New Year's Day 2024
      expect(isCzechHoliday(new Date(2024, 0, 1))).toBe(true);

      // Christmas Day 2024
      expect(isCzechHoliday(new Date(2024, 11, 25))).toBe(true);

      // Regular day
      expect(isCzechHoliday(new Date(2024, 5, 15))).toBe(false);
    });

    it('should handle different years', () => {
      // New Year's Day 2025
      expect(isCzechHoliday(new Date(2025, 0, 1))).toBe(true);

      // Year not in holiday list
      expect(isCzechHoliday(new Date(2023, 0, 1))).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('should identify weekends correctly', () => {
      // Saturday
      expect(isWeekend(new Date(2024, 5, 15))).toBe(true);

      // Sunday
      expect(isWeekend(new Date(2024, 5, 16))).toBe(true);

      // Monday
      expect(isWeekend(new Date(2024, 5, 17))).toBe(false);

      // Friday
      expect(isWeekend(new Date(2024, 5, 21))).toBe(false);
    });
  });

  describe('isWorkingDay', () => {
    it('should identify working days correctly', () => {
      // Monday (working day)
      expect(isWorkingDay(new Date(2024, 5, 17))).toBe(true);

      // Saturday (weekend)
      expect(isWorkingDay(new Date(2024, 5, 15))).toBe(false);

      // New Year's Day (holiday)
      expect(isWorkingDay(new Date(2024, 0, 1))).toBe(false);
    });
  });

  describe('getNextWorkingDay', () => {
    it('should return next working day from Friday', () => {
      const friday = new Date(2024, 5, 21); // June 21, 2024 (Friday)
      const nextWorking = getNextWorkingDay(friday);

      // Should be Monday (skipping weekend)
      expect(nextWorking.getDay()).toBe(1); // Monday
      expect(nextWorking.getDate()).toBe(24);
    });

    it('should skip holidays', () => {
      const beforeHoliday = new Date(2024, 11, 24); // December 24, 2024 (Christmas Eve)
      const nextWorking = getNextWorkingDay(beforeHoliday);

      // Should skip Christmas holidays
      expect(nextWorking.getDate()).toBeGreaterThan(26);
    });
  });

  describe('calculateEarliestDeliveryDate', () => {
    it('should return a future date for standard delivery', () => {
      const earliest = calculateEarliestDeliveryDate('standard');
      const now = new Date();

      // Should be at least 24 hours from now
      expect(earliest.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return different dates for different urgencies', () => {
      const standard = calculateEarliestDeliveryDate('standard');
      const express = calculateEarliestDeliveryDate('express');
      const sameDay = calculateEarliestDeliveryDate('same-day');

      // Express should be earlier than or equal to standard
      expect(express.getTime()).toBeLessThanOrEqual(standard.getTime());

      // Same-day should be earliest (or same as express if too late)
      expect(sameDay.getTime()).toBeLessThanOrEqual(express.getTime());
    });

    it('should return working days only', () => {
      const earliest = calculateEarliestDeliveryDate('standard');

      // Should be a working day
      expect(isWorkingDay(earliest)).toBe(true);
    });
  });

  describe('generateAvailableDeliveryDates', () => {
    it('should generate correct availability for a future month', () => {
      // Use a future date to ensure we get results
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2); // 2 months from now

      const dates = generateAvailableDeliveryDates(futureDate.getMonth(), futureDate.getFullYear());

      expect(dates.length).toBeGreaterThan(0);

      // Check that weekends are marked as unavailable
      const weekend = dates.find(d => d.date.getDay() === 0 || d.date.getDay() === 6);
      if (weekend) {
        expect(weekend.available).toBe(false);
        expect(weekend.isWeekend).toBe(true);
      }
    });

    it('should not include past dates', () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const dates = generateAvailableDeliveryDates(currentMonth, currentYear);

      // All dates should be today or in the future
      dates.forEach(dateInfo => {
        expect(dateInfo.date.getTime()).toBeGreaterThanOrEqual(
          new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        );
      });
    });
  });

  describe('calculateDeliveryCost', () => {
    const testAddress: Address = {
      street: 'Test Street 1',
      city: 'Praha',
      postalCode: '110 00',
      country: 'Czech Republic'
    };

    it('should calculate standard delivery cost', () => {
      const cost = calculateDeliveryCost(testAddress, 'standard');

      expect(cost.totalCost).toBeGreaterThan(0);
      expect(cost.baseCost).toBe(150); // Prague zone base cost
      expect(cost.estimatedDeliveryDate).toBeInstanceOf(Date);
    });

    it('should add time slot surcharge', () => {
      const standardCost = calculateDeliveryCost(testAddress, 'standard', 'anytime');
      const morningCost = calculateDeliveryCost(testAddress, 'standard', 'morning');

      expect(morningCost.totalCost).toBeGreaterThan(standardCost.totalCost);
      expect(morningCost.timeSlotCost).toBe(50);
    });

    it('should handle different urgency levels', () => {
      const standardCost = calculateDeliveryCost(testAddress, 'standard');
      const expressCost = calculateDeliveryCost(testAddress, 'express');
      const sameDayCost = calculateDeliveryCost(testAddress, 'same-day');

      expect(expressCost.baseCost).toBeGreaterThan(standardCost.baseCost);
      expect(sameDayCost.baseCost).toBeGreaterThan(expressCost.baseCost);
    });
  });

  describe('findDeliveryZone', () => {
    it('should find Prague zone for Prague postal codes', () => {
      const zone = findDeliveryZone('110 00');
      expect(zone.id).toBe('prague');
      expect(zone.name).toBe('Praha');
    });

    it('should find central Bohemia zone', () => {
      const zone = findDeliveryZone('250 01');
      expect(zone.id).toBe('central-bohemia');
    });

    it('should default to other zone for unknown postal codes', () => {
      const zone = findDeliveryZone('999 99');
      expect(zone.id).toBe('other');
    });
  });

  describe('validateDeliveryRequest', () => {
    const validAddress: Address = {
      street: 'Test Street 1',
      city: 'Praha',
      postalCode: '110 00',
      country: 'Czech Republic'
    };

    it('should validate correct delivery request', () => {
      const validation = validateDeliveryRequest(validAddress, 'standard');
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject missing postal code', () => {
      const invalidAddress = { ...validAddress, postalCode: '' };
      const validation = validateDeliveryRequest(invalidAddress, 'standard');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('PSČ je povinné');
    });

    it('should reject unsupported urgency for zone', () => {
      const remoteAddress = { ...validAddress, postalCode: '999 99' };
      const validation = validateDeliveryRequest(remoteAddress, 'same-day');

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('same-day'))).toBe(true);
    });

    it('should reject past preferred dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const validation = validateDeliveryRequest(validAddress, 'standard', pastDate);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('příliš brzy'))).toBe(true);
    });

    it('should reject non-working days', () => {
      // Find next Saturday
      const saturday = new Date();
      while (saturday.getDay() !== 6) {
        saturday.setDate(saturday.getDate() + 1);
      }

      const validation = validateDeliveryRequest(validAddress, 'standard', saturday);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('pracovní den'))).toBe(true);
    });
  });
});

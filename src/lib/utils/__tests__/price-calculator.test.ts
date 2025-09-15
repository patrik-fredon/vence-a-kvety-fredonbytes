import { calculateTotalPrice, calculateDeliveryFee, applyDiscounts } from '../price-calculator';
import { Customization } from '@/types/product';

describe('Price Calculator', () => {
  describe('calculateTotalPrice', () => {
    it('calculates base price correctly', () => {
      const basePrice = 1500;
      const customizations: Customization[] = [];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(1500);
    });

    it('applies customization price modifiers', () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: 'size',
          customValue: 'large',
          priceModifier: 500,
        },
        {
          optionId: 'ribbon',
          customValue: 'gold',
          priceModifier: 200,
        },
      ];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(2200); // 1500 + 500 + 200
    });

    it('handles negative price modifiers', () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: 'discount',
          customValue: 'simple',
          priceModifier: -300,
        },
      ];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(1200); // 1500 - 300
    });

    it('ensures minimum price is not negative', () => {
      const basePrice = 100;
      const customizations: Customization[] = [
        {
          optionId: 'discount',
          customValue: 'huge',
          priceModifier: -200,
        },
      ];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(0); // Should not go below 0
    });

    it('handles empty customizations array', () => {
      const basePrice = 1500;
      const customizations: Customization[] = [];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(1500);
    });

    it('handles customizations without price modifiers', () => {
      const basePrice = 1500;
      const customizations: Customization[] = [
        {
          optionId: 'message',
          customValue: 'In loving memory',
          // No priceModifier
        },
      ];

      const result = calculateTotalPrice(basePrice, customizations);
      expect(result).toBe(1500);
    });
  });

  describe('calculateDeliveryFee', () => {
    it('calculates standard delivery fee', () => {
      const address = {
        street: 'Václavské náměstí 1',
        city: 'Praha',
        postalCode: '11000',
        country: 'CZ',
      };
      const deliveryDate = new Date('2024-12-25');
      const isExpress = false;

      const result = calculateDeliveryFee(address, deliveryDate, isExpress);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('calculates express delivery fee', () => {
      const address = {
        street: 'Václavské náměstí 1',
        city: 'Praha',
        postalCode: '11000',
        country: 'CZ',
      };
      const deliveryDate = new Date('2024-12-25');
      const isExpress = true;

      const standardFee = calculateDeliveryFee(address, deliveryDate, false);
      const expressFee = calculateDeliveryFee(address, deliveryDate, true);

      expect(expressFee).toBeGreaterThan(standardFee);
    });

    it('handles different cities with different rates', () => {
      const pragueAddress = {
        street: 'Václavské náměstí 1',
        city: 'Praha',
        postalCode: '11000',
        country: 'CZ',
      };

      const brnoAddress = {
        street: 'Náměstí Svobody 1',
        city: 'Brno',
        postalCode: '60200',
        country: 'CZ',
      };

      const deliveryDate = new Date('2024-12-25');

      const pragueFee = calculateDeliveryFee(pragueAddress, deliveryDate, false);
      const brnoFee = calculateDeliveryFee(brnoAddress, deliveryDate, false);

      expect(pragueFee).toBeGreaterThan(0);
      expect(brnoFee).toBeGreaterThan(0);
      // Brno might have different rates than Prague
    });

    it('handles weekend delivery surcharge', () => {
      const address = {
        street: 'Václavské náměstí 1',
        city: 'Praha',
        postalCode: '11000',
        country: 'CZ',
      };

      const weekdayDate = new Date('2024-12-23'); // Monday
      const weekendDate = new Date('2024-12-28'); // Saturday

      const weekdayFee = calculateDeliveryFee(address, weekdayDate, false);
      const weekendFee = calculateDeliveryFee(address, weekendDate, false);

      // Weekend delivery might have surcharge
      expect(weekendFee).toBeGreaterThanOrEqual(weekdayFee);
    });
  });

  describe('applyDiscounts', () => {
    it('applies percentage discount', () => {
      const originalPrice = 1000;
      const discount = {
        type: 'percentage' as const,
        value: 10, // 10%
        code: 'SAVE10',
      };

      const result = applyDiscounts(originalPrice, [discount]);
      expect(result.finalPrice).toBe(900);
      expect(result.totalDiscount).toBe(100);
    });

    it('applies fixed amount discount', () => {
      const originalPrice = 1000;
      const discount = {
        type: 'fixed' as const,
        value: 150,
        code: 'SAVE150',
      };

      const result = applyDiscounts(originalPrice, [discount]);
      expect(result.finalPrice).toBe(850);
      expect(result.totalDiscount).toBe(150);
    });

    it('applies multiple discounts', () => {
      const originalPrice = 1000;
      const discounts = [
        {
          type: 'percentage' as const,
          value: 10, // 10%
          code: 'SAVE10',
        },
        {
          type: 'fixed' as const,
          value: 50,
          code: 'EXTRA50',
        },
      ];

      const result = applyDiscounts(originalPrice, discounts);
      expect(result.finalPrice).toBe(800); // 1000 - 100 - 50
      expect(result.totalDiscount).toBe(200);
    });

    it('ensures final price is not negative', () => {
      const originalPrice = 100;
      const discount = {
        type: 'fixed' as const,
        value: 200,
        code: 'HUGE_DISCOUNT',
      };

      const result = applyDiscounts(originalPrice, [discount]);
      expect(result.finalPrice).toBe(0);
      expect(result.totalDiscount).toBe(100); // Only actual discount applied
    });

    it('handles empty discounts array', () => {
      const originalPrice = 1000;
      const discounts: any[] = [];

      const result = applyDiscounts(originalPrice, discounts);
      expect(result.finalPrice).toBe(1000);
      expect(result.totalDiscount).toBe(0);
    });

    it('handles invalid discount values', () => {
      const originalPrice = 1000;
      const discount = {
        type: 'percentage' as const,
        value: -10, // Negative percentage
        code: 'INVALID',
      };

      const result = applyDiscounts(originalPrice, [discount]);
      expect(result.finalPrice).toBe(1000); // No discount applied
      expect(result.totalDiscount).toBe(0);
    });
  });
});

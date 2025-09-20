import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductDetail } from '../ProductDetail';
import { useCart } from '@/lib/cart/context';
import { useTranslations } from 'next-intl';

// Mock dependencies
jest.mock('@/lib/cart/context');
jest.mock('next-intl');
jest.mock('@/lib/utils/price-calculator', () => ({
  calculateFinalPrice: jest.fn((basePrice) => basePrice),
}));
jest.mock('@/components/dynamic', () => ({
  LazyProductCustomizer: ({ onCustomizationChange }: any) => (
    <div data-testid="customizer">
      <button onClick={() => onCustomizationChange([])}>Customize</button>
    </div>
  ),
}));

const mockProduct = {
  id: 'test-product',
  name: { cs: 'Test Product', en: 'Test Product' },
  description: { cs: 'Test Description', en: 'Test Description' },
  basePrice: 1000,
  images: [
    {
      id: 'img1',
      url: '/test-image.jpg',
      alt: 'Test Image',
      isPrimary: true,
    },
  ],
  customizationOptions: [],
  availability: {
    inStock: true,
    leadTimeHours: 24,
    maxOrderQuantity: 5,
  },
  category: {
    id: 'cat1',
    name: { cs: 'Test Category', en: 'Test Category' },
    slug: 'test-category',
  },
  featured: false,
};

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

describe('ProductDetail', () => {
  const mockAddToCart = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      addToCart: mockAddToCart,
      state: { items: [], totalItems: 0, totalPrice: 0 },
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      isLoading: false,
    });

    mockUseTranslations.mockReturnValue(mockT);
    mockAddToCart.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductDetail product={mockProduct} locale="en" />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles quantity changes correctly', () => {
    render(<ProductDetail product={mockProduct} locale="en" />);

    const quantityInput = screen.getByRole('spinbutton');
    expect(quantityInput).toHaveValue(1);

    // Test increase quantity
    const increaseButton = screen.getByLabelText('increaseQuantity');
    fireEvent.click(increaseButton);
    expect(quantityInput).toHaveValue(2);

    // Test decrease quantity
    const decreaseButton = screen.getByLabelText('decreaseQuantity');
    fireEvent.click(decreaseButton);
    expect(quantityInput).toHaveValue(1);
  });

  it('handles add to cart functionality', async () => {
    render(<ProductDetail product={mockProduct} locale="en" />);

    const addToCartButton = screen.getByRole('button', { name: /addToCart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith({
        productId: 'test-product',
        quantity: 1,
        customizations: [],
      });
    });
  });

  it('preserves customization functionality', () => {
    const productWithCustomization = {
      ...mockProduct,
      customizationOptions: [
        {
          id: 'opt1',
          name: { cs: 'Option 1', en: 'Option 1' },
          required: false,
          choices: [],
        },
      ],
    };

    render(<ProductDetail product={productWithCustomization} locale="en" />);

    expect(screen.getByTestId('customizer')).toBeInTheDocument();
  });

  it('handles out of stock products correctly', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: {
        ...mockProduct.availability,
        inStock: false,
      },
    };

    render(<ProductDetail product={outOfStockProduct} locale="en" />);

    const addToCartButton = screen.getByRole('button', { name: /outOfStock/i });
    expect(addToCartButton).toBeDisabled();
  });

  it('respects maximum order quantity', () => {
    render(<ProductDetail product={mockProduct} locale="en" />);

    const quantityInput = screen.getByRole('spinbutton');
    const increaseButton = screen.getByLabelText('increaseQuantity');

    // Increase to maximum
    for (let i = 1; i < 5; i++) {
      fireEvent.click(increaseButton);
    }

    expect(quantityInput).toHaveValue(5);
    expect(increaseButton).toBeDisabled();
  });
});

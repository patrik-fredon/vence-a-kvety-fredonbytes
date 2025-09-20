import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

// Mock cart context
jest.mock('@/lib/cart/context', () => ({
  useCart: jest.fn(),
}));

// Mock ProductTeaser component
jest.mock('../ProductTeaser', () => {
  return function MockProductTeaser({ product, onAddToCart, loading }: any) {
    return (
      <div data-testid={`product-teaser-${product.id}`}>
        <h3>{product.name.en}</h3>
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={loading}
          data-testid={`add-to-cart-${product.id}`}
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    );
  };
});

// Mock LoadingSpinner
jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// Import after mocks
import { useTranslations } from 'next-intl';
import { useCart } from '@/lib/cart/context';

// Import the actual component
const { RandomProductTeasers } = require('../RandomProductTeasers');

const mockTranslations = {
  'featuredProducts.title': 'Featured Funeral Wreaths',
  'featuredProducts.viewAll': 'View All Wreaths',
  'tryAgain': 'Try Again',
  'noProducts': 'No products are currently available.',
};

const mockProducts = [
  {
    id: 'product-1',
    name: { cs: 'Věnec 1', en: 'Wreath 1' },
    slug: 'wreath-1',
    basePrice: 1500,
    images: [],
    availability: { inStock: true },
  },
  {
    id: 'product-2',
    name: { cs: 'Věnec 2', en: 'Wreath 2' },
    slug: 'wreath-2',
    basePrice: 2000,
    images: [],
    availability: { inStock: true },
  },
  {
    id: 'product-3',
    name: { cs: 'Věnec 3', en: 'Wreath 3' },
    slug: 'wreath-3',
    basePrice: 2500,
    images: [],
    availability: { inStock: true },
  },
];

// Mock fetch
global.fetch = jest.fn();

describe('RandomProductTeasers', () => {
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslations as jest.Mock).mockReturnValue((key: string) => mockTranslations[key as keyof typeof mockTranslations] || key);
    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        products: mockProducts,
      }),
    });
  });

  it('renders loading state initially', () => {
    render(<RandomProductTeasers locale="en" count={3} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('fetches and displays random products', async () => {
    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Featured Funeral Wreaths')).toBeInTheDocument();
    });

    expect(screen.getByTestId('product-teaser-product-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-teaser-product-2')).toBeInTheDocument();
    expect(screen.getByTestId('product-teaser-product-3')).toBeInTheDocument();

    expect(screen.getByText('Wreath 1')).toBeInTheDocument();
    expect(screen.getByText('Wreath 2')).toBeInTheDocument();
    expect(screen.getByText('Wreath 3')).toBeInTheDocument();
  });

  it('makes API call with correct parameters', async () => {
    render(<RandomProductTeasers locale="cs" count={5} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/products/random?count=5&locale=cs');
    });
  });

  it('uses default count of 3 when not specified', async () => {
    render(<RandomProductTeasers locale="en" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/products/random?count=3&locale=en');
    });
  });

  it('displays error message when API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('displays error message when API returns error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: 'Database connection failed',
      }),
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
  });

  it('displays no products message when empty array returned', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        products: [],
      }),
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('No products are currently available.')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });
  });

  it('calls addToCart when product add to cart is clicked', async () => {
    mockAddToCart.mockResolvedValue(true);

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-teaser-product-1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByTestId('add-to-cart-product-1');
    fireEvent.click(addToCartButton);

    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: 'product-1',
      quantity: 1,
      customizations: [],
    });
  });

  it('shows loading state for individual product during add to cart', async () => {
    mockAddToCart.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-teaser-product-1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByTestId('add-to-cart-product-1');
    fireEvent.click(addToCartButton);

    // Should show loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });
  });

  it('handles add to cart failure gracefully', async () => {
    mockAddToCart.mockResolvedValue(false);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-teaser-product-1')).toBeInTheDocument();
    });

    const addToCartButton = screen.getByTestId('add-to-cart-product-1');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to add product to cart');
    });

    consoleSpy.mockRestore();
  });

  it('renders view all products link with correct locale', async () => {
    render(<RandomProductTeasers locale="cs" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Featured Funeral Wreaths')).toBeInTheDocument();
    });

    const viewAllLink = screen.getByText('View All Wreaths');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/cs/products');
  });

  it('reloads page when try again button is clicked', async () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<RandomProductTeasers locale="en" count={3} />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));
    expect(mockReload).toHaveBeenCalled();
  });
});

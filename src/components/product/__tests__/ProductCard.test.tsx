import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../ProductCard';
import { Product } from '@/types/product';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, params?: any) => {
    const translations: Record<string, Record<string, string>> = {
      product: {
        addToCart: 'Přidat do košíku',
        customize: 'Přizpůsobit',
        outOfStock: 'Vyprodáno',
        limitedStock: 'Omezená zásoba',
        inStock: 'Skladem',
      },
      currency: {
        format: `${params?.amount} Kč`,
      },
    };
    return translations[namespace]?.[key] || key;
  },
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        {...props}
      />
    );
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockProduct: Product = {
  id: '1',
  nameCs: 'Pohřební věnec',
  nameEn: 'Funeral Wreath',
  name: { cs: 'Pohřební věnec', en: 'Funeral Wreath' },
  description: { cs: 'Krásný pohřební věnec', en: 'Beautiful funeral wreath' },
  slug: 'funeral-wreath',
  basePrice: 1500,
  category: {
    id: 'cat1',
    nameCs: 'Věnce',
    nameEn: 'Wreaths',
    name: { cs: 'Věnce', en: 'Wreaths' },
    slug: 'wreaths',
    description: { cs: '', en: '' },
    parentId: undefined,
    sortOrder: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  images: [
    {
      id: 'img1',
      url: '/test-image.jpg',
      alt: 'Test image',
      isPrimary: true,
      sortOrder: 0,
    },
    {
      id: 'img2',
      url: '/test-image-2.jpg',
      alt: 'Test image 2',
      isPrimary: false,
      sortOrder: 1,
    },
  ],
  customizationOptions: [],
  availability: {
    inStock: true,
    stockQuantity: 10,
    estimatedRestockDate: new Date(),
  },
  seoMetadata: {
    title: { cs: '', en: '' },
    description: { cs: '', en: '' },
    keywords: { cs: [], en: [] },
  },
  active: true,
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductCard', () => {
  const defaultProps = {
    product: mockProduct,
    locale: 'cs',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductCard {...defaultProps} />);

    expect(screen.getByText('Pohřební věnec')).toBeInTheDocument();
    expect(screen.getByText('Krásný pohřební věnec')).toBeInTheDocument();
    expect(screen.getByText('1 500 Kč')).toBeInTheDocument();
    expect(screen.getByText('Věnce')).toBeInTheDocument();
  });

  it('displays English content when locale is en', () => {
    render(<ProductCard {...defaultProps} locale="en" />);

    expect(screen.getByText('Funeral Wreath')).toBeInTheDocument();
    expect(screen.getByText('Beautiful funeral wreath')).toBeInTheDocument();
  });

  it('shows availability status correctly', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Skladem')).toBeInTheDocument();
  });

  it('shows limited stock when quantity is low', () => {
    const lowStockProduct = {
      ...mockProduct,
      availability: { ...mockProduct.availability, stockQuantity: 3 },
    };

    render(<ProductCard {...defaultProps} product={lowStockProduct} />);
    expect(screen.getByText('Omezená zásoba')).toBeInTheDocument();
  });

  it('shows out of stock when not available', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: { ...mockProduct.availability, inStock: false },
    };

    render(<ProductCard {...defaultProps} product={outOfStockProduct} />);
    expect(screen.getByText('Vyprodáno')).toBeInTheDocument();
  });

  it('displays featured badge when product is featured', () => {
    const featuredProduct = { ...mockProduct, featured: true };

    render(<ProductCard {...defaultProps} product={featuredProduct} />);
    expect(screen.getByText('⭐ Featured')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();

    render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />);

    const addToCartButton = screen.getByText('Přidat do košíku');
    await user.click(addToCartButton);

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('does not show add to cart button when product is out of stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      availability: { ...mockProduct.availability, inStock: false },
    };

    render(
      <ProductCard
        {...defaultProps}
        product={outOfStockProduct}
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.queryByText('Přidat do košíku')).not.toBeInTheDocument();
  });

  it('shows hover overlay with quick actions on mouse enter', async () => {
    const user = userEvent.setup();
    const onAddToCart = jest.fn();

    render(<ProductCard {...defaultProps} onAddToCart={onAddToCart} />);

    const productCard = screen.getByRole('article');
    await user.hover(productCard);

    expect(screen.getByText('Přizpůsobit')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ProductCard {...defaultProps} />);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'product-1-title');

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveAttribute('id', 'product-1-title');

    const availabilityStatus = screen.getByRole('status');
    expect(availabilityStatus).toHaveAttribute('aria-label', 'Dostupnost: Skladem');
  });

  it('handles image loading states', async () => {
    render(<ProductCard {...defaultProps} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();

    // Simulate image load
    fireEvent.load(image);

    await waitFor(() => {
      expect(image).not.toHaveClass('blur-sm');
    });
  });

  it('links to product detail page', () => {
    render(<ProductCard {...defaultProps} />);

    const productLinks = screen.getAllByRole('link');
    const detailLink = productLinks.find(link =>
      link.getAttribute('href') === '/cs/products/funeral-wreath'
    );

    expect(detailLink).toBeInTheDocument();
  });
});

/**
 * Basic accessibility tests
 */

import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Basic Accessibility', () => {
  describe('Button Component', () => {
    it('should render with proper accessibility attributes', () => {
      render(<Button>Test Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });

    it('should have proper disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show loading state with screen reader text', () => {
      render(<Button loading loadingText="Loading...">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      // Check for screen reader text
      const loadingTexts = screen.getAllByText('Loading...');
      const screenReaderText = loadingTexts.find(el => el.classList.contains('sr-only'));
      expect(screenReaderText).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('should render with proper label association', () => {
      render(<Input label="Email Address" id="email" />);

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address');

      expect(input).toHaveAttribute('id', 'email');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('should show error state with proper ARIA attributes', () => {
      render(
        <Input
          label="Email"
          id="email"
          error="Invalid email format"
        />
      );

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveTextContent('Invalid email format');
    });

    it('should indicate required fields', () => {
      render(<Input label="Required Field" required />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('should use proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
        </div>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subsection Title');
    });

    it('should provide meaningful labels for interactive elements', () => {
      render(
        <div>
          <button aria-label="Close dialog">×</button>
          <input aria-label="Search products" placeholder="Search..." />
          <img src="/test.jpg" alt="Product image" />
        </div>
      );

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Search products')).toBeInTheDocument();
      expect(screen.getByAltText('Product image')).toBeInTheDocument();
    });
  });
});

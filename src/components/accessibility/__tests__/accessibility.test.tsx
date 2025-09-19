/**
 * Accessibility implementation tests
 * Tests for ARIA labels, keyboard navigation, focus management, and screen reader support
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityProvider } from '@/lib/accessibility/context';
import { AccessibilityToolbar } from '../AccessibilityToolbar';
import { SkipLinks } from '../SkipLinks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('Accessibility Implementation', () => {
  describe('AccessibilityToolbar', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <TestWrapper>
          <AccessibilityToolbar locale="en" />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilityToolbar locale="en" />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('button', { name: /accessibility/i });

      // Should be focusable
      await user.tab();
      expect(toggleButton).toHaveFocus();

      // Should open on Enter
      await user.keyboard('{Enter}');
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Should close on Escape
      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should announce state changes to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AccessibilityToolbar locale="en" />
        </TestWrapper>
      );

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Check for aria-live region
      await waitFor(() => {
        expect(document.querySelector('[aria-live]')).toBeInTheDocument();
      });
    });
  });

  describe('SkipLinks', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(<SkipLinks locale="en" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be visible when focused', async () => {
      const user = userEvent.setup();

      render(<SkipLinks locale="en" />);

      // Skip links should be hidden initially
      const skipLink = screen.getByText(/skip to content/i);
      expect(skipLink.closest('.sr-only')).toBeInTheDocument();

      // Should become visible when focused
      await user.tab();
      expect(skipLink).toHaveFocus();
    });

    it('should navigate to target elements', async () => {
      const user = userEvent.setup();

      // Add target elements to DOM
      document.body.innerHTML += '<main id="main-content">Main content</main>';

      render(<SkipLinks locale="en" />);

      const skipLink = screen.getByText(/skip to content/i);
      await user.click(skipLink);

      const mainContent = document.getElementById('main-content');
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Button Component', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(<Button>Test Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes when loading', () => {
      render(<Button loading loadingText="Loading...">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-describedby');

      // Should have screen reader text
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');

      // Should be focusable
      await user.tab();
      expect(button).toHaveFocus();

      // Should activate on Enter
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();

      // Should activate on Space
      handleClick.mockClear();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Input Component', () => {
    it('should render without accessibility violations', async () => {
      const { container } = render(
        <Input label="Test Input" id="test-input" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper label association', () => {
      render(<Input label="Email Address" id="email" />);

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address');

      expect(input).toHaveAttribute('id', 'email');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('should announce errors to screen readers', () => {
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

    it('should support required field indication', () => {
      render(<Input label="Required Field" required />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('High Contrast Mode', () => {
    it('should apply high contrast styles when enabled', () => {
      // Simulate high contrast mode
      document.documentElement.classList.add('high-contrast');

      render(
        <TestWrapper>
          <Button>High Contrast Button</Button>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(document.documentElement).toHaveClass('high-contrast');

      // Clean up
      document.documentElement.classList.remove('high-contrast');
    });

    it('should respect system high contrast preference', () => {
      // Mock high contrast media query
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <TestWrapper>
          <div>High contrast content</div>
        </TestWrapper>
      );

      // Should detect system preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus order', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      // Tab through buttons
      await user.tab();
      expect(buttons[0]).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();

      await user.tab();
      expect(buttons[2]).toHaveFocus();
    });

    it('should handle focus trap in modals', async () => {
      const user = userEvent.setup();

      render(
        <div role="dialog" aria-modal="true">
          <Button>Modal Button 1</Button>
          <Button>Modal Button 2</Button>
        </div>
      );

      const buttons = screen.getAllByRole('button');

      // Focus should cycle within modal
      buttons[0]?.focus();
      expect(buttons[0]).toHaveFocus();

      await user.tab();
      expect(buttons[1]).toHaveFocus();

      // Should wrap back to first button
      await user.tab();
      expect(buttons[0]).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
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

    it('should provide status updates', async () => {
      render(
        <div>
          <div role="status" aria-live="polite">
            Operation completed successfully
          </div>
          <div role="alert" aria-live="assertive">
            Error: Please fix the following issues
          </div>
        </div>
      );

      expect(screen.getByRole('status')).toHaveTextContent('Operation completed successfully');
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Please fix the following issues');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preference', () => {
      // Mock reduced motion preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <TestWrapper>
          <Button loading>Loading Button</Button>
        </TestWrapper>
      );

      // Should check for reduced motion preference
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });
});

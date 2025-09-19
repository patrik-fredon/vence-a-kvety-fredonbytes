/**
 * FAQ Accordion component tests
 * Tests for accordion functionality, accessibility, and content display
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQAccordion } from '../FAQAccordion';

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ChevronDownIcon: ({ className }: { className: string }) => (
    <div className={className} data-testid="chevron-down">↓</div>
  ),
  ChevronUpIcon: ({ className }: { className: string }) => (
    <div className={className} data-testid="chevron-up">↑</div>
  ),
}));

const mockFAQItems = [
  {
    question: "Jak správně skladovat a pečovat o pohřební věnec?",
    answer: "Pokud si přejete věnec doručit den nebo dva před obřadem, doporučujeme jej nechat vodorovně uložený v původní krabici. Zajistíte tak, že voda z korpusu věnce neodteče. Žádná další péče není nutná – věnec je dostatečně nasycen vodou a květiny jsou ošetřeny pro co nejdelší výdrž."
  },
  {
    question: "Jak dlouho zůstanou květiny v pohřebním věnci čerstvé?",
    answer: "Výdrž květin závisí na povětrnostních podmínkách. Obecně platí, že čím kratší stonek, tím delší výdrž. Smuteční věnce jsou určeny k vystavení na pietním místě. V létě při vysokých teplotách vydrží věnec krásný po dobu jednoho týdne, v chladnějším období může vydržet až dva týdny."
  },
  {
    question: "Co dělat s věncem po uvadnutí květin?",
    answer: "Doporučujeme ekologickou recyklaci. Květiny z věnce vyhoďte do sběrné popelnice určené pro bio odpad a korpus věnce do sběru plastů. Společně tak šetříme přírodu a dbáme na odpovědné nakládání s materiály."
  }
];

describe('FAQAccordion', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all FAQ items', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      mockFAQItems.forEach(item => {
        expect(screen.getByText(item.question)).toBeInTheDocument();
      });
    });

    it('should render questions as buttons', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(mockFAQItems.length);

      buttons.forEach((button, index) => {
        expect(button).toHaveTextContent(mockFAQItems[index].question);
      });
    });

    it('should initially hide all answers', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const answerContainers = screen.getAllByRole('region');
      answerContainers.forEach(container => {
        expect(container).toHaveClass('max-h-0', 'opacity-0', 'overflow-hidden');
      });
    });

    it('should display chevron down icons initially', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const chevronDowns = screen.getAllByTestId('chevron-down');
      expect(chevronDowns).toHaveLength(mockFAQItems.length);
    });
  });

  describe('Accordion Functionality', () => {
    it('should expand item when clicked', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      await waitFor(() => {
        expect(screen.getByText(mockFAQItems[0].answer)).toBeVisible();
      });
    });

    it('should collapse item when clicked again', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];

      // Expand
      await user.click(firstButton);
      await waitFor(() => {
        expect(screen.getByText(mockFAQItems[0].answer)).toBeVisible();
      });

      // Collapse
      await user.click(firstButton);
      await waitFor(() => {
        const firstAnswerContainer = screen.getAllByRole('region')[0];
        expect(firstAnswerContainer).toHaveClass('max-h-0', 'opacity-0', 'overflow-hidden');
      });
    });

    it('should allow multiple items to be open simultaneously', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const buttons = screen.getAllByRole('button');

      // Open first two items
      await user.click(buttons[0]);
      await user.click(buttons[1]);

      await waitFor(() => {
        expect(screen.getByText(mockFAQItems[0].answer)).toBeVisible();
        expect(screen.getByText(mockFAQItems[1].answer)).toBeVisible();
      });
    });

    it('should toggle chevron icons when expanding/collapsing', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];

      // Initially should show chevron down
      expect(screen.getAllByTestId('chevron-down')[0]).toBeInTheDocument();

      // Click to expand
      await user.click(firstButton);

      await waitFor(() => {
        expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should expand item when Enter key is pressed', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      fireEvent.keyDown(firstButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(mockFAQItems[0].answer)).toBeVisible();
      });
    });

    it('should expand item when Space key is pressed', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      fireEvent.keyDown(firstButton, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByText(mockFAQItems[0].answer)).toBeVisible();
      });
    });

    it('should not expand item for other keys', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      fireEvent.keyDown(firstButton, { key: 'Tab' });

      // Should remain collapsed
      const firstAnswerContainer = screen.getAllByRole('region')[0];
      expect(firstAnswerContainer).toHaveClass('max-h-0', 'opacity-0', 'overflow-hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`);
        expect(button).toHaveAttribute('id', `faq-question-${index}`);
      });
    });

    it('should update aria-expanded when item is opened', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];

      expect(firstButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(firstButton);

      await waitFor(() => {
        expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper region roles for answers', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const regions = screen.getAllByRole('region');
      expect(regions).toHaveLength(mockFAQItems.length);

      regions.forEach((region, index) => {
        expect(region).toHaveAttribute('id', `faq-answer-${index}`);
        expect(region).toHaveAttribute('aria-labelledby', `faq-question-${index}`);
      });
    });

    it('should have proper heading structure', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(mockFAQItems.length);

      headings.forEach((heading, index) => {
        expect(heading).toHaveTextContent(mockFAQItems[index].question);
      });
    });
  });

  describe('Styling and Animation', () => {
    it('should have proper CSS classes for closed state', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const answerContainers = screen.getAllByRole('region');

      answerContainers.forEach(container => {
        expect(container).toHaveClass('max-h-0', 'opacity-0', 'overflow-hidden');
      });
    });

    it('should have proper CSS classes for open state', async () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const firstButton = screen.getAllByRole('button')[0];
      await user.click(firstButton);

      await waitFor(() => {
        const firstAnswerContainer = screen.getAllByRole('region')[0];
        expect(firstAnswerContainer).toHaveClass('max-h-96', 'opacity-100');
        expect(firstAnswerContainer).not.toHaveClass('overflow-hidden');
      });
    });

    it('should have hover and focus styles', () => {
      render(<FAQAccordion items={mockFAQItems} />);

      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveClass('hover:bg-neutral-50');
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      render(<FAQAccordion items={[]} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should handle items with empty strings', () => {
      const emptyItems = [
        { question: '', answer: '' },
        { question: 'Valid question', answer: 'Valid answer' }
      ];

      render(<FAQAccordion items={emptyItems} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      expect(buttons[1]).toHaveTextContent('Valid question');
    });

    it('should handle very long content', () => {
      const longItems = [
        {
          question: 'A'.repeat(200),
          answer: 'B'.repeat(1000)
        }
      ];

      render(<FAQAccordion items={longItems} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('A'.repeat(200));
    });
  });
});

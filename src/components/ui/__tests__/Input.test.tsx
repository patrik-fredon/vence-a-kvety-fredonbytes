import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input', () => {
  it('renders basic input correctly', () => {
    render(<Input label="Test Input" id="test" />);

    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test');
    expect(screen.getByRole('textbox')).toHaveClass('border-stone-300');
  });

  it('associates label with input correctly', () => {
    render(<Input label="Email Address" id="email" />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email Address');

    expect(input).toHaveAttribute('id', 'email');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('shows required indicator when required', () => {
    render(<Input label="Required Field" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true');
  });

  it('displays error message correctly', () => {
    render(<Input label="Email" error="Invalid email format" />);

    const input = screen.getByRole('textbox');
    const errorMessage = screen.getByRole('alert');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveClass('border-error-500');
    expect(errorMessage).toHaveTextContent('Invalid email format');
    expect(errorMessage).toHaveClass('text-error-600');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Input label="Test Input" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(onChange).toHaveBeenCalled();
  });

  it('supports different input types', () => {
    render(<Input label="Password" type="password" />);

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('shows placeholder text', () => {
    render(<Input label="Search" placeholder="Enter search term..." />);

    expect(screen.getByPlaceholderText('Enter search term...')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input label="Disabled Input" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-stone-50');
  });

  it('applies custom className', () => {
    render(<Input label="Custom Input" className="custom-class" />);

    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('supports help text', () => {
    render(<Input label="Password" helpText="Must be at least 8 characters" />);

    const helpText = screen.getByText('Must be at least 8 characters');
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveClass('text-stone-600');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(<Input label="Test Input" onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByRole('textbox');

    await user.click(input);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('renders with icons', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;

    const { rerender } = render(
      <Input label="Search" icon={<TestIcon />} iconPosition="left" />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pl-10');

    rerender(
      <Input label="Search" icon={<TestIcon />} iconPosition="right" />
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('pr-10');
  });

  it('has proper accessibility attributes', () => {
    render(<Input label="Accessible Input" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('high-contrast:border-2', 'high-contrast:border-ButtonText');
  });

  it('generates unique IDs when not provided', () => {
    render(
      <div>
        <Input label="Input 1" />
        <Input label="Input 2" />
      </div>
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('id');
    expect(inputs[1]).toHaveAttribute('id');
    expect(inputs[0].getAttribute('id')).not.toBe(inputs[1].getAttribute('id'));
  });
});

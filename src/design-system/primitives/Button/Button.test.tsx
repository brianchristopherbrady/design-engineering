import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonAppearances, buttonDefaults } from './Button';

describe('Button', () => {
  it('renders a native button that defaults to type="button" and the default appearance', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain(buttonDefaults.appearance);
  });

  it.each(buttonAppearances)('applies the %s appearance class', (appearance) => {
    render(<Button appearance={appearance}>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' }).className).toContain(appearance);
  });

  it('keeps focus and the accessible name while loading, but ignores activation', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick} iconStart={<svg />}>
        Publish
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Publish' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    button.focus();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });

  it('maps radius to a token custom property only when set', () => {
    const { rerender } = render(<Button>Edit</Button>);
    expect(screen.getByRole('button').style.getPropertyValue('--_radius')).toBe('');
    rerender(<Button radius="full">Edit</Button>);
    expect(screen.getByRole('button').style.getPropertyValue('--_radius')).toBe('var(--radius-full)');
  });

  it('hides icon wrappers from assistive technology', () => {
    render(<Button iconEnd={<svg data-testid="icon" />}>Next</Button>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  // jsdom does not activate <summary> from the keyboard; Enter and Space are covered in e2e/patterns.spec.ts.
  it('is a tab stop, toggles and reports the change', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <Disclosure summary="Source" onOpenChange={onOpenChange}>
        Panel content
      </Disclosure>,
    );
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);

    await user.tab();
    expect(screen.getByText('Source').closest('summary')).toHaveFocus();
    await user.click(screen.getByText('Source'));
    expect(details.open).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.click(screen.getByText('Source'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('renders lazy content only while open', async () => {
    const user = userEvent.setup();
    render(
      <Disclosure summary="Rendered HTML" lazy>
        Expensive content
      </Disclosure>,
    );
    expect(screen.queryByText('Expensive content')).not.toBeInTheDocument();
    await user.click(screen.getByText('Rendered HTML'));
    expect(await screen.findByText('Expensive content')).toBeInTheDocument();
  });

  it('starts open with defaultOpen and passes native attributes through', () => {
    const { container } = render(
      <Disclosure summary="Details" defaultOpen lazy id="details" name="group">
        Visible
      </Disclosure>,
    );
    const details = container.querySelector('details')!;
    expect(details.open).toBe(true);
    expect(details).toHaveAttribute('id', 'details');
    expect(details).toHaveAttribute('name', 'group');
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('keeps the decorative marker out of the accessible name', () => {
    const { container } = render(<Disclosure summary="Source">x</Disclosure>);
    expect(container.querySelector('summary svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

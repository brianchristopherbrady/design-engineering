import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

function Harness({ onClose = () => undefined }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Archive entry?"
        description="It disappears from the directory."
        radius="small"
        footer={<button type="button">Confirm</button>}
      >
        Body text
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('is labelled by its title, described by its description, and focuses the first control', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Archive entry?' });
    expect(dialog).toHaveAccessibleDescription('It disappears from the directory.');
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(dialog.style.getPropertyValue('--_radius')).toBe('var(--radius-sm)');
  });

  it('closes on Escape through onClose and restores focus to the opener', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <StrictMode>
        <Harness onClose={onClose} />
      </StrictMode>,
    );
    const opener = screen.getByRole('button', { name: 'Open' });
    await user.click(opener);
    screen.getByRole('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('closes from the close button', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup } from './RadioGroup';

const options = [
  { value: 'email', label: 'Email', description: 'Updates in your inbox.' },
  { value: 'text', label: 'Text message' },
  { value: 'call', label: 'Phone call', disabled: true },
];

describe('RadioGroup', () => {
  it('names the group with its legend and each radio with its label and description', () => {
    render(<RadioGroup legend="Contact method" description="Pick one." options={options} />);
    const group = screen.getByRole('radiogroup', { name: 'Contact method' });
    expect(group).toHaveAccessibleDescription('Pick one.');
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveAccessibleDescription('Updates in your inbox.');
  });

  it('selects with the arrow keys after one Tab stop and reports the value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup legend="Contact method" options={options} defaultValue="email" onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Text message' })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('text');
  });

  it('announces an error with the group and marks the group invalid', () => {
    render(<RadioGroup legend="Contact method" options={options} required error="Choose a contact method." />);
    const group = screen.getByRole('radiogroup', { name: /Contact method/ });
    expect(group).toHaveAccessibleDescription('Choose a contact method.');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('radio', { name: 'Email' })).toBeRequired();
  });

  it('keeps disabled options visible but not selectable', () => {
    render(<RadioGroup legend="Contact method" options={options} />);
    expect(screen.getByRole('radio', { name: 'Phone call' })).toBeDisabled();
  });

  it('submits its value under the given name', () => {
    render(
      <form data-testid="form">
        <RadioGroup legend="Contact method" name="contact" options={options} defaultValue="text" />
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data.get('contact')).toBe('text');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input, Select } from '../../primitives';
import { Field } from './Field';

describe('Field', () => {
  it('gives the control an accessible name from the visible label', () => {
    render(<Field label="Display name">{(control) => <Input {...control} />}</Field>);
    expect(screen.getByRole('textbox', { name: 'Display name' })).toBeInTheDocument();
  });

  it('describes the control with the description and the error, and marks it invalid', () => {
    render(
      <Field label="Display name" description="2–40 characters." error="Use at least 2 characters.">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Display name' });
    expect(input).toHaveAccessibleDescription('2–40 characters. Use at least 2 characters.');
    expect(input).toBeInvalid();
  });

  it('does not mark the control invalid when there is no error', () => {
    render(
      <Field label="Display name" description="2–40 characters.">
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Display name' });
    expect(input).toBeValid();
    expect(input).toHaveAccessibleDescription('2–40 characters.');
  });

  it('marks the control required without repeating “required” in its name', () => {
    render(
      <Field label="Display name" required>
        {(control) => <Input {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Display name' });
    expect(input).toBeRequired();
  });

  it('wires any native control, such as a select', () => {
    render(
      <Field label="Topic" error="Choose a topic.">
        {(control) => (
          <Select {...control}>
            <option value="">Choose</option>
          </Select>
        )}
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Topic' })).toHaveAccessibleDescription('Choose a topic.');
  });

  it('uses a provided id so other elements can link to the control', () => {
    render(
      <Field label="Email" id="email-field">
        {(control) => <Input {...control} />}
      </Field>,
    );
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('id', 'email-field');
  });
});

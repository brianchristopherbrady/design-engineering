import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { defaultPreview, type PlaygroundConfig } from './config';
import { initialValues, presetOf, presetValues } from './engine';
import { Playground } from './Playground';
import { defineStory, type PropApi } from './types';

interface SampleProps {
  label?: string;
  tone?: 'neutral' | 'brand';
  scope?: 'inherited' | 'own';
  fullWidth?: boolean;
  disabled?: boolean;
}

const story = defineStory<SampleProps>({
  id: 'sample',
  component: 'Sample',
  summary: 'A sample component.',
  imports: [],
  controls: [
    { kind: 'text', prop: 'label', defaultValue: 'Save', description: 'Visible label.' },
    { kind: 'select', prop: 'tone', options: ['neutral', 'brand'], defaultValue: 'neutral', description: 'Color role.' },
    { kind: 'select', prop: 'scope', options: ['own'], defaultValue: 'own', unsetLabel: 'parent scope', unsetKind: 'inherit', description: 'Where it comes from.' },
    { kind: 'switch', prop: 'fullWidth', defaultValue: false, description: 'Fill the width.' },
    { kind: 'switch', prop: 'disabled', defaultValue: false, description: 'Native disabled.' },
  ],
  presets: [
    { name: 'Brand', values: { tone: 'brand', label: 'Publish' } },
    { name: 'Wide', values: { fullWidth: true } },
  ],
  render: ({ label, fullWidth, disabled }) => (
    <button type="button" disabled={disabled} data-full-width={fullWidth}>
      {label}
    </button>
  ),
});

const api: PropApi[] = [
  { name: 'tone', type: '"neutral" | "brand"', defaultValue: '"neutral"' },
  { name: 'scope', type: '"inherited" | "own"', defaultValue: 'inherited' },
  { name: 'fullWidth', type: 'boolean', defaultValue: 'false' },
];

function Harness() {
  const [config, setConfig] = useState<PlaygroundConfig>({ component: story.id, props: initialValues(story), preview: defaultPreview });
  return (
    <Playground
      stories={[story]}
      config={config}
      onConfigChange={setConfig}
      onStoryChange={() => undefined}
      linkFor={() => 'https://example.test/playground'}
      renderLinks={() => null}
      apiFor={() => api}
    />
  );
}

const preview = () => screen.getByTestId('playground-preview');
const snippet = () => screen.getByTestId('playground-snippet');
const radio = (prop: string, value: 'false' | 'true') => within(screen.getByRole('radiogroup', { name: prop })).getByRole('radio', { name: value });

describe('Controls table', () => {
  it('names each control by its prop and describes it with the documentation', () => {
    render(<Harness />);
    const table = screen.getByRole('table', { name: 'Component props' });
    expect(within(table).getByRole('rowheader', { name: /^fullWidth/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'label' })).toHaveAccessibleDescription('Visible label.');
    expect(screen.getByRole('combobox', { name: 'tone' })).toHaveAccessibleDescription('Color role. Default "neutral"');
    // The API default differs from where this example starts, and unset means inheritance.
    expect(screen.getByRole('combobox', { name: 'scope' })).toHaveAccessibleDescription(
      'Where it comes from. Unset: parent scope (inherited) Example starts at "own"',
    );
  });

  it('states both boolean values as radios, with the current one checked', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(radio('fullWidth', 'false')).toBeChecked();
    expect(radio('fullWidth', 'true')).not.toBeChecked();

    await user.click(radio('fullWidth', 'true'));
    expect(radio('fullWidth', 'true')).toBeChecked();
    expect(radio('fullWidth', 'false')).not.toBeChecked();
    expect(within(preview()).getByRole('button')).toHaveAttribute('data-full-width', 'true');
    expect(snippet()).toHaveTextContent('fullWidth={true}');
  });

  it('keeps focus on the control while the keyboard changes values', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    radio('fullWidth', 'false').focus();
    await user.keyboard('{ArrowRight}');
    expect(radio('fullWidth', 'true')).toBeChecked();
    expect(radio('fullWidth', 'true')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(radio('fullWidth', 'false')).toBeChecked();
    expect(radio('fullWidth', 'false')).toHaveFocus();

    const label = screen.getByRole('textbox', { name: 'label' });
    await user.clear(label);
    await user.type(label, 'Go');
    expect(label).toHaveFocus();
    expect(within(preview()).getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('can turn disabled off again after it disables the preview', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(radio('disabled', 'true'));
    expect(within(preview()).getByRole('button')).toBeDisabled();
    await user.click(radio('disabled', 'false'));
    expect(within(preview()).getByRole('button')).toBeEnabled();
  });
});

describe('Preset selector', () => {
  it('shows the preset the props match, and Custom once they match none', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const presets = screen.getByRole('combobox', { name: 'Preset' });
    expect(presets).toHaveValue('');
    expect(within(presets).queryByRole('option', { name: 'Custom' })).toBeNull();

    await user.selectOptions(presets, 'Brand');
    expect(screen.getByRole('combobox', { name: 'tone' })).toHaveValue('brand');
    expect(presets).toHaveDisplayValue('Brand');

    await user.selectOptions(screen.getByRole('combobox', { name: 'tone' }), 'neutral');
    expect(presets).toHaveDisplayValue('Custom');
    expect(within(presets).getByRole('option', { name: 'Custom' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Reset component props' }));
    expect(presets).toHaveDisplayValue('Starting values');
    expect(screen.getByRole('textbox', { name: 'label' })).toHaveValue('Save');
  });

  it('derives the match from the values alone', () => {
    expect(presetOf(story, initialValues(story))).toBe('');
    expect(presetOf(story, presetValues(story, 'Wide'))).toBe('Wide');
    expect(presetOf(story, { ...presetValues(story, 'Wide'), label: 'Other' })).toBeUndefined();
  });
});

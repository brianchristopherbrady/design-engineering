import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { alertTones, dialogSizes, disclosureAppearances } from '@/design-system/composites';
import { gridColumnCounts } from '@/design-system/layout';
import { badgeAppearances, buttonAppearances, buttonBorders, buttonSizes, iconNames } from '@/design-system/primitives';
import { borderScale, elevationScale, radiusScale, spaceScale, surfaceScale, toneScale } from '@/design-system/tokens';
import { findStory, playgroundStories } from '@/content/components';
import { buildProps, buildSnippet, initialValues, presetValues, type AnyControl, type ControlValue } from '@/features/playground';

function isValid(control: AnyControl, value: ControlValue): boolean {
  if (value === undefined) return control.kind !== 'switch';
  switch (control.kind) {
    case 'select':
      return (control.options as readonly ControlValue[]).includes(value);
    case 'switch':
      return typeof value === 'boolean';
    case 'text':
      return typeof value === 'string';
    case 'icon':
      return iconNames.includes(value as (typeof iconNames)[number]);
  }
}

/** The text a control value must contribute to the snippet. */
function expectedInSnippet(control: AnyControl, value: ControlValue): string | null {
  if (value === undefined || (control.kind === 'text' && value === '' && control.prop !== 'children')) return null;
  if (control.prop === 'children') return String(value);
  if (control.kind === 'select') return typeof value === 'number' ? `${control.prop}={${value}}` : `${control.prop}="${String(value)}"`;
  if (control.kind === 'switch') return `${control.prop}={${String(value)}}`;
  if (control.kind === 'icon') return `${control.prop}={<Icon name="${String(value)}" />}`;
  return control.wrap ? String(value) : `${control.prop}="${String(value)}"`;
}

const valueSets = playgroundStories.flatMap((story) => [
  { story, label: `${story.id} initial`, values: initialValues(story) },
  ...story.presets.map((preset) => ({ story, label: `${story.id} / ${preset.name}`, values: presetValues(story, preset.name) })),
]);

describe('playground stories', () => {
  it('use the exported option arrays, so controls cannot drift from the component API', () => {
    const optionsOf = (id: string, prop: string) => {
      const control = findStory(id)?.controls.find((candidate) => candidate.prop === prop);
      return control?.kind === 'select' ? control.options : undefined;
    };
    expect(optionsOf('button', 'appearance')).toBe(buttonAppearances);
    expect(optionsOf('button', 'size')).toBe(buttonSizes);
    expect(optionsOf('button', 'border')).toBe(buttonBorders);
    expect(optionsOf('button', 'radius')).toBe(radiusScale);
    expect(optionsOf('badge', 'tone')).toBe(toneScale);
    expect(optionsOf('badge', 'appearance')).toBe(badgeAppearances);
    expect(optionsOf('card', 'elevation')).toBe(elevationScale);
    expect(optionsOf('card', 'surface')).toBe(surfaceScale);
    expect(optionsOf('card', 'border')).toBe(borderScale);
    expect(optionsOf('dialog', 'size')).toBe(dialogSizes);
    expect(optionsOf('grid', 'gap')).toBe(spaceScale);
    expect(optionsOf('grid', 'columns')).toBe(gridColumnCounts);
    expect(optionsOf('alert', 'tone')).toBe(alertTones);
    expect(optionsOf('disclosure', 'appearance')).toBe(disclosureAppearances);
  });

  it('use "appearance" for the Button background treatment', () => {
    const props = findStory('button')?.controls.map((control) => control.prop);
    expect(props).toContain('appearance');
    expect(props).not.toContain('variant');
  });

  it('have one control per prop and only valid defaults and presets', () => {
    for (const story of playgroundStories) {
      const props = story.controls.map((control) => control.prop);
      expect(new Set(props).size, story.id).toBe(props.length);
      for (const preset of story.presets) {
        for (const prop of Object.keys(preset.values)) expect(props, `${story.id} / ${preset.name}`).toContain(prop);
      }
    }
    for (const { story, label, values } of valueSets) {
      for (const control of story.controls) expect(isValid(control, values[control.prop]), `${label}: ${control.prop}`).toBe(true);
    }
  });

  it.each(valueSets.map((set) => [set.label, set] as const))('%s: every selected value appears in the snippet', (_label, { story, values }) => {
    const snippet = buildSnippet(story, values);
    for (const control of story.controls) {
      const expected = expectedInSnippet(control, values[control.prop]);
      if (expected) expect(snippet).toContain(expected);
    }
    expect(snippet).toContain(`<${story.component}`);
  });

  it.each(valueSets.map((set) => [set.label, set] as const))('%s: renders the real component', (_label, { story, values }) => {
    const { container } = render(<>{story.render(buildProps(story, values))}</>);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('passes control values straight through as props', () => {
    const story = findStory('button')!;
    const values = presetValues(story, 'Destructive');
    render(<>{story.render(buildProps(story, values))}</>);
    const button = screen.getByRole('button', { name: 'Delete entry' });
    expect(button.className).toMatch(/danger/);
    expect(buildSnippet(story, values)).toContain('appearance="danger"');
    expect(buildSnippet(story, values)).toContain('iconStart={<Icon name="trash" />}');
  });

  it('lists unset token-backed props in a comment instead of inventing values', () => {
    const story = findStory('card')!;
    const snippet = buildSnippet(story, initialValues(story));
    expect(snippet).toContain('//   surface: card.background (panel)');
    expect(snippet).not.toContain('surface=');
  });
});

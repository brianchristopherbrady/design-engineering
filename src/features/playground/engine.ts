import { createElement } from 'react';
import { Icon, type IconName } from '@/design-system/primitives';
import type { AnyControl, AnyStory, ControlValue, ControlValues } from './types';

export function initialValues(story: AnyStory): ControlValues {
  return Object.fromEntries(story.controls.map((control) => [control.prop, control.defaultValue]));
}

export function presetValues(story: AnyStory, presetName: string): ControlValues {
  const preset = story.presets.find((candidate) => candidate.name === presetName);
  return { ...initialValues(story), ...preset?.values };
}

function isOmitted(control: AnyControl, value: ControlValue): boolean {
  return value === undefined || (control.kind === 'text' && control.prop !== 'children' && value === '');
}

/** Turns control values into component props. The snippet is built from the same values. */
export function buildProps(story: AnyStory, values: ControlValues): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const control of story.controls) {
    const value = values[control.prop];
    if (isOmitted(control, value)) continue;
    if (control.kind === 'icon') props[control.prop] = createElement(Icon, { name: value as IconName });
    else if (control.kind === 'text' && control.wrap) props[control.prop] = control.wrap.render(String(value));
    else props[control.prop] = value;
  }
  return props;
}

const jsxTextUnsafe = /[{}<>]/;

function stringAttribute(name: string, value: string): string {
  return value.includes('"') ? `${name}={${JSON.stringify(value)}}` : `${name}="${value}"`;
}

function attribute(control: AnyControl, value: ControlValue): string {
  switch (control.kind) {
    case 'select':
      return typeof value === 'number' ? `${control.prop}={${value}}` : stringAttribute(control.prop, String(value));
    case 'switch':
      return `${control.prop}={${String(value)}}`;
    case 'icon':
      return `${control.prop}={<Icon name="${String(value)}" />}`;
    case 'text':
      return control.wrap
        ? `${control.prop}={${control.wrap.snippet(String(value))}}`
        : stringAttribute(control.prop, String(value));
  }
}

/** Usage code for the current values. Every set control appears; unset ones are listed in a comment. */
export function buildSnippet(story: AnyStory, values: ControlValues): string {
  const attributes: string[] = [];
  const unset: string[] = [];
  let children = story.snippetChildren;

  for (const control of story.controls) {
    const value = values[control.prop];
    if (control.prop === 'children' && control.kind === 'text') {
      const text = String(value ?? '');
      children = jsxTextUnsafe.test(text) ? `{${JSON.stringify(text)}}` : text;
      continue;
    }
    if (isOmitted(control, value)) {
      if (control.kind === 'select' && control.unsetLabel) unset.push(`${control.prop}: ${control.unsetLabel}`);
      continue;
    }
    attributes.push(attribute(control, value));
  }
  attributes.push(...(story.fixedAttributes ?? []));

  const lines = [...story.imports, ''];
  if (unset.length > 0) lines.push('// Unset props fall back to:', ...unset.map((line) => `//   ${line}`));
  lines.push(...(story.setup ?? []));
  if (story.setup?.length) lines.push('');

  const tag = story.component;
  if (attributes.length === 0) lines.push(children ? `<${tag}>` : `<${tag} />`);
  else lines.push(`<${tag}`, ...attributes.map((line) => `  ${line}`), children ? '>' : '/>');
  if (children) lines.push(...children.split('\n').map((line) => `  ${line}`), `</${tag}>`);
  return lines.join('\n');
}

/** Describes a control's accepted values for the props table. */
export function acceptedValues(control: AnyControl): string {
  switch (control.kind) {
    case 'select':
      return control.options.map((option) => (typeof option === 'number' ? String(option) : `"${option}"`)).join(' | ');
    case 'switch':
      return 'true | false';
    case 'icon':
      return 'ReactNode (here: an Icon)';
    case 'text':
      return control.wrap ? 'ReactNode (here: text in an element)' : 'string';
  }
}

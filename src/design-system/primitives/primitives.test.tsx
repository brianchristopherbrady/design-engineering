import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Heading, headingSizeForLevel } from './Heading/Heading';
import { Progress } from './Progress/Progress';
import { Text } from './Text/Text';
import { VisuallyHidden } from './VisuallyHidden/VisuallyHidden';

describe('typography primitives', () => {
  it('choose the element for meaning and the variant for appearance', () => {
    render(
      <Text as="span" variant="caption" tone="muted">
        Updated today
      </Text>,
    );
    const text = screen.getByText('Updated today');
    expect(text.tagName).toBe('SPAN');
    expect(text.className).toMatch(/caption/);
    expect(text.className).toMatch(/tone-muted/);
  });

  it('keep the outline level independent of the visual size', () => {
    render(
      <Heading level={2} size="small">
        Section
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Section' });
    expect(heading.className).toMatch(/small/);
    expect(headingSizeForLevel[1]).toBe('extraLarge');
    expect(headingSizeForLevel[4]).toBe(headingSizeForLevel[6]);
  });
});

describe('Progress', () => {
  it('labels the native progress element and reports a clamped percentage', () => {
    render(<Progress label="Uploading" value={150} max={200} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading' });
    expect(bar).toHaveAttribute('value', '150');
    expect(screen.getByText('75%', { selector: 'span' })).toBeInTheDocument();
  });

  it('shows a custom value text instead of the percentage', () => {
    render(<Progress label="Steps" value={2} max={5} valueText="2 of 5" />);
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });
});

describe('VisuallyHidden', () => {
  it('keeps text in the accessibility tree', () => {
    render(
      <button type="button">
        <VisuallyHidden>Delete invoice</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Delete invoice' })).toBeInTheDocument();
  });
});

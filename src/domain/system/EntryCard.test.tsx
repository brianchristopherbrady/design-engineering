import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { activity, summarizeCatalog } from './activity';
import { catalog } from './catalog';
import { EntryCard } from './EntryCard';

const button = catalog.find((entry) => entry.id === 'button')!;

describe('EntryCard', () => {
  it('links the title and states maturity in text', () => {
    render(<EntryCard entry={button} href="/components/button" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Button' })).toHaveAttribute('href', '/components/button');
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('exposes the pin state with aria-pressed and a name that includes the entry', async () => {
    const onTogglePin = vi.fn();
    render(<EntryCard entry={button} href="/components/button" pinned={false} onTogglePin={onTogglePin} />);
    const pin = screen.getByRole('button', { name: /^Pin\s+Button$/ });
    expect(pin).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(pin);
    expect(onTogglePin).toHaveBeenCalledOnce();
  });
});

describe('catalog data', () => {
  it('has unique ids and every activity event points at an entry', () => {
    const ids = catalog.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const event of activity) expect(ids).toContain(event.entryId);
  });

  it('summarizes counts by kind and maturity', () => {
    const summary = summarizeCatalog(catalog);
    expect(summary.total).toBe(catalog.length);
    expect(summary.byKind.component + summary.byKind.foundation + summary.byKind.pattern).toBe(catalog.length);
    expect(summary.byMaturity.stable + summary.byMaturity.beta + summary.byMaturity.deprecated).toBe(catalog.length);
  });
});

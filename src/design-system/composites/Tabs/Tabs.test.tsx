import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const items = [
  { id: 'usage', label: 'Usage', content: 'Usage panel' },
  { id: 'tokens', label: 'Tokens', content: 'Tokens panel' },
  { id: 'changes', label: 'Changes', content: 'Changes panel' },
];

describe('Tabs', () => {
  it('exposes one tab stop and links tabs to panels', () => {
    render(<Tabs label="Details" items={items} />);
    const tabs = screen.getAllByRole('tab');
    expect(screen.getByRole('tablist', { name: 'Details' })).toBeInTheDocument();
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(screen.getByRole('tabpanel', { name: 'Usage' })).toHaveTextContent('Usage panel');
  });

  it('moves and selects with arrow keys, Home and End, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<Tabs label="Details" items={items} />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Usage' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tokens' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tokens' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Tokens' })).toBeVisible();

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Changes' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Usage' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Changes' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Usage' })).toHaveAttribute('aria-selected', 'true');

    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Usage' })).toHaveFocus();
  });
});

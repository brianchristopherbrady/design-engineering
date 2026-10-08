import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Link, LinkProvider } from './Link';

describe('Link', () => {
  it('renders a real anchor with its href, not a button', () => {
    render(<Link href="/components">Components</Link>);
    const link = screen.getByRole('link', { name: 'Components' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/components');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('hands plain clicks on app paths to the provided navigate function', () => {
    const navigate = vi.fn();
    render(
      <LinkProvider navigate={navigate}>
        <Link href="/foundations/tokens">Tokens</Link>
      </LinkProvider>,
    );
    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Tokens' }));
    expect(navigate).toHaveBeenCalledWith('/foundations/tokens');
    expect(notPrevented).toBe(false);
  });

  it('renders app paths under the deployment base but navigates with the app path', () => {
    const navigate = vi.fn();
    render(
      <LinkProvider navigate={navigate} resolveHref={(href) => `/design-engineering${href}`}>
        <Link href="/components">Components</Link>
        <Link href="https://www.w3.org/">External</Link>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', { name: 'Components' });
    expect(link).toHaveAttribute('href', '/design-engineering/components');
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute('href', 'https://www.w3.org/');
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith('/components');
  });

  it('leaves modified clicks, new tabs, fragments and external URLs to the browser', () => {
    const navigate = vi.fn();
    render(
      <LinkProvider navigate={navigate}>
        <Link href="/components">Modified</Link>
        <Link href="/components" target="_blank">
          New tab
        </Link>
        <Link href="#section">Fragment</Link>
        <Link href="https://www.w3.org/TR/WCAG22/">External</Link>
      </LinkProvider>,
    );
    const block = (event: Event) => event.preventDefault();
    document.addEventListener('click', block);
    fireEvent.click(screen.getByRole('link', { name: 'Modified' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'New tab' }));
    fireEvent.click(screen.getByRole('link', { name: 'Fragment' }));
    fireEvent.click(screen.getByRole('link', { name: 'External' }));
    document.removeEventListener('click', block);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('marks the current page for assistive technology', () => {
    render(
      <Link href="/" aria-current="page">
        Overview
      </Link>,
    );
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
  });
});

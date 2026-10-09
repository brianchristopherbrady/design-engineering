import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../primitives';
import { Alert } from './Alert/Alert';
import { Card } from './Card/Card';
import { EmptyState } from './EmptyState/EmptyState';
import { PageHeader } from './PageHeader/PageHeader';

describe('PageHeader', () => {
  it('renders exactly one programmatically focusable h1 with its context', () => {
    render(<PageHeader eyebrow="Components" title="Button" description="A native button." />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Button' });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByText('A native button.')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('explains the empty region at the requested heading level and offers the next step', () => {
    render(<EmptyState headingLevel={3} title="No invoices yet" description="Invoices appear here." action={<Button>Create invoice</Button>} />);
    expect(screen.getByRole('heading', { level: 3, name: 'No invoices yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create invoice' })).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renders header, body and footer regions in source order', () => {
    render(
      <Card as="article" header={<h3>Invoice</h3>} footer={<Button>Approve</Button>}>
        <p>Body</p>
      </Card>,
    );
    const article = screen.getByRole('article');
    expect(article.textContent).toBe('InvoiceBodyApprove');
  });
});

describe('Alert', () => {
  it('pairs the tone with a visible title so status is not conveyed by color alone', () => {
    render(
      <Alert tone="danger" title="Payment failed">
        The card was declined.
      </Alert>,
    );
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    expect(screen.getByText('The card was declined.')).toBeInTheDocument();
  });
});

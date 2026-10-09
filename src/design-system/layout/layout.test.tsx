import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Box } from './Box';
import { Container } from './Container';
import { Grid, gridMode } from './Grid';
import { Inline } from './Inline';
import { Stack } from './Stack';

describe('layout primitives', () => {
  it('turn named spacing into semantic spacing tokens, never raw lengths', () => {
    render(
      <>
        <Stack data-testid="stack" gap="large" />
        <Inline data-testid="inline" gap="extraSmall" />
        <Box data-testid="box" padding="medium" radius="full" />
      </>,
    );
    expect(screen.getByTestId('stack').style.getPropertyValue('--_gap')).toBe('var(--spacing-large)');
    expect(screen.getByTestId('inline').style.getPropertyValue('--_gap')).toBe('var(--spacing-extra-small)');
    expect(screen.getByTestId('box').style.getPropertyValue('--_padding')).toBe('var(--spacing-medium)');
    expect(screen.getByTestId('box').style.getPropertyValue('--_radius')).toBe('var(--radius-full)');
  });

  it('use the structural value for "none" instead of a token', () => {
    render(<Stack data-testid="stack" gap="none" />);
    expect(screen.getByTestId('stack').style.getPropertyValue('--_gap')).toBe('0');
  });

  it('keep list semantics when rendered as a list', () => {
    render(
      <Stack as="ul" aria-label="Steps">
        <li>One</li>
      </Stack>,
    );
    expect(screen.getByRole('list', { name: 'Steps' })).toBeInTheDocument();
  });

  it('derive one Grid mode from columns and minColumnWidth', () => {
    expect(gridMode(3, undefined)).toBe('fixed');
    expect(gridMode(undefined, 'small')).toBe('responsive');
    expect(gridMode(undefined, undefined)).toBe('responsive');
    expect(gridMode(3, 'small')).toBe('capped');
    render(<Grid data-testid="grid" columns={2} minColumnWidth="medium" rowGap="small" />);
    const grid = screen.getByTestId('grid');
    expect(grid.dataset.gridMode).toBe('capped');
    expect(grid.style.getPropertyValue('--_row-gap')).toBe('var(--spacing-small)');
    expect(grid.style.getPropertyValue('--_column-gap')).toBe('var(--spacing-medium)');
    expect(grid.style.getPropertyValue('--_min')).toBe('var(--size-item-md)');
  });

  it('cap a Container with a container-width token and name it as a query container on request', () => {
    render(<Container data-testid="page" width="narrow" queryName="page" />);
    const container = screen.getByTestId('page');
    expect(container.style.getPropertyValue('--_max')).toBe('var(--size-container-narrow)');
    expect(container.style.containerName).toBe('page');
  });
});

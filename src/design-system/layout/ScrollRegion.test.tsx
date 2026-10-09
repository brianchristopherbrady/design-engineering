import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ScrollRegion } from './ScrollRegion';

describe('ScrollRegion', () => {
  it('is a named, keyboard-focusable region', async () => {
    const user = userEvent.setup();
    render(
      <ScrollRegion aria-label="Token table">
        <table>
          <tbody>
            <tr>
              <td>cell</td>
            </tr>
          </tbody>
        </table>
      </ScrollRegion>,
    );
    const region = screen.getByRole('region', { name: 'Token table' });
    await user.tab();
    expect(region).toHaveFocus();
  });

  it('can be labelled by a caption and render as pre for code', () => {
    render(
      <>
        <span id="caption">Usage</span>
        <ScrollRegion as="pre" aria-labelledby="caption" axis="both" maxBlockSize="20rem">
          <code>{'<Button />'}</code>
        </ScrollRegion>
      </>,
    );
    const region = screen.getByRole('region', { name: 'Usage' });
    expect(region.tagName).toBe('PRE');
    expect(region.style.maxBlockSize).toBe('20rem');
  });

  it('ignores maxBlockSize when only the inline axis scrolls', () => {
    render(<ScrollRegion aria-label="Row" maxBlockSize="10rem" />);
    expect(screen.getByRole('region', { name: 'Row' }).style.maxBlockSize).toBe('');
  });
});

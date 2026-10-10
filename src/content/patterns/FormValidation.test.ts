import { describe, expect, it } from 'vitest';
import { componentLayers } from '@/domain/system';
import { validateProposal, type Proposal } from './FormValidation';

const valid: Proposal = { name: 'DatePicker', layer: 'Composite', summary: 'Choosing a date with keyboard support.', email: 'team@example.com', searched: true };

describe('validateProposal', () => {
  it('accepts a complete proposal in any component layer', () => {
    for (const layer of componentLayers) expect(validateProposal({ ...valid, layer })).toEqual({});
  });

  it('reports every missing field', () => {
    expect(Object.keys(validateProposal({ name: '', layer: '', summary: '', email: '', searched: false }))).toEqual(['name', 'layer', 'summary', 'email', 'searched']);
  });

  it('rejects resource types and other values that are not component layers', () => {
    for (const layer of ['Foundation', 'Pattern', 'Decision', 'Design decision', 'layout']) {
      expect(validateProposal({ ...valid, layer }).layer).toBeDefined();
    }
  });

  it('treats only existing components as duplicates', () => {
    expect(validateProposal({ ...valid, name: 'Button' }).name).toBeDefined();
    expect(validateProposal({ ...valid, name: 'Spacing' }).name).toBeUndefined();
  });
});

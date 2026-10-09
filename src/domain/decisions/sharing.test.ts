import { describe, expect, it } from 'vitest';
import { assessApproaches, assessLayers, constraints, defaultConstraints, isApplicable, pilotQuestions, type Constraints } from './sharing';

const allCombinations = (): Constraints[] =>
  constraints.reduce<Constraints[]>(
    (combinations, constraint) => combinations.flatMap((partial) => constraint.options.map((option) => ({ ...partial, [constraint.id]: option.value }))),
    [{} as Constraints],
  );

describe('sharing comparison', () => {
  it('assesses every layer and every approach for every combination of constraints', () => {
    const combinations = allCombinations();
    expect(combinations).toHaveLength(3 * 2 * 2 * 2 * 2 * 2);
    for (const c of combinations) {
      expect(assessLayers(c)).toHaveLength(7);
      for (const approach of assessApproaches(c)) expect(approach.fits.length + approach.strains.length, approach.id).toBeGreaterThan(0);
      expect(pilotQuestions(c).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('never shares product screens and always shares principles', () => {
    for (const c of allCombinations()) {
      const layers = assessLayers(c);
      expect(layers.find((layer) => layer.layer === 'Principles')?.leaning).toBe('share');
      expect(layers.find((layer) => layer.layer === 'Product screens and workflows')?.leaning).toBe('separate');
    }
  });

  it('does not share component code with a native-only mobile product', () => {
    const code = assessLayers({ ...defaultConstraints, mobile: 'native' }).find((layer) => layer.layer === 'Component code');
    expect(code?.leaning).toBe('separate');
  });

  it('ignores web frameworks when only one product is on the web', () => {
    const native = { ...defaultConstraints, mobile: 'native' };
    expect(isApplicable('frameworks', native)).toBe(false);
    expect(assessApproaches({ ...native, frameworks: 'different' })).toEqual(assessApproaches({ ...native, frameworks: 'same' }));
    expect(pilotQuestions({ ...native, frameworks: 'different' })).toEqual(pilotQuestions({ ...native, frameworks: 'same' }));
  });

  it('keeps a cost on every approach, so none reads as automatically correct', () => {
    for (const c of allCombinations()) {
      for (const approach of assessApproaches(c)) expect(approach.strains.length, `${approach.id} ${JSON.stringify(c)}`).toBeGreaterThan(0);
    }
  });

  it('adds a pilot question for each risky constraint', () => {
    const risky = pilotQuestions({ mobile: 'both', frameworks: 'different', brands: 'distinct', overlap: 'many', releases: 'independent', ownership: 'part-time' });
    const calm = pilotQuestions({ mobile: 'web', frameworks: 'same', brands: 'family', overlap: 'few', releases: 'coordinated', ownership: 'team' });
    expect(risky.length).toBeGreaterThan(calm.length);
  });
});

export const demoScenarios = ['success', 'loading', 'empty', 'noResults', 'error'] as const;
export type DemoScenario = (typeof demoScenarios)[number];

export const scenarioLabels: Record<DemoScenario, string> = {
  success: 'Success',
  loading: 'Loading',
  empty: 'Empty',
  noResults: 'No results',
  error: 'Error',
};

export const scenarioDescriptions: Record<DemoScenario, string> = {
  success: 'The request returns data and every interaction works.',
  loading: 'The request never settles, so the loading state stays visible for inspection.',
  empty: 'The request succeeds with no data at all: there is nothing to search yet.',
  noResults: 'Data exists, but the prefilled search matches none of it.',
  error: 'The first request fails. Retry succeeds, so recovery can be tested.',
};

export type RequestOutcome = 'succeed' | 'fail' | 'hang';

/**
 * The outcome of a scenario's nth request (0-based). Deterministic, so a scenario
 * always plays out the same way: error fails once and then recovers.
 */
export function outcomeFor(scenario: DemoScenario, attempt: number): RequestOutcome {
  if (scenario === 'loading') return 'hang';
  if (scenario === 'error') return attempt === 0 ? 'fail' : 'succeed';
  return 'succeed';
}

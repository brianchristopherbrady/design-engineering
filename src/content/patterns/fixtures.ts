import { activity, activityFor, catalog, findEntry, type ActivityEvent, type CatalogEntry } from '@/domain/system';
import { outcomeFor, simulateRequest, type DemoScenario } from '@/features/scenarios';

/**
 * Simulated requests for the pattern demos. They read the real catalog and changelog,
 * and the scenario decides the outcome, so every run is the same. Nothing leaves the browser.
 */
export interface ScenarioRequest {
  scenario: DemoScenario;
  /** 0 for the first load, 1 for the first retry, and so on. */
  attempt: number;
}

export function fetchEntries({ scenario, attempt }: ScenarioRequest, signal: AbortSignal): Promise<CatalogEntry[]> {
  return simulateRequest(() => (scenario === 'empty' ? [] : [...catalog]), {
    outcome: outcomeFor(scenario, attempt),
    signal,
    failureMessage: 'The directory service responded with 503 Service Unavailable.',
  });
}

export interface EntryDetail {
  entry: CatalogEntry;
  history: ActivityEvent[];
}

export function fetchEntryDetail(id: string, { scenario, attempt }: ScenarioRequest, signal: AbortSignal): Promise<EntryDetail> {
  return simulateRequest(
    () => {
      const entry = findEntry(id);
      if (!entry) throw new Error(`No entry with id ${id}.`);
      return { entry, history: scenario === 'empty' ? [] : activityFor(id) };
    },
    { outcome: outcomeFor(scenario, attempt), signal, failureMessage: 'The entry could not be loaded: 503 Service Unavailable.' },
  );
}

export function fetchActivity({ scenario, attempt }: ScenarioRequest, signal: AbortSignal): Promise<ActivityEvent[]> {
  return simulateRequest(() => (scenario === 'empty' ? [] : [...activity]), {
    outcome: outcomeFor(scenario, attempt),
    signal,
    failureMessage: 'The activity feed responded with 503 Service Unavailable.',
  });
}

/** Archiving always fails on the first attempt and succeeds on retry, so the error path is always reachable. */
export function archiveEntry(attempt: number, signal: AbortSignal): Promise<void> {
  return simulateRequest(() => undefined, {
    outcome: attempt === 0 ? 'fail' : 'succeed',
    signal,
    failureMessage: 'The archive service did not respond in time.',
  });
}

/** Search text prefilled by the No results scenario. It names a component the system deliberately does not have. */
export const noResultsQuery = 'tooltip';

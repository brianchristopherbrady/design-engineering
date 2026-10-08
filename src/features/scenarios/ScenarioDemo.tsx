import { useId, useState, type ReactNode } from 'react';
import { Field } from '@/design-system/composites';
import { Button, Icon, Select, Text } from '@/design-system/primitives';
import { demoScenarios, scenarioDescriptions, scenarioLabels, type DemoScenario } from './scenarios';
import styles from './ScenarioDemo.module.css';

export interface ScenarioDemoProps {
  /** Scenarios that apply to this demo, in menu order. */
  scenarios?: readonly DemoScenario[];
  defaultScenario?: DemoScenario;
  /** Renders the demo for a scenario. Remounted on every scenario change and reset. */
  children: (scenario: DemoScenario) => ReactNode;
}

/**
 * Chooses a demo scenario and renders the demo for it. Changing the scenario or pressing
 * Reset remounts the demo through `key`, so every run starts from the same state.
 */
export function ScenarioDemo({ scenarios = demoScenarios, defaultScenario, children }: ScenarioDemoProps) {
  const [scenario, setScenario] = useState<DemoScenario>(defaultScenario ?? scenarios[0] ?? 'success');
  const [run, setRun] = useState(0);
  const descriptionId = useId();

  return (
    <div className={styles.demo}>
      <div className={styles.toolbar}>
        <Field label="Demo scenario">
          {(control) => (
            <Select
              {...control}
              aria-describedby={descriptionId}
              value={scenario}
              onChange={(event) => setScenario(event.target.value as DemoScenario)}
            >
              {scenarios.map((option) => (
                <option key={option} value={option}>
                  {scenarioLabels[option]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Button size="small" iconStart={<Icon name="refresh" />} onClick={() => setRun((count) => count + 1)}>
          Reset demo
        </Button>
        <Text id={descriptionId} variant="bodySmall" tone="muted" className={styles.description}>
          {scenarioDescriptions[scenario]}
        </Text>
      </div>
      <div className={styles.stage} data-scenario={scenario}>
        <div key={`${scenario}:${run}`}>{children(scenario)}</div>
      </div>
    </div>
  );
}

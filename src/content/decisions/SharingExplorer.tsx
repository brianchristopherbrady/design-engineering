import { useState } from 'react';
import { Field } from '@/design-system/composites';
import { Badge, Heading, Icon, Select, Text, VisuallyHidden } from '@/design-system/primitives';
import {
  assessApproaches,
  assessLayers,
  constraints,
  defaultConstraints,
  isApplicable,
  leaningLabels,
  pilotQuestions,
  type Constraints,
  type Leaning,
} from '@/domain/decisions';
import styles from './decisions.module.css';

const leaningTone: Record<Leaning, 'success' | 'info' | 'neutral'> = { share: 'success', partial: 'info', separate: 'neutral' };

/** Change a few constraints and see how the case for each layer and approach shifts. Reasons, not scores. */
export function SharingExplorer() {
  const [values, setValues] = useState<Constraints>(defaultConstraints);
  const [changed, setChanged] = useState(false);
  const layers = assessLayers(values);
  const approaches = assessApproaches(values);
  const pilot = pilotQuestions(values);
  const count = (leaning: Leaning) => layers.filter((layer) => layer.leaning === leaning).length;

  return (
    <div className={styles.explorer}>
      <fieldset className={styles.constraints}>
        <legend className={styles.constraintsLegend}>Constraints</legend>
        {constraints.map((constraint) => {
          const applies = isApplicable(constraint.id, values);
          return (
            <Field key={constraint.id} label={constraint.label}>
              {(control) => (
                <Select
                  {...control}
                  disabled={!applies}
                  value={applies ? values[constraint.id] : ''}
                  onChange={(event) => {
                    setValues({ ...values, [constraint.id]: event.target.value });
                    setChanged(true);
                  }}
                >
                  {applies ? (
                    constraint.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option value="">Not applicable</option>
                  )}
                </Select>
              )}
            </Field>
          );
        })}
      </fieldset>
      <VisuallyHidden role="status">
        {changed ? `Comparison updated: ${count('share')} layers shared, ${count('partial')} shared in part, ${count('separate')} kept separate.` : ''}
      </VisuallyHidden>

      <section className={styles.explorerPart} aria-labelledby="explorer-layers">
        <Heading level={3} size="small" id="explorer-layers">
          Layer by layer
        </Heading>
        <ul className={styles.layers}>
          {layers.map((layer) => (
            <li key={layer.layer} className={styles.layer}>
              <span className={styles.layerName}>
                <Text as="span" variant="label">
                  {layer.layer}
                </Text>
                <Badge tone={leaningTone[layer.leaning]} size="small">
                  {leaningLabels[layer.leaning]}
                </Badge>
              </span>
              <Text as="span" variant="bodySmall" tone="muted">
                {layer.because}
              </Text>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.explorerPart} aria-labelledby="explorer-approaches">
        <Heading level={3} size="small" id="explorer-approaches">
          How each approach holds up
        </Heading>
        <ul className={styles.approaches}>
          {approaches.map((approach) => (
            <li key={approach.id} className={styles.approach}>
              <Text as="span" variant="label">
                {approach.name}
              </Text>
              <ul className={styles.reasons}>
                {approach.fits.map((reason) => (
                  <li key={reason} data-kind="fits">
                    <Icon name="check" />
                    <span>
                      <VisuallyHidden>Fits: </VisuallyHidden>
                      {reason}
                    </span>
                  </li>
                ))}
                {approach.strains.map((reason) => (
                  <li key={reason} data-kind="strains">
                    <Icon name="warning" />
                    <span>
                      <VisuallyHidden>Strains: </VisuallyHidden>
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.explorerPart} aria-labelledby="explorer-pilot">
        <Heading level={3} size="small" id="explorer-pilot">
          What the pilot must answer
        </Heading>
        <ol className={styles.pilot}>
          {pilot.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}

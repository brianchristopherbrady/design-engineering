import { useEffect, useState } from 'react';
import { Inline, ScrollRegion, Stack } from '@/design-system/layout';
import { Badge, Text } from '@/design-system/primitives';
import {
  crossComponentReads,
  modifierLanes,
  policyExceptions,
  sharedTokenFamilies,
  stylesheetReads,
  tokenPolicy,
  type OwnershipFinding,
  type StylesheetRead,
} from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { loadSource, Prose, sourcePaths } from '@/features/docs';
import styles from './foundations.module.css';

const scopeLabel = { common: 'Common practice', system: 'This system’s convention' } as const;
const enforcementLabel = { build: 'Token build', lint: 'Lint', test: 'Test', review: 'Review' } as const;

interface Audit {
  sheets: number;
  direct: { family: string; reads: StylesheetRead[]; designSystem: number }[];
  ownership: OwnershipFinding[];
}

function useStylesheetAudit(): Audit | null {
  const [audit, setAudit] = useState<Audit | null>(null);
  useEffect(() => {
    let active = true;
    const files = sourcePaths.filter((path) => path.endsWith('.css') && !path.includes('/generated/'));
    const byVar = new Map(tokenManifest.map((record) => [record.cssVar, record]));
    void Promise.all(files.map(async (file) => stylesheetReads(file, await loadSource(file)))).then((results) => {
      if (!active) return;
      const reads = results.flat();
      const families = new Map<string, StylesheetRead[]>();
      for (const read of reads) {
        const record = byVar.get(read.cssVar);
        if (record?.tier !== 'reference') continue;
        const family = record.path.split('.').slice(0, record.path.startsWith('font.') || record.path.startsWith('size.') ? 2 : 1).join('.');
        families.set(family, [...(families.get(family) ?? []), read]);
      }
      setAudit({
        sheets: files.length,
        direct: [...families]
          .map(([family, list]) => ({ family, reads: list, designSystem: list.filter((read) => read.file.startsWith('src/design-system/')).length }))
          .sort((a, b) => b.reads.length - a.reads.length),
        ownership: crossComponentReads(reads, (cssVar) => {
          const record = byVar.get(cssVar);
          return record?.tier === 'component' ? record.path : undefined;
        }),
      });
    });
    return () => {
      active = false;
    };
  }, []);
  return audit;
}

/** The dependency rules, their enforcement and a live audit of the stylesheets against them. */
export function TokenPolicy() {
  const audit = useStylesheetAudit();
  const undeclared = audit?.ownership.filter((finding) => !finding.exception) ?? [];

  return (
    <Stack gap="large">
      <ol className={styles.policyList}>
        {tokenPolicy.map((rule) => (
          <li key={rule.id} className={styles.policyRule}>
            <Inline gap="small" justify="between">
              <Text as="span" variant="label">
                {rule.title}
              </Text>
              <Badge tone={rule.scope === 'common' ? 'info' : 'brand'} appearance="outlined" size="small">
                {scopeLabel[rule.scope]}
              </Badge>
            </Inline>
            <Text variant="bodySmall">{rule.rule}</Text>
            <Text variant="bodySmall" tone="muted">
              {rule.rationale}
            </Text>
            <ul className={styles.enforcement} aria-label={`How “${rule.title}” is enforced`}>
              {rule.enforcement.map((item) => (
                <li key={`${item.kind}:${item.path}`}>
                  <Badge size="small">{enforcementLabel[item.kind]}</Badge> <code>{item.path}</code> {item.detail}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <Prose>
        <h3>Declared lanes, families and exceptions</h3>
        <ScrollRegion aria-labelledby="policy-lanes-caption">
          <table>
            <caption id="policy-lanes-caption">What the policy allows by name</caption>
            <thead>
              <tr>
                <th scope="col">Declaration</th>
                <th scope="col">Allows</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(modifierLanes).map(([modifier, lanes]) => (
                <tr key={modifier}>
                  <th scope="row">
                    <code>{modifier}</code> lane
                  </th>
                  <td>{lanes.map((lane) => (lane.endsWith('.') ? `${lane}*` : lane)).join(', ')}</td>
                </tr>
              ))}
              {Object.entries(sharedTokenFamilies).map(([family, readers]) => (
                <tr key={family}>
                  <th scope="row">
                    Shared <code>{family}.*</code> family
                  </th>
                  <td>Read by {readers.join(', ')}: the form controls share one field boundary and background.</td>
                </tr>
              ))}
              {policyExceptions.map((exception) => (
                <tr key={`${exception.file}:${exception.token}`}>
                  <th scope="row">
                    Exception to <code>{exception.rule}</code>
                  </th>
                  <td>
                    <code>{exception.file.replace(/^src\//, '')}</code> reads <code>{exception.token}</code>. {exception.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollRegion>
      </Prose>

      {!audit ? (
        <Text role="status" tone="muted">
          Reading stylesheets…
        </Text>
      ) : (
        <Stack gap="medium">
          <Inline gap="small">
            <Badge tone={undeclared.length === 0 ? 'success' : 'danger'}>
              {undeclared.length === 0 ? 'No undeclared cross-component reads' : `${undeclared.length} undeclared cross-component reads`}
            </Badge>
            <Badge>{audit.direct.reduce((total, family) => total + family.reads.length, 0)} direct scale reads</Badge>
            <Badge>{audit.sheets} stylesheets</Badge>
          </Inline>
          <Prose>
            <h3>Direct reference reads, by scale</h3>
            <p>
              Read from the real stylesheets when this page loads. None are colors, which the palette rule forbids; each is a
              value meant to stay fixed in every context. A value that a product or density should change belongs in a
              semantic or component token instead, which is how button padding became density-aware.
            </p>
            <ScrollRegion aria-labelledby="direct-reads-caption">
              <table>
                <caption id="direct-reads-caption">Direct reference reads in stylesheets</caption>
                <thead>
                  <tr>
                    <th scope="col">Scale</th>
                    <th scope="col">Reads</th>
                    <th scope="col">In the design system</th>
                    <th scope="col">Files</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.direct.map(({ family, reads, designSystem }) => {
                    const files = [...new Set(reads.map((read) => read.file.split('/').pop()))];
                    return (
                      <tr key={family}>
                        <th scope="row">
                          <code>{family}.*</code>
                        </th>
                        <td>{reads.length}</td>
                        <td>{designSystem}</td>
                        <td>
                          {files.slice(0, 6).join(', ')}
                          {files.length > 6 && `, and ${files.length - 6} more`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollRegion>
          </Prose>
        </Stack>
      )}
    </Stack>
  );
}

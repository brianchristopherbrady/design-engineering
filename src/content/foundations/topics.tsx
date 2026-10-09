import { useState, type ComponentType } from 'react';
import { Card, Field } from '@/design-system/composites';
import { Box, Grid, Inline, ScrollRegion, Stack } from '@/design-system/layout';
import { Badge, Button, Heading, Link, Select, Text } from '@/design-system/primitives';
import {
  borderScale,
  borderTokenPaths,
  elevationScale,
  elevationTokenPaths,
  radiusScale,
  radiusTokenPaths,
  spaceScale,
  spaceTokenPaths,
  themeNames,
  toneScale,
  type TokenPath,
} from '@/design-system/tokens';
import { tokenManifest } from '@/design-system/tokens/manifest';
import { catalog, EntryCard } from '@/domain/system';
import { DocSection, LiveExample, Note, Prose, SourceList, TokenChain, TokenExplorer, TokenSwatch } from '@/features/docs';
import { contrastRatio } from './contrast';
import { productsTopic } from './products';
import { studioTopic } from './studio';
import { QueryRegistry } from './QueryRegistry';
import { TokenPolicy } from './TokenPolicy';
import { apcaContrast } from '@/features/theming';
import { tokenRecord, TokenTable } from './TokenTable';
import styles from './foundations.module.css';

export interface FoundationTopic {
  /** Catalog id; title and summary come from the catalog entry. */
  id: string;
  sections: readonly { id: string; label: string }[];
  Content: ComponentType;
}

const pathsWithPrefix = (prefix: string) =>
  tokenManifest.filter((record) => record.path.startsWith(prefix)).map((record) => record.path as TokenPath);

/* ------------------------------------------------------------------ Tokens */

const traceable: TokenPath[] = [
  'button.primary.background',
  'button.danger.foreground',
  'badge.radius',
  'card.elevation',
  'dialog.backdrop',
  'switch.track-on',
];

function TokensContent() {
  const [path, setPath] = useState<TokenPath>('button.primary.background');
  const tierCount = (tier: string) => tokenManifest.filter((record) => record.tier === tier).length;
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="tiers" title="Three tiers">
        <Prose>
          <p>
            Every visual value in the system is a token, and every token belongs to exactly one tier. An alias points to its
            own tier or a lower one, so a value always has one path back to its source. The{' '}
            <Link href="#policy">dependency policy</Link> below says exactly who may read what. Semantic and component
            names describe a job, not an appearance: <code>text.muted</code> rather than <code>text.gray</code>, because the
            dark-theme value is not gray.
          </p>
        </Prose>
        <Grid minColumnWidth="small" gap="medium">
          <Card header={<Heading level={3} size="small">Reference ({tierCount('reference')})</Heading>}>
            <Text variant="bodySmall">
              Raw scales with no meaning: <code>color.blue.600</code>, <code>space.md</code>, <code>radius.lg</code>,{' '}
              <code>shadow.medium</code>, <code>duration.base</code>. Identical in every theme, product and density.
              Palettes are read only through semantic roles; the other scales may be read directly for fixed values.
            </Text>
          </Card>
          <Card header={<Heading level={3} size="small">Semantic ({tierCount('semantic')})</Heading>}>
            <Text variant="bodySmall">
              Purpose-named aliases: <code>action.primary.background</code>, <code>text.muted</code>,{' '}
              <code>surface.panel</code>, <code>control.height.medium</code>, <code>spacing.medium</code>. Themes, products and
              densities remap these.
            </Text>
          </Card>
          <Card header={<Heading level={3} size="small">Component ({tierCount('component')})</Heading>}>
            <Text variant="bodySmall">
              Decisions for one component: <code>button.primary.background</code>, <code>card.radius</code>,{' '}
              <code>dialog.width.medium</code>. Each aliases a semantic role or a non-color scale, and is added only where a
              component exposes a knob a product or density may retune.
            </Text>
          </Card>
        </Grid>
        <Note title="Why component tokens are optional">
          <p>
            Layout primitives read semantic spacing tokens directly, because a component token such as{' '}
            <code>stack.gap.medium</code> would only repeat <code>spacing.medium</code>. Button, Badge, Card, Dialog, Switch
            and Skeleton have component tokens because each makes decisions (hover colors, default padding, widths) that a
            product may want to retune without touching every usage.
          </p>
        </Note>
      </DocSection>

      <DocSection id="pipeline" title="From source file to CSS">
        <Prose>
          <ol>
            <li>
              Tokens are authored as DTCG JSON in <code>src/design-system/tokens/source/</code>. A resolver file lists the
              sets and three modifiers: <code>theme</code> (light, dark), <code>product</code> (System Lab, Harbor, Meadow)
              and <code>density</code> (comfortable, compact).
            </li>
            <li>
              <code>scripts/tokens/pipeline.mjs</code> flattens the files, validates every value against its type, resolves
              aliases in all twelve permutations, and rejects missing references, cycles, type mismatches, name collisions
              and breaches of the dependency policy.
            </li>
            <li>
              It writes <code>tokens.css</code> (custom properties, with aliases kept as <code>var()</code> so a theme change
              cascades), <code>tokens.ts</code> (typed paths and <code>cssVar()</code>) and <code>manifest.ts</code>, which this
              site reads to render every table on this page.
            </li>
            <li>
              The Vite plugin regenerates on change; <code>npm run tokens:check</code> fails CI if the generated files are
              stale, and <code>check-styles.mjs</code> fails if CSS reads a variable that is not a token.
            </li>
          </ol>
        </Prose>
      </DocSection>

      <DocSection id="trace" title="Trace a token">
        <LiveExample
          title="Alias chain in this context"
          kind="recommended"
          showHtml={false}
          description="Choose a component token to follow it to a reference value for the product, theme and density set in the header, then compare the authored, resolved and computed readings."
          controls={
            <Field label="Token">
              {(control) => (
                <Select {...control} value={path} onChange={(event) => setPath(event.target.value as TokenPath)}>
                  {traceable.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          }
        >
          <TokenChain path={path} />
        </LiveExample>
      </DocSection>

      <DocSection id="policy" title="Dependency policy">
        <Prose>
          <p>
            These rules decide which tokens may alias or read which. Rules marked common practice are widely shared; the
            others are conventions this system chose for its size and its three modifiers, and a different system could
            reasonably choose otherwise. Each rule names where it is enforced.
          </p>
        </Prose>
        <TokenPolicy />
      </DocSection>

      <DocSection id="explorer" title="Every token">
        <TokenExplorer />
      </DocSection>

      <DocSection id="source" title="Source">
        <SourceList
          sources={[
            { path: 'src/design-system/tokens/source/system-lab.resolver.json', note: 'Sets, theme modifier and tier metadata' },
            { path: 'src/design-system/tokens/source/component.tokens.json', note: 'Component tier' },
            { path: 'src/design-system/tokens/policy.ts', note: 'The dependency policy, its lanes and exceptions' },
            { path: 'scripts/tokens/pipeline.mjs', note: 'Validation, alias resolution, policy checks and CSS output' },
            { path: 'scripts/tokens/policy.test.mjs', note: 'Stylesheets and manifest checked against the policy' },
            { path: 'src/design-system/tokens/vocabulary.ts', note: 'Prop vocabularies mapped to token paths' },
          ]}
        />
      </DocSection>
    </Stack>
  );
}

/* ------------------------------------------------------------------- Color */

function paletteGroups() {
  const groups = new Map<string, { step: string; hex: string; path: string }[]>();
  for (const record of tokenManifest) {
    const [first, palette, step] = record.path.split('.');
    if (first !== 'color' || !palette || !step) continue;
    const list = groups.get(palette) ?? [];
    list.push({ step, hex: record.values.light.resolved, path: record.path });
    groups.set(palette, list);
  }
  return [...groups];
}

const contrastPairs: [TokenPath, TokenPath, number][] = [
  ['text.primary', 'surface.canvas', 4.5],
  ['text.muted', 'surface.panel', 4.5],
  ['text.link', 'surface.sunken', 4.5],
  ['button.primary.foreground', 'button.primary.background', 4.5],
  ['button.danger.foreground', 'button.danger.background-hover', 4.5],
  ...toneScale.map((tone): [TokenPath, TokenPath, number] => [`tone.${tone}.text`, `tone.${tone}.surface`, 4.5]),
  ...toneScale.map((tone): [TokenPath, TokenPath, number] => [`tone.${tone}.on-solid`, `tone.${tone}.solid`, 4.5]),
  ['border.strong', 'surface.panel', 3],
  ['focus.ring', 'surface.canvas', 3],
];

function ColorContent() {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="palettes" title="Reference palettes">
        <Prose>
          <p>
            Palettes are reference tokens: numbered steps from light (50) to dark (950). They carry no meaning, and no
            component reads them. Semantic tokens pick steps per theme.
          </p>
        </Prose>
        {paletteGroups().map(([palette, steps]) => (
          <Stack key={palette} gap="small">
            <Heading level={3} size="small">
              {palette}
            </Heading>
            <ul className={styles.palette}>
              {steps.map(({ step, hex, path }) => (
                <li key={path} className={styles.chip}>
                  <span className={styles.chipColor} style={{ backgroundColor: hex }} aria-hidden="true" />
                  <span>
                    <code>{step}</code> <code className={styles.muted}>{hex}</code>
                  </span>
                </li>
              ))}
            </ul>
          </Stack>
        ))}
      </DocSection>

      <DocSection id="roles" title="Semantic roles">
        <Prose>
          <p>
            Components read roles, not colors. A role answers “what is this for?”: a surface to sit on, text to read, a
            border to separate, an action to press. Each theme maps the same role to a different palette step.
          </p>
        </Prose>
        <TokenTable caption="Surfaces, text and borders" paths={[...pathsWithPrefix('surface.'), ...pathsWithPrefix('text.'), ...pathsWithPrefix('border.'), 'focus.ring']} />
        <TokenTable caption="Action roles used by Button" paths={pathsWithPrefix('action.')} />
      </DocSection>

      <DocSection id="tones" title="Tones">
        <Prose>
          <p>
            Six tones express status and emphasis. Each has five roles, so Badge, Alert and Text can combine them without
            inventing colors: <code>text</code> for words, <code>surface</code> for tinted backgrounds, <code>border</code>{' '}
            for outlines, <code>solid</code> for filled backgrounds and <code>on-solid</code> for text on them.
          </p>
        </Prose>
        <Inline gap="extraSmall">
          {toneScale.map((tone) => (
            <Badge key={tone} tone={tone} appearance="filled">
              {tone}
            </Badge>
          ))}
        </Inline>
        <TokenTable caption="Tone tokens" paths={pathsWithPrefix('tone.')} />
      </DocSection>

      <DocSection id="contrast" title="Verified contrast">
        <Prose>
          <p>
            Ratios below are computed live from the generated manifest. The full set of 510 pairs (every tone on every
            surface and every button state, in all three products and both themes) runs in <code>contrast.test.ts</code>,
            so a token change that breaks contrast fails the build. Each cell also shows the APCA lightness contrast (Lc),
            the draft WCAG 3 method, for comparison; it is informative and does not decide pass or fail.
          </p>
        </Prose>
        <ContrastTable />
      </DocSection>
    </Stack>
  );
}

function ContrastTable() {
  return (
    <ScrollRegion aria-label="Contrast ratios">
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Foreground on background</th>
            {themeNames.map((theme) => (
              <th key={theme} scope="col">
                {theme === 'light' ? 'Light' : 'Dark'}
              </th>
            ))}
            <th scope="col">Minimum</th>
          </tr>
        </thead>
        <tbody>
          {contrastPairs.map(([foreground, background, minimum]) => (
            <tr key={`${foreground}:${background}`}>
              <th scope="row">
                <code>{foreground}</code> on <code>{background}</code>
              </th>
              {themeNames.map((theme) => {
                const fg = tokenRecord(foreground)?.values[theme].resolved ?? '';
                const bg = tokenRecord(background)?.values[theme].resolved ?? '';
                const ratio = contrastRatio(fg, bg);
                return (
                  <td key={theme}>
                    <span className={styles.value}>
                      <TokenSwatch type="color" value={bg} />
                      {ratio === null ? 'n/a' : `${ratio.toFixed(2)}:1`}
                      {ratio !== null && (
                        <Badge size="small" tone={ratio >= minimum ? 'success' : 'danger'}>
                          {ratio >= minimum ? 'Pass' : 'Fail'}
                        </Badge>
                      )}
                      {ratio !== null && <span className={styles.muted}>Lc {apcaContrast(fg, bg).toFixed(0)}</span>}
                    </span>
                  </td>
                );
              })}
              <td>{minimum}:1</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollRegion>
  );
}

/* -------------------------------------------------------------- Typography */

function TypographyContent() {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="families" title="Families and scale">
        <Prose>
          <p>
            Two families (a system sans and a system mono) and an eight-step size scale in rem, so text follows the
            reader’s font-size preference and zoom. Weights and line heights are separate reference tokens.
          </p>
        </Prose>
        <TokenTable
          caption="Font sizes"
          paths={pathsWithPrefix('font.size.')}
          preview={(cssVar) => <span style={{ fontSize: cssVar, lineHeight: 1.1 }}>Aa</span>}
        />
        <TokenTable caption="Families, weights, line heights and letter spacing" paths={[...pathsWithPrefix('font.family.'), ...pathsWithPrefix('font.weight.'), ...pathsWithPrefix('font.line-height.'), ...pathsWithPrefix('font.letter-spacing.')]} />
      </DocSection>
      <DocSection id="styles" title="Text styles">
        <Prose>
          <p>
            Typography tokens are composites (family, size, weight, line height, letter spacing) exposed as one variable
            per property, such as <code>--typography-heading-2-font-size</code>. Text and Heading map their props onto
            these; the table shows which prop selects which style.
          </p>
        </Prose>
        <Stack gap="medium">
          <Heading level={3} size="display">Heading size display</Heading>
          <Heading level={3} size="extraLarge">Heading size extraLarge · heading-1</Heading>
          <Heading level={3} size="large">Heading size large · heading-2</Heading>
          <Heading level={3} size="medium">Heading size medium · heading-3</Heading>
          <Heading level={3} size="small">Heading size small · heading-4</Heading>
          <Text variant="lead">Text variant lead · typography.lead</Text>
          <Text>Text variant body · typography.body</Text>
          <Text variant="bodySmall">Text variant bodySmall · typography.body-small</Text>
          <Text variant="label">Text variant label · typography.label</Text>
          <Text variant="caption">Text variant caption · typography.caption</Text>
          <Text>
            <code>Code · typography.code</code>
          </Text>
        </Stack>
        <Note title="Reading measure">
          <p>
            Paragraphs rendered by Text are capped at <code>layout.measure</code> (40rem, about 75 characters), so wide
            containers never produce lines that are hard to track.
          </p>
        </Note>
      </DocSection>
    </Stack>
  );
}

/* ----------------------------------------------------------------- Spacing */

function SpacingContent() {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="scale" title="Space scale">
        <Prose>
          <p>Eight reference steps from 0.25rem to 4rem. Nothing reads them directly except semantic aliases and a few component tokens.</p>
        </Prose>
        <TokenTable
          caption="Reference space tokens"
          paths={pathsWithPrefix('space.')}
          preview={(cssVar) => <span className={styles.bar} style={{ inlineSize: cssVar }} />}
        />
      </DocSection>
      <DocSection id="vocabulary" title="The gap vocabulary">
        <Prose>
          <p>
            Layout props use one shared vocabulary: <code>{spaceScale.join(', ')}</code>. The same word means the same
            distance on Stack, Inline, Grid, Box, Card and Dialog. <code>none</code> is the structural value 0, not a
            token.
          </p>
        </Prose>
        <ScrollRegion aria-label="Spacing vocabulary">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Prop value</th>
                <th scope="col">Semantic token</th>
                <th scope="col">Reference</th>
                <th scope="col">Size</th>
              </tr>
            </thead>
            <tbody>
              {spaceScale.map((space) => {
                const path = spaceTokenPaths[space];
                const record = path ? tokenRecord(path) : undefined;
                return (
                  <tr key={space}>
                    <th scope="row">
                      <code>"{space}"</code>
                    </th>
                    <td>{path ? <code>{path}</code> : '—'}</td>
                    <td>{record ? <code>{record.values.light.authored}</code> : '0'}</td>
                    <td>
                      <span className={styles.bar} style={{ inlineSize: path ? `var(${record?.cssVar})` : '0' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollRegion>
      </DocSection>
      <DocSection id="precedence" title="Gap precedence">
        <Prose>
          <ul>
            <li>
              <code>gap</code> sets both axes. On Grid, <code>rowGap</code> and <code>columnGap</code> override it on one
              axis each; an unset axis keeps <code>gap</code>.
            </li>
            <li>Inline uses one gap for both axes so wrapped lines keep the same rhythm.</li>
            <li>Spacing belongs to the parent. Children never add margins to adjust a gap: nest another Stack instead.</li>
          </ul>
        </Prose>
        <LiveExample title="rowGap overrides gap on one axis" kind="recommended" showHtml={false}>
          <Grid minColumnWidth="extraSmall" gap="extraLarge" rowGap="extraSmall">
            {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((label) => (
              <Box key={label} padding="small" background="accent" radius="medium">
                <Text variant="bodySmall">{label}</Text>
              </Box>
            ))}
          </Grid>
        </LiveExample>
      </DocSection>
    </Stack>
  );
}

/* ------------------------------------------------------- Borders and radii */

function BordersContent() {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="borders" title="Border widths and strengths">
        <Prose>
          <p>
            Two widths (thin and thick) and three color strengths. A component’s <code>border</code> prop chooses a
            strength for surfaces (Box, Card, Dialog) or a width for controls (Button), because a button’s border color
            already belongs to its appearance.
          </p>
        </Prose>
        <TokenTable caption="Border widths" paths={pathsWithPrefix('border-width.')} />
        <Grid minColumnWidth="extraSmall" gap="medium">
          {borderScale.map((border) => (
            <Box key={border} padding="medium" border={border} radius="medium" background="panel">
              <Text variant="bodySmall">
                border="{border}"{borderTokenPaths[border] && <> · {borderTokenPaths[border]}</>}
              </Text>
            </Box>
          ))}
        </Grid>
      </DocSection>
      <DocSection id="radii" title="Corner radii">
        <TokenTable
          caption="Radius tokens"
          paths={pathsWithPrefix('radius.')}
          preview={(cssVar) => <span className={styles.shapeSample} style={{ borderRadius: cssVar }} />}
        />
        <Prose>
          <p>
            The <code>radius</code> prop on Button, Badge, Box, Card and Dialog uses{' '}
            <code>{radiusScale.join(', ')}</code>. When unset, Button, Badge, Card and Dialog fall back to their own
            component token ({radiusScale.filter((radius) => radiusTokenPaths[radius]).length} reference steps are shared
            by all of them).
          </p>
        </Prose>
      </DocSection>
    </Stack>
  );
}

/* --------------------------------------------------------------- Elevation */

function ElevationContent() {
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="levels" title="Levels">
        <Prose>
          <p>
            Three semantic levels map to two-layer shadows. In the dark theme they map to stronger shadow variants,
            because a soft shadow is invisible on a dark canvas. Surfaces also get lighter as they rise, which carries most
            of the depth in dark mode.
          </p>
        </Prose>
        <TokenTable caption="Elevation tokens" paths={pathsWithPrefix('elevation.')} />
        <div className={styles.themes}>
          {themeNames.map((theme) => (
            <div key={theme} data-theme={theme} className={styles.themePanel}>
              <Text variant="label">{theme === 'light' ? 'Light theme' : 'Dark theme'}</Text>
              <Grid minColumnWidth="extraSmall" gap="medium">
                {elevationScale.map((elevation) => (
                  <Card key={elevation} elevation={elevation} padding="medium">
                    <Text variant="bodySmall">
                      {elevation}
                      {elevationTokenPaths[elevation] ? '' : ' (no shadow)'}
                    </Text>
                  </Card>
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </DocSection>
      <DocSection id="usage" title="Usage">
        <Prose>
          <ul>
            <li>low: cards resting on the canvas (the card.elevation default).</li>
            <li>medium: popovers and raised interactive surfaces.</li>
            <li>high: dialogs (the dialog.elevation default).</li>
            <li>Shadows never carry meaning on their own; borders keep surfaces distinct in forced-colors mode.</li>
          </ul>
        </Prose>
      </DocSection>
    </Stack>
  );
}

/* ------------------------------------------------------------------ Motion */

const durations: TokenPath[] = ['motion.duration.feedback', 'motion.duration.transition', 'motion.duration.emphasis'];

function MotionContent() {
  const [duration, setDuration] = useState<TokenPath>('motion.duration.transition');
  const [end, setEnd] = useState(false);
  const durationVar = tokenRecord(duration)?.cssVar ?? '';
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="tokens" title="Durations and easing">
        <TokenTable caption="Motion tokens" paths={[...pathsWithPrefix('motion.'), ...pathsWithPrefix('duration.'), ...pathsWithPrefix('easing.')]} />
        <Prose>
          <ul>
            <li>feedback: color and border changes on hover and press.</li>
            <li>transition: state changes such as a switch thumb.</li>
            <li>emphasis: entering elements such as dialogs.</li>
          </ul>
        </Prose>
      </DocSection>
      <DocSection id="demo" title="Try a duration">
        <LiveExample
          title="Same movement, three durations"
          kind="recommended"
          showHtml={false}
          controls={
            <Inline gap="small" align="end">
              <Field label="Duration">
                {(control) => (
                  <Select {...control} value={duration} onChange={(event) => setDuration(event.target.value as TokenPath)}>
                    {durations.map((path) => (
                      <option key={path} value={path}>
                        {path}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Button onClick={() => setEnd((value) => !value)}>Move</Button>
            </Inline>
          }
        >
          <div className={styles.motionTrack}>
            <span
              className={styles.motionDot}
              data-end={end}
              style={{ transitionDuration: `var(${durationVar})`, transitionTimingFunction: 'var(--motion-easing-standard)' }}
            />
          </div>
        </LiveExample>
      </DocSection>
      <DocSection id="reduced" title="Reduced motion">
        <Prose>
          <p>
            <code>base.css</code> shortens every animation and transition to near zero when the reader asks for reduced
            motion. Components therefore declare motion freely and never check the preference themselves; the Dialog entry
            animation and Skeleton shimmer stop, and the demo above jumps instead of sliding.
          </p>
        </Prose>
        <SourceList sources={[{ path: 'src/design-system/styles/base.css', note: 'prefers-reduced-motion rule' }]} />
      </DocSection>
    </Stack>
  );
}

/* ------------------------------------------------------------------ Themes */

function ThemePreview() {
  return (
    <Stack gap="small">
      <Inline gap="extraSmall">
        <Badge tone="success">Stable</Badge>
        <Badge tone="warning" appearance="outlined">
          Beta
        </Badge>
      </Inline>
      <Text>Text, surfaces, borders and actions all switch together.</Text>
      <Inline gap="small">
        <Button appearance="primary">Primary</Button>
        <Button>Secondary</Button>
      </Inline>
    </Stack>
  );
}

function ThemesContent() {
  const themed = tokenManifest.filter((record) => record.themed);
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="mapping" title="Same roles, different mappings">
        <Prose>
          <p>
            Only semantic tokens change between themes ({themed.length} of {tokenManifest.length} tokens). Component tokens
            alias semantic ones, and CSS keeps the aliases as <code>var()</code> references, so switching a theme is a
            single attribute change that cascades through every tier.
          </p>
        </Prose>
        <div className={styles.themes}>
          {themeNames.map((theme) => (
            <section key={theme} data-theme={theme} className={styles.themePanel} aria-label={`${theme} theme preview`}>
              <Text variant="label">data-theme="{theme}"</Text>
              <ThemePreview />
            </section>
          ))}
        </div>
      </DocSection>
      <DocSection id="scoping" title="Scoping and selection">
        <Prose>
          <ul>
            <li>
              <code>[data-theme]</code> can be set on any element. The page uses it on <code>html</code>; the playground
              and the previews above set it on a container to show both themes at once.
            </li>
            <li>
              With no attribute, <code>prefers-color-scheme</code> decides. The theme menu in the header stores an explicit
              choice in localStorage and applies it before paint.
            </li>
            <li>Dark mode is not inverted light mode: surfaces lighten as they rise and shadows get stronger.</li>
          </ul>
        </Prose>
        <SourceList
          sources={[
            { path: 'src/design-system/tokens/source/theme.dark.tokens.json', note: 'Dark mappings' },
            { path: 'src/app/providers/ThemeProvider.tsx', note: 'Choice, persistence and the html attribute' },
          ]}
        />
      </DocSection>
    </Stack>
  );
}

/* -------------------------------------------------------------- Responsive */

function ResponsiveContent() {
  const [width, setWidth] = useState(36);
  const entries = catalog.filter((entry) => ['card', 'dialog', 'grid'].includes(entry.id));
  return (
    <Stack gap="extraExtraLarge">
      <DocSection id="rules" title="Which query to use">
        <Prose>
          <ul>
            <li>
              <strong>Intrinsic layout first.</strong> Wrapping (Inline) and auto-fit columns (Grid) need no query at all
              and work in any container.
            </li>
            <li>
              <strong>Container queries for components and compositions.</strong> A card does not know whether it is in a
              sidebar, a dialog or a full-width grid, so it adapts to its own width. EntryCard, ActivityList,
              DirectoryFilters, the playground and documentation pages all use named containers.
            </li>
            <li>
              <strong>Viewport queries only for the app shell.</strong> Whether the section navigation is a sidebar, and
              whether the header fits on one row, depends on the window, so those rules (and only those) use media
              queries.
            </li>
            <li>Breakpoints are in rem, so they move with text zoom, and each one is documented next to the rule.</li>
          </ul>
        </Prose>
      </DocSection>
      <DocSection id="demo" title="Resize a container">
        <LiveExample
          title="Components respond to their container"
          kind="recommended"
          showHtml={false}
          description="The window stays the same; only this frame changes. EntryCard moves its pin button beside the text at 28rem, and the Grid drops columns as space shrinks."
          controls={
            <Field label="Container width" description={`${width}rem`}>
              {(control) => (
                <input
                  {...control}
                  type="range"
                  className={styles.range}
                  min={18}
                  max={64}
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value))}
                />
              )}
            </Field>
          }
        >
          <div className={styles.resizer} style={{ inlineSize: `${width}rem` }}>
            <Grid minColumnWidth="large" gap="medium">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} href={`/components/${entry.id}`} pinned={false} onTogglePin={() => undefined} />
              ))}
            </Grid>
          </div>
        </LiveExample>
      </DocSection>
      <DocSection id="registry" title="Every query in the system">
        <Prose>
          <p>
            Read from the stylesheets themselves, so it cannot go stale. Each threshold sits next to a comment explaining
            why it is that value; the table shows that comment. The audit to watch is where viewport size queries live:
            only the app shell depends on the viewport, so any outside it is a component that should be querying its
            container instead.
          </p>
        </Prose>
        <QueryRegistry />
      </DocSection>
      <DocSection id="reflow" title="Reflow and overflow">
        <Prose>
          <ul>
            <li>Every page works at 320 CSS pixels without horizontal scrolling (WCAG 1.4.10), checked by the end-to-end suite.</li>
            <li>
              Grid items and flex children get <code>min-inline-size: 0</code>, so long words and code wrap instead of
              widening the page; tables and code blocks scroll inside their own focusable region.
            </li>
            <li>Inline wraps by default; turning wrapping off is an explicit choice.</li>
          </ul>
        </Prose>
      </DocSection>
    </Stack>
  );
}

export const foundationTopics: readonly FoundationTopic[] = [
  {
    id: 'tokens',
    sections: [
      { id: 'tiers', label: 'Three tiers' },
      { id: 'pipeline', label: 'Pipeline' },
      { id: 'trace', label: 'Trace a token' },
      { id: 'policy', label: 'Dependency policy' },
      { id: 'explorer', label: 'Every token' },
      { id: 'source', label: 'Source' },
    ],
    Content: TokensContent,
  },
  {
    id: 'color',
    sections: [
      { id: 'palettes', label: 'Palettes' },
      { id: 'roles', label: 'Semantic roles' },
      { id: 'tones', label: 'Tones' },
      { id: 'contrast', label: 'Contrast' },
    ],
    Content: ColorContent,
  },
  {
    id: 'typography',
    sections: [
      { id: 'families', label: 'Families and scale' },
      { id: 'styles', label: 'Text styles' },
    ],
    Content: TypographyContent,
  },
  {
    id: 'spacing',
    sections: [
      { id: 'scale', label: 'Space scale' },
      { id: 'vocabulary', label: 'Gap vocabulary' },
      { id: 'precedence', label: 'Precedence' },
    ],
    Content: SpacingContent,
  },
  {
    id: 'borders-and-radii',
    sections: [
      { id: 'borders', label: 'Borders' },
      { id: 'radii', label: 'Radii' },
    ],
    Content: BordersContent,
  },
  {
    id: 'elevation',
    sections: [
      { id: 'levels', label: 'Levels' },
      { id: 'usage', label: 'Usage' },
    ],
    Content: ElevationContent,
  },
  {
    id: 'motion',
    sections: [
      { id: 'tokens', label: 'Durations and easing' },
      { id: 'demo', label: 'Try a duration' },
      { id: 'reduced', label: 'Reduced motion' },
    ],
    Content: MotionContent,
  },
  {
    id: 'themes',
    sections: [
      { id: 'mapping', label: 'Mappings' },
      { id: 'scoping', label: 'Scoping' },
    ],
    Content: ThemesContent,
  },
  {
    id: 'responsive',
    sections: [
      { id: 'rules', label: 'Which query' },
      { id: 'demo', label: 'Resize a container' },
      { id: 'registry', label: 'Every query' },
      { id: 'reflow', label: 'Reflow' },
    ],
    Content: ResponsiveContent,
  },
  productsTopic,
  studioTopic,
];

export function findFoundationTopic(id: string): FoundationTopic | undefined {
  return foundationTopics.find((topic) => topic.id === id);
}

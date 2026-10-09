import { Card } from '@/design-system/composites';
import { Grid, Stack } from '@/design-system/layout';
import { Heading, Link, Text } from '@/design-system/primitives';
import { tokenCounts } from '@/design-system/tokens';
import { entriesOfKind, summarizeCatalog, catalog } from '@/domain/system';
import { DocSection, Note, Prose, SourceList } from '@/features/docs';
import { Horizon } from './Horizon';

export const overviewSections = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'principles', label: 'Principles' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'site', label: 'How this site is built' },
  { id: 'contributing', label: 'Contributing' },
] as const;

const destinations = [
  { href: '/foundations', title: 'Foundations', body: 'Tokens, color, type, spacing, shape, elevation, motion, themes and responsive rules.' },
  { href: '/components', title: 'Components', body: 'Every component with props, token traces, examples, accessibility notes and source.' },
  { href: '/playground', title: 'Playground', body: 'Change real props with controls, resize the preview and copy the matching code.' },
  { href: '/patterns', title: 'Patterns', body: 'Complete interfaces with loading, empty, success, error and no-results states.' },
] as const;

export function OverviewContent() {
  const summary = summarizeCatalog(catalog);
  const tiers = (tier: keyof typeof tokenCounts) => tokenCounts[tier];
  return (
    <Stack gap="extraExtraLarge">
      <Stack gap="large">
        <Horizon
          readouts={[
            { label: 'Tokens', value: tokenCounts.total },
            { label: 'Components', value: summary.byKind.component },
            { label: 'Foundations', value: summary.byKind.foundation },
            { label: 'Patterns', value: summary.byKind.pattern },
          ]}
        />
        <Grid as="ul" columns={2} minColumnWidth="small" gap="medium" aria-label="Sections">
          {destinations.map((destination, index) => (
            <Card as="li" key={destination.href} padding="medium">
              <Stack gap="extraSmall">
                <Text as="span" variant="caption" tone="muted" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Heading level={2} size="small">
                  <Link href={destination.href} variant="standalone">
                    {destination.title}
                  </Link>
                </Heading>
                <Text variant="bodySmall" tone="muted">
                  {destination.body}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>

      <DocSection id="purpose" title="Purpose">
        <Prose>
          <p>
            Design System Lab is a small, complete design system: {tokenCounts.total} tokens, {summary.byKind.component}{' '}
            components, {summary.byKind.foundation} foundations and {summary.byKind.pattern} patterns. It exists so that
            product interfaces are built from shared, named decisions instead of one-off values, and so that every decision
            can be inspected from the prop a developer writes down to the color or length the browser paints.
          </p>
          <p>
            This site is its reference. Each page shows a working demo first and the explanation underneath: what the
            component is for, its props and defaults, the tokens behind each prop, how it behaves for keyboard and
            screen-reader users, how it responds to space, and the source that implements it.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="principles" title="Principles">
        <Prose>
          <ol>
            <li>
              <strong>Choices, not values.</strong> Props accept named options (<code>size="large"</code>,{' '}
              <code>gap="medium"</code>, <code>elevation="low"</code>), never arbitrary CSS. Every option resolves to a token.
            </li>
            <li>
              <strong>Purpose before appearance.</strong> Components read semantic roles such as{' '}
              <code>action.primary.background</code>, so themes and rebrands change mappings, not components.
            </li>
            <li>
              <strong>Native first.</strong> Button is a button, Dialog is a dialog, Switch is a checkbox. The platform
              supplies semantics, keyboard behavior and forced-colors support; components add styling and wiring.
            </li>
            <li>
              <strong>Space-aware components.</strong> Components respond to their container, not the viewport, so they
              work in a sidebar, a dialog or a playground frame without changes.
            </li>
            <li>
              <strong>State outside components.</strong> Components are controlled or keep only UI state. Requests,
              fixtures, URLs and demo controls live in features and content.
            </li>
            <li>
              <strong>Verified, not promised.</strong> Contrast, boundaries, token references and accessibility are checked
              by tests and scripts that fail the build.
            </li>
          </ol>
        </Prose>
      </DocSection>

      <DocSection id="architecture" title="Architecture">
        <Prose>
          <p>The code is layered. Each layer may import only from the layers before it, and only through a public index.</p>
          <table>
            <caption>Layers and what they may import</caption>
            <thead>
              <tr>
                <th scope="col">Layer</th>
                <th scope="col">Holds</th>
                <th scope="col">May import</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Tokens</th>
                <td>
                  {tiers('reference')} reference, {tiers('semantic')} semantic and {tiers('component')} component tokens;
                  prop vocabularies
                </td>
                <td>Nothing</td>
              </tr>
              <tr>
                <th scope="row">Layout</th>
                <td>Box, Stack, Inline, Grid, Container</td>
                <td>Tokens</td>
              </tr>
              <tr>
                <th scope="row">Primitives</th>
                <td>Text, Heading, Button, Badge, Icon, form controls</td>
                <td>Tokens, layout</td>
              </tr>
              <tr>
                <th scope="row">Composites</th>
                <td>Card, Dialog, Alert, Tabs, Field, PageHeader, EmptyState</td>
                <td>Tokens, layout, primitives</td>
              </tr>
              <tr>
                <th scope="row">Domain</th>
                <td>The catalog and changelog, EntryCard, ActivityList</td>
                <td>Design system</td>
              </tr>
              <tr>
                <th scope="row">Features</th>
                <td>Docs rendering, directory filters, demo scenarios, playground engine</td>
                <td>Design system, domain</td>
              </tr>
              <tr>
                <th scope="row">Content</th>
                <td>Component docs, playground stories, foundations, patterns, fixtures</td>
                <td>Design system, domain, features</td>
              </tr>
              <tr>
                <th scope="row">App</th>
                <td>Routes, shell, theme provider, pages</td>
                <td>Everything</td>
              </tr>
            </tbody>
          </table>
          <p>
            The design system and domain may not import React Router. <code>scripts/architecture/check-boundaries.mjs</code>{' '}
            enforces the table, and <code>check-styles.mjs</code> enforces cascade layers and token-only CSS variables.
          </p>
        </Prose>
        <SourceList
          sources={[
            { path: 'scripts/architecture/boundaries.mjs', note: 'The layer rules' },
            { path: 'scripts/architecture/check-styles.mjs', note: 'Cascade layers and token usage' },
            { path: 'src/design-system/styles/index.css', note: 'Layer order' },
          ]}
        />
      </DocSection>

      <DocSection id="site" title="How this site is built">
        <Prose>
          <ul>
            <li>Every page, including this one, is built from the components it documents.</li>
            <li>
              The section navigation, the Components index and the resource directory demo all read one catalog (
              <code>src/domain/system/catalog.ts</code>). The {entriesOfKind('component').length} component entries are the
              same entries the directory demo searches.
            </li>
            <li>Token tables, alias chains and contrast ratios are rendered from the generated token manifest.</li>
            <li>Source panels load the real files at build time, so the code shown is the code that runs.</li>
          </ul>
        </Prose>
      </DocSection>

      <DocSection id="contributing" title="Contributing">
        <Prose>
          <ol>
            <li>Search the Components index. Extending an existing component is usually better than adding one.</li>
            <li>Propose new components with the form in the Form validation pattern, or in the repository.</li>
            <li>Add tokens before CSS: a new visual decision needs a semantic or component token first.</li>
            <li>Add a catalog entry, a ComponentDoc and, for components with visual props, a playground story.</li>
            <li>
              Run <code>npm run verify</code>: lint, boundaries, styles, types, unit tests and the build. Run the end-to-end
              suite for keyboard, theme and reflow checks.
            </li>
          </ol>
        </Prose>
        <Note title="Read next">
          <p>
            Start with <Link href="/foundations/tokens">token architecture</Link>, then open{' '}
            <Link href="/components/button">Button</Link> to follow a prop all the way to a palette color.
          </p>
        </Note>
      </DocSection>
    </Stack>
  );
}

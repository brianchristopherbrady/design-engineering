import { Card } from '@/design-system/composites';
import { Grid, ScrollRegion, Stack } from '@/design-system/layout';
import { Heading, Link, Text } from '@/design-system/primitives';
import { tokenCounts } from '@/design-system/tokens';
import { catalog, entriesOfKind, summarizeCatalog, type EntryLayer } from '@/domain/system';
import { DocSection, Prose, SourceList } from '@/features/docs';
import { Horizon } from './Horizon';

export const overviewSections = [
  { id: 'about', label: 'About this project' },
  { id: 'review', label: 'Suggested review path' },
  { id: 'site', label: 'How this site is built' },
  { id: 'principles', label: 'Principles' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'contributing', label: 'Contributing' },
] as const;

export interface OverviewAuthor {
  name: string;
  portfolio: string;
  caseStudy: string;
  repository: string;
}

const reviewPath = [
  {
    title: 'Token architecture',
    href: '/foundations/tokens',
    body: 'Three tiers, a dependency policy the build enforces, and a trace from any component token to the value the browser computes.',
  },
  {
    title: 'Button, then its Playground',
    href: '/components/button',
    body: 'Purpose, props, states, accessibility and the token behind each prop. Then change the real props and copy the matching code.',
    also: { label: 'Open Button in the Playground', href: '/playground?component=button' },
  },
  {
    title: 'Products and modes',
    href: '/foundations/products',
    body: 'One token source resolved into three products, two themes and two densities. The Product, Theme and Density controls in the header switch this whole site.',
    also: { label: 'Generate a product in the Theme studio', href: '/foundations/theme-studio' },
  },
  {
    title: 'A complete pattern',
    href: '/patterns/form-validation',
    body: 'Validation on submit, an error summary that receives focus and links to each field, and recovery as fields are corrected.',
  },
  {
    title: 'Design decisions',
    href: '/decisions',
    body: 'The reasoning behind a system: requirements, what two products should share, implementation approaches, and how to measure the result.',
  },
] as const;

const componentNames = (layer: EntryLayer) =>
  entriesOfKind('component')
    .filter((entry) => entry.layer === layer)
    .map((entry) => entry.name)
    .join(', ');

export function OverviewContent({ author }: { author: OverviewAuthor }) {
  const summary = summarizeCatalog(catalog);
  const tiers = (tier: keyof typeof tokenCounts) => tokenCounts[tier];
  return (
    <Stack gap="extraExtraLarge">
      <Horizon
        readouts={[
          { label: 'Tokens', value: tokenCounts.total },
          { label: 'Components', value: summary.byKind.component },
          { label: 'Foundations', value: summary.byKind.foundation },
          { label: 'Patterns', value: summary.byKind.pattern },
        ]}
      />

      <DocSection id="about" title="About this project">
        <Prose>
          <p>
            <Link href={author.portfolio}>{author.name}</Link> created Design System Lab to demonstrate design-system thinking
            and implementation in one place. It is a complete, small design system of {tokenCounts.total} tokens,{' '}
            {summary.byKind.component} components, {summary.byKind.foundation} foundations and {summary.byKind.pattern}{' '}
            patterns, and the website that documents it is built entirely from that system.
          </p>
          <p>
            Every decision can be inspected, from the prop a developer writes down to the color or length the browser
            paints. Each component page shows a working demo first, then its purpose, props and defaults, the tokens behind
            each prop, keyboard and screen-reader behavior, responsive behavior and the source that implements it.
          </p>
        </Prose>
        <Text variant="bodySmall">
          <Link href={author.caseStudy}>Read the case study</Link> · <Link href={author.repository}>Browse the source on GitHub</Link>
        </Text>
      </DocSection>

      <DocSection id="review" title="Suggested review path">
        <Text tone="muted">Five stops, each showing a different kind of evidence. Any of them stands on its own.</Text>
        <Grid as="ol" minColumnWidth="medium" gap="medium" aria-label="Suggested review path">
          {reviewPath.map((stop, index) => (
            <Card as="li" key={stop.href} padding="medium">
              <Stack gap="extraSmall">
                <Text as="span" variant="caption" tone="muted" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Heading level={3} size="small">
                  <Link href={stop.href} variant="standalone">
                    {stop.title}
                  </Link>
                </Heading>
                <Text variant="bodySmall" tone="muted">
                  {stop.body}
                </Text>
                {'also' in stop && (
                  <Text variant="bodySmall">
                    <Link href={stop.also.href}>{stop.also.label}</Link>
                  </Text>
                )}
              </Stack>
            </Card>
          ))}
        </Grid>
      </DocSection>

      <DocSection id="site" title="How this site is built">
        <Prose>
          <ul>
            <li>Every page, including this one, is built from the components it documents, and styled only with its tokens.</li>
            <li>
              The section navigation, the Components index and the resource directory demo all read one catalog (
              <code>src/domain/system/catalog.ts</code>). The {entriesOfKind('component').length} component entries are the
              same entries the directory demo searches.
            </li>
            <li>Token tables, alias chains and contrast ratios are rendered from the generated token manifest.</li>
            <li>Props tables are typed against the components’ own props, and source panels load the real files, so the code shown is the code that runs.</li>
            <li>
              The Product, Theme and Density controls in the header re-scope the whole site. No component knows which one is
              active; the change happens in CSS custom properties.
            </li>
          </ul>
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
          <p>
            <Link href="/decisions/planning#principles">How these principles resolve competing priorities</Link>, and one
            traced from requirement to validation.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="architecture" title="Architecture">
        <Prose>
          <p>The code is layered. Each layer may import only from the layers before it, and only through a public index.</p>
          <ScrollRegion axis="inline" aria-label="Layers and what they may import">
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
                    {tiers('reference')} reference, {tiers('semantic')} semantic and {tiers('component')} component
                    tokens; prop vocabularies
                  </td>
                  <td>Nothing</td>
                </tr>
                <tr>
                  <th scope="row">Layout</th>
                  <td>{componentNames('Layout')}</td>
                  <td>Tokens</td>
                </tr>
                <tr>
                  <th scope="row">Primitives</th>
                  <td>{componentNames('Primitive')}</td>
                  <td>Tokens, layout</td>
                </tr>
                <tr>
                  <th scope="row">Composites</th>
                  <td>{componentNames('Composite')}</td>
                  <td>Tokens, layout, primitives</td>
                </tr>
                <tr>
                  <th scope="row">Domain</th>
                  <td>The catalog and changelog, the sharing comparison, EntryCard, ActivityList</td>
                  <td>Design system</td>
                </tr>
                <tr>
                  <th scope="row">Features</th>
                  <td>Docs rendering, directory filters, demo scenarios, playground engine, theming tools</td>
                  <td>Design system, domain</td>
                </tr>
                <tr>
                  <th scope="row">Content</th>
                  <td>Component docs, playground stories, foundations, patterns, fixtures, design decisions</td>
                  <td>Design system, domain, features</td>
                </tr>
                <tr>
                  <th scope="row">App</th>
                  <td>Routes, shell, theme provider, pages</td>
                  <td>Everything</td>
                </tr>
              </tbody>
            </table>
          </ScrollRegion>
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
      </DocSection>
    </Stack>
  );
}

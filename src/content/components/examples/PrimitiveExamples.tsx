import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { Field } from '@/design-system/composites';
import { Grid, Inline, Stack } from '@/design-system/layout';
import {
  Badge,
  badgeAppearances,
  badgeSizes,
  Button,
  buttonAppearances,
  buttonBorders,
  buttonSizes,
  Checkbox,
  Heading,
  Icon,
  iconNames,
  Input,
  Link,
  Progress,
  Select,
  Skeleton,
  Switch,
  Text,
  textTones,
  textVariants,
  VisuallyHidden,
} from '@/design-system/primitives';
import { radiusScale, toneScale } from '@/design-system/tokens';
import { LiveExample } from '@/features/docs';
import { NarrowAndWide } from './frames';
import styles from './examples.module.css';

const source = 'src/content/components/examples/PrimitiveExamples.tsx';

function Matrix({ columns, children }: { columns: number; children: ReactNode }) {
  return (
    <div className={styles.matrix} style={{ '--_columns': columns } as CSSProperties}>
      {children}
    </div>
  );
}

export function TextExample() {
  return (
    <>
      <LiveExample title="Typography variants" kind="recommended" sourcePath={source}>
        <Stack gap="small">
          {textVariants.map((variant) => (
            <Text key={variant} variant={variant}>
              variant="{variant}": Tokens give decisions a name.
            </Text>
          ))}
        </Stack>
      </LiveExample>
      <LiveExample
        title="Tones"
        kind="recommended"
        sourcePath={source}
        description="Every tone meets 4.5:1 on every surface in both themes. Tone adds emphasis; the words carry the meaning."
      >
        <Stack gap="extraSmall">
          {textTones.map((tone) => (
            <Text key={tone} tone={tone}>
              tone="{tone}"
            </Text>
          ))}
        </Stack>
      </LiveExample>
    </>
  );
}

export function HeadingExample() {
  return (
    <LiveExample
      title="Level and size are independent"
      kind="recommended"
      sourcePath={source}
      description="The outline needs an h2 here, but the design calls for a small heading. Choose the level from the structure and the size from the design."
    >
      <Stack gap="medium">
        <Heading level={2} size="display">
          level 2, size display
        </Heading>
        <Heading level={2}>level 2, default size (large)</Heading>
        <Heading level={2} size="small" tone="muted">
          level 2, size small, tone muted
        </Heading>
      </Stack>
    </LiveExample>
  );
}

export function ButtonExample() {
  const [saving, setSaving] = useState(false);
  return (
    <>
      <LiveExample
        title="Appearances and states"
        kind="recommended"
        sourcePath={source}
        description="Rows are appearances; columns are states. Hover and press the enabled buttons to see the hover and active tokens."
      >
        <Matrix columns={3}>
          <span />
          <span className={styles.matrixHeading}>Default</span>
          <span className={styles.matrixHeading}>Loading</span>
          <span className={styles.matrixHeading}>Disabled</span>
          {buttonAppearances.map((appearance) => (
            <Row key={appearance} appearance={appearance} />
          ))}
        </Matrix>
      </LiveExample>
      <LiveExample title="Sizes, borders and radii" kind="recommended" sourcePath={source}>
        <Stack gap="medium">
          <Inline gap="small">
            {buttonSizes.map((size) => (
              <Button key={size} size={size}>
                size="{size}"
              </Button>
            ))}
          </Inline>
          <Inline gap="small">
            {buttonBorders.map((border) => (
              <Button key={border} border={border}>
                border="{border}"
              </Button>
            ))}
          </Inline>
          <Inline gap="small">
            {radiusScale.map((radius) => (
              <Button key={radius} radius={radius} appearance="primary">
                radius="{radius}"
              </Button>
            ))}
          </Inline>
        </Stack>
      </LiveExample>
      <LiveExample
        title="Icons, loading and full width"
        kind="recommended"
        sourcePath={source}
        description="Icons are decorative: the label names the action. Loading keeps the button focusable and its name unchanged, and a status message announces the result."
      >
        <NarrowAndWide>
          <Stack gap="small">
            <Inline gap="small">
              <Button appearance="primary" iconStart={<Icon name="plus" />}>
                Add entry
              </Button>
              <Button iconEnd={<Icon name="arrowRight" />}>Next</Button>
              <Button appearance="ghost" border="none" aria-label="Refresh" iconStart={<Icon name="refresh" />} />
            </Inline>
            <Button
              appearance="primary"
              fullWidth
              loading={saving}
              onClick={() => {
                setSaving(true);
                window.setTimeout(() => setSaving(false), 1500);
              }}
            >
              Save changes
            </Button>
            <Text variant="bodySmall" tone="muted" role="status">
              {saving ? 'Saving…' : ''}
            </Text>
            <Button>A button with a long label that wraps onto a second line inside narrow containers</Button>
          </Stack>
        </NarrowAndWide>
      </LiveExample>
    </>
  );
}

function Row({ appearance }: { appearance: (typeof buttonAppearances)[number] }) {
  return (
    <>
      <code>{appearance}</code>
      <Button appearance={appearance}>Save</Button>
      <Button appearance={appearance} loading>
        Save
      </Button>
      <Button appearance={appearance} disabled>
        Save
      </Button>
    </>
  );
}

export function BadgeExample() {
  return (
    <>
      <LiveExample
        title="Tones and appearances"
        kind="recommended"
        sourcePath={source}
        description="Each cell reads the same tone tokens; the appearance picks which roles become background, text and border."
      >
        <Matrix columns={3}>
          <span />
          {badgeAppearances.map((appearance) => (
            <span key={appearance} className={styles.matrixHeading}>
              {appearance}
            </span>
          ))}
          {toneScale.map((tone) => (
            <BadgeRow key={tone} tone={tone} />
          ))}
        </Matrix>
      </LiveExample>
      <LiveExample title="Sizes, radii and icons" kind="recommended" sourcePath={source}>
        <Stack gap="small">
          <Inline gap="small">
            {badgeSizes.map((size) => (
              <Badge key={size} size={size} tone="brand">
                size="{size}"
              </Badge>
            ))}
          </Inline>
          <Inline gap="small">
            <Badge tone="success" icon={<Icon name="check" />}>
              Passed
            </Badge>
            <Badge tone="danger" appearance="filled" icon={<Icon name="danger" />}>
              Failed
            </Badge>
            <Badge tone="neutral" radius="small" appearance="outlined">
              radius="small"
            </Badge>
          </Inline>
        </Stack>
      </LiveExample>
    </>
  );
}

function BadgeRow({ tone }: { tone: (typeof toneScale)[number] }) {
  return (
    <>
      <code>{tone}</code>
      {badgeAppearances.map((appearance) => (
        <Badge key={appearance} tone={tone} appearance={appearance}>
          {tone}
        </Badge>
      ))}
    </>
  );
}

export function IconExample() {
  return (
    <LiveExample
      title="The icon set"
      kind="recommended"
      sourcePath={source}
      description="Icons inherit the text color. Without a label they are hidden from assistive technology."
    >
      <Grid minColumnWidth="extraSmall" gap="small">
        {iconNames.map((name) => (
          <div key={name} className={styles.iconCell}>
            <Icon name={name} size="large" />
            <code>{name}</code>
          </div>
        ))}
      </Grid>
    </LiveExample>
  );
}

export function LinkExample() {
  return (
    <LiveExample title="Inline and standalone links" kind="recommended" sourcePath={source}>
      <Stack gap="small">
        <Text>
          Inline links such as <Link href="/foundations/color">the color foundation</Link> are always underlined, because
          color alone does not identify them inside text.
        </Text>
        <Link href="/components" variant="standalone">
          All components
        </Link>
      </Stack>
    </LiveExample>
  );
}

export function InputExample() {
  return (
    <LiveExample
      title="With Field"
      kind="recommended"
      sourcePath={source}
      description="Field supplies the id, description and error wiring; Input supplies the styled native control."
    >
      <Grid minColumnWidth="medium" gap="large">
        <Field label="Component name" description="As written in JSX.">
          {(control) => <Input {...control} defaultValue="Button" />}
        </Field>
        <Field label="Owner email" error="Enter an email address, like team@example.com." required>
          {(control) => <Input {...control} type="email" defaultValue="design-team" />}
        </Field>
        <Field label="Token path">
          {(control) => <Input {...control} readOnly value="button.primary.background" />}
        </Field>
        <Field label="Release">
          {(control) => <Input {...control} disabled value="4.2.0" />}
        </Field>
      </Grid>
    </LiveExample>
  );
}

export function SelectExample() {
  return (
    <LiveExample title="With Field" kind="recommended" sourcePath={source}>
      <Field label="Maturity" description="Beta components may change.">
        {(control) => (
          <Select {...control} defaultValue="stable">
            <option value="stable">Stable</option>
            <option value="beta">Beta</option>
            <option value="deprecated">Deprecated</option>
          </Select>
        )}
      </Field>
    </LiveExample>
  );
}

export function CheckboxExample() {
  return (
    <LiveExample title="Multiple independent choices" kind="recommended" sourcePath={source}>
      <fieldset>
        <legend>
          <Text as="span" variant="label">
            Show in the directory
          </Text>
        </legend>
        <Stack gap="small">
          <Checkbox label="Stable components" defaultChecked />
          <Checkbox label="Beta components" description="APIs may change between releases." />
          <Checkbox label="Deprecated components" disabled />
        </Stack>
      </fieldset>
    </LiveExample>
  );
}

export function SwitchExample() {
  const [compact, setCompact] = useState(false);
  return (
    <LiveExample
      title="A setting that applies immediately"
      kind="recommended"
      sourcePath={source}
      description="The switch changes the list right away; there is no Save button. Use Checkbox when a choice is submitted with a form."
    >
      <Stack gap="medium">
        <Switch label="Compact rows" checked={compact} onChange={(event) => setCompact(event.target.checked)} />
        <Stack gap={compact ? 'extraSmall' : 'medium'}>
          <Text variant={compact ? 'bodySmall' : 'body'}>Button</Text>
          <Text variant={compact ? 'bodySmall' : 'body'}>Badge</Text>
          <Text variant={compact ? 'bodySmall' : 'body'}>Card</Text>
        </Stack>
      </Stack>
    </LiveExample>
  );
}

export function ProgressExample() {
  return (
    <LiveExample title="Determinate progress" kind="recommended" sourcePath={source}>
      <Stack gap="medium">
        <Progress label="Components documented" value={24} max={24} valueText="24 of 24" />
        <Progress label="Dark theme contrast checks" value={38} />
      </Stack>
    </LiveExample>
  );
}

export function SkeletonExample() {
  const headingId = useId();
  return (
    <LiveExample
      title="Loading placeholder with an announced status"
      kind="recommended"
      sourcePath={source}
      description="Skeletons are hidden from assistive technology; the status text and aria-busy carry the loading state."
    >
      <section aria-busy="true" aria-labelledby={headingId}>
        <Stack gap="small">
          <Heading level={3} size="small" id={headingId}>
            Recent changes
          </Heading>
          <Text role="status" variant="bodySmall" tone="muted">
            Loading recent changes…
          </Text>
          <Inline gap="small" wrap={false} align="start">
            <Skeleton shape="circle" size="small" />
            <div style={{ flex: 1 }}>
              <Skeleton lines={2} />
            </div>
          </Inline>
          <Skeleton shape="block" size="medium" />
        </Stack>
      </section>
    </LiveExample>
  );
}

export function VisuallyHiddenExample() {
  return (
    <LiveExample
      title="Context for repeated controls"
      kind="recommended"
      sourcePath={source}
      description="Each button reads as “Pin Button”, “Pin Badge” and so on, while sighted users see the row context."
    >
      <Stack as="ul" gap="small">
        {['Button', 'Badge'].map((name) => (
          <Inline as="li" key={name} justify="between">
            <Text as="span">{name}</Text>
            <Button size="small" iconStart={<Icon name="star" />}>
              Pin<VisuallyHidden> {name}</VisuallyHidden>
            </Button>
          </Inline>
        ))}
      </Stack>
    </LiveExample>
  );
}

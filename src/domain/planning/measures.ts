/**
 * Measures of a design system's success, each with how to start collecting it cheaply and how it can mislead.
 * Targets are examples of phrasing, not results.
 */

export interface Measure {
  id: string;
  name: string;
  definition: string;
  baseline: string;
  target: string;
  collection: string;
  cadence: string;
  owner: string;
  limitations: string;
  /** The cheapest useful way to begin, before any tooling exists. */
  startSmall: string;
}

export const measures: readonly Measure[] = [
  {
    id: 'adoption',
    name: 'Adoption across eligible interface instances',
    definition: 'Of the places where a system component could be used, the share that use it. A screen with three buttons, two of them system Buttons, scores two of three.',
    baseline: 'A static scan of each product before the pilot: every native button, input, select and dialog, and every system usage.',
    target: 'Set per product after the baseline; for example, 60% of eligible instances in the pilot product within two quarters.',
    collection: 'A code scan that counts system imports against matching native elements and known look-alike components.',
    cadence: 'Every release, reported per product and per component.',
    owner: 'System team, with product leads reviewing their numbers.',
    limitations: 'Counts usage, not quality. A wrapper that restyles a system component counts as adoption while defeating it. Eligible instances need a definition everyone accepts.',
    startSmall: 'Search each codebase for native buttons, inputs and dialogs and for system imports, and record the two counts in a spreadsheet.',
  },
  {
    id: 'delivery',
    name: 'Time to implement comparable interface tasks',
    definition: 'Elapsed engineering time for a defined task (for example, “add a filterable list with empty and error states”) built with and without the system.',
    baseline: 'Time the task in each product before the pilot, by the same people where possible.',
    target: 'A meaningful reduction for the pilot task, judged with the variance across people, not a single number.',
    collection: 'Timed exercises, or tracked tickets of comparable size with a shared definition of done that includes states and accessibility.',
    cadence: 'At the pilot, then twice a year.',
    owner: 'Product engineering managers.',
    limitations: 'Small samples, learning effects and different definitions of done swamp the signal. Speed without the states and accessibility is not the same task.',
    startSmall: 'Pick one routine task, such as a list with empty and error states, and time it once before the pilot and once after.',
  },
  {
    id: 'overrides',
    name: 'Duplicate components and unapproved overrides',
    definition: 'Local reimplementations of system components, and styles that override system tokens or classes outside the documented props.',
    baseline: 'An inventory of look-alike components and hard-coded values before migration.',
    target: 'No new duplicates; existing ones trend down each quarter.',
    collection: 'Lint rules for raw colors and non-token variables; a scan for components whose names or markup mirror system components.',
    cadence: 'Every pull request (lint) and monthly (inventory).',
    owner: 'System team.',
    limitations: 'Some overrides are legitimate product decisions waiting for a token. The count shows pressure on the system as much as non-compliance.',
    startSmall: 'Count hard-coded colors and copies of the inventory’s most duplicated component; repeat the count each release.',
  },
  {
    id: 'accessibility',
    name: 'Accessibility defects and regressions',
    definition: 'Defects against WCAG 2.2 AA found in system components and in product screens built from them, by severity and by whether the system or the composition caused them.',
    baseline: 'An audit of each product’s main workflows before the pilot.',
    target: 'No open critical defects in stable components; regressions caught before release.',
    collection: 'Automated scans and keyboard tests in CI, manual screen-reader passes per release, and the defect tracker.',
    cadence: 'Every pull request (automated) and every release (manual).',
    owner: 'System team for components; product teams for compositions.',
    limitations: 'Automated scans find a minority of issues. A clean scan is not conformance, and fewer reported defects can mean less testing.',
    startSmall: 'Tag existing accessibility bugs with the component they belong to, then run an automated scan on a few key screens.',
  },
  {
    id: 'findability',
    name: 'Developers find and correctly use components',
    definition: 'Whether a developer new to the system can find the right component for a task and use it correctly the first time.',
    baseline: 'Task-based sessions with a few developers before documentation work.',
    target: 'Most participants complete the tasks without help; misuse found in review falls over time.',
    collection: 'Short moderated sessions, documentation search logs and review comments tagged “wrong component”.',
    cadence: 'Quarterly sessions; continuous review tagging.',
    owner: 'System designer and documentation owner.',
    limitations: 'Session participants are few and know they are observed. Search logs show what people look for, not whether they found it.',
    startSmall: 'Ask five engineers to build a small screen with the documentation and watch where they search, guess or copy.',
  },
  {
    id: 'consistency',
    name: 'Design-to-code consistency',
    definition: 'Agreement between the design library and the coded components: names, properties, values and states.',
    baseline: 'A parity review of the pilot components.',
    target: 'Every stable component has a property mapping with no unexplained differences.',
    collection: 'Component manifests compared with the design library’s exported properties.',
    cadence: 'Every release of either library.',
    owner: 'System designer and system engineer together.',
    limitations: 'Parity of names does not prove parity of behavior; some differences are intentional and need recording rather than removing.',
    startSmall: 'Compare one component’s properties and variants in the design library with its props in code, and list the differences.',
  },
  {
    id: 'upgrades',
    name: 'Upgrade and migration effort',
    definition: 'Time and changes a product needs to adopt a new system release, and how many products lag behind the current major version.',
    baseline: 'The first two upgrades after the pilot.',
    target: 'Minor upgrades need no product changes; major upgrades ship with notes and, where possible, codemods.',
    collection: 'Upgrade pull requests per product: time open, files changed, issues raised.',
    cadence: 'Every release.',
    owner: 'System team, with each product’s upgrade owner.',
    limitations: 'Products batch upgrades with other work, which blurs the effort attributable to the system.',
    startSmall: 'Ask each product team to log the hours spent on the next system upgrade.',
  },
  {
    id: 'contribution',
    name: 'Contribution turnaround',
    definition: 'Time from a contribution proposal to a decision, and from acceptance to release.',
    baseline: 'The first five contributions.',
    target: 'A decision within five working days.',
    collection: 'Timestamps from the contribution tracker.',
    cadence: 'Monthly.',
    owner: 'System team lead.',
    limitations: 'Fast decisions can mean shallow review. Pair it with the number of contributions reworked after release.',
    startSmall: 'Label contribution pull requests and record the dates they were opened and merged.',
  },
  {
    id: 'exceptions',
    name: 'Frequency and cost of product exceptions',
    definition: 'How often a product needs something the system does not provide, and what each exception costs to build and maintain.',
    baseline: 'Exceptions recorded during the pilot.',
    target: 'Exceptions are recorded and reviewed; repeated ones become system features or are accepted as product-owned.',
    collection: 'An exceptions log with the product, the reason and the decision.',
    cadence: 'Reviewed monthly.',
    owner: 'System team with product design leads.',
    limitations: 'Teams stop logging exceptions when logging is tedious; zero logged exceptions may mean an unused process.',
    startSmall: 'Keep a shared log: what each product built outside the system, why, and how long it took.',
  },
  {
    id: 'completion',
    name: 'Product task completion, errors and usability',
    definition: 'Whether people finish the product tasks the system supports, how often they hit errors, and whether they recover.',
    baseline: 'Product analytics and usability findings for the pilot workflows before migration.',
    target: 'No drop in completion during migration; higher recovery after errors in the migrated workflow.',
    collection: 'Product analytics events for task start, completion, error and retry; periodic usability sessions.',
    cadence: 'Continuous analytics; usability sessions twice a year.',
    owner: 'Product teams, with the system team reviewing workflow-level findings.',
    limitations: 'Outcomes have many causes. Attributing a change to the system needs a comparison, such as a staged rollout.',
    startSmall: 'Use the analytics you already have for one workflow: starts, completions and error messages shown.',
  },
];

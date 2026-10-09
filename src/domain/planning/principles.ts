export type PrincipleId = 'decisions' | 'native' | 'context' | 'clarity' | 'meaning' | 'evidence';

export interface Principle {
  id: PrincipleId;
  title: string;
  statement: string;
  /** A common decision the principle settles. */
  example: { question: string; answer: string };
  /** From principle to measure: how the principle becomes something that can be checked. */
  trace: {
    decision: string;
    implementation: string;
    verification: string;
    measure: { id: string; label: string };
  };
}

export const principles: readonly Principle[] = [
  {
    id: 'decisions',
    title: 'Name decisions, not values',
    statement: 'A visual choice is made once, named and reused. Products and themes remap names; they do not restyle components.',
    example: {
      question: 'One product wants tighter corners. Add a radius prop to every usage in that product?',
      answer: 'No. The product’s token overrides re-point the radius roles; no component or usage changes.',
    },
    trace: {
      decision: 'Tokens in tiers (reference, semantic, component) with a written rule for which tier may read which.',
      implementation: 'Token sources in a standard format, a build that generates CSS variables and types, and components that read only tokens.',
      verification: 'A lint rule that rejects raw values, and a build that fails when a token is missing or aliases the wrong tier.',
      measure: { id: 'overrides', label: 'Duplicate components and unapproved overrides' },
    },
  },
  {
    id: 'native',
    title: 'Native first, then enhance',
    statement: 'Start from the platform element that already has the right semantics, keyboard behavior and forced-colors support.',
    example: {
      question: 'A table needs row selection. Build a styled div with role="checkbox"?',
      answer: 'No. Use a native checkbox whose accessible name says which row it selects.',
    },
    trace: {
      decision: 'Components wrap native elements; custom behavior is added only where the platform has none.',
      implementation: 'Buttons are buttons, dialogs use the dialog element, form controls participate in native forms.',
      verification: 'Automated accessibility scans, keyboard tests and screen-reader passes per component.',
      measure: { id: 'accessibility', label: 'Accessibility defects and regressions' },
    },
  },
  {
    id: 'context',
    title: 'Preserve people’s context',
    statement: 'Nothing the system does should cost people their place, their input or their understanding of what happened.',
    example: {
      question: 'A form submission fails. Reset the form so people can start clean?',
      answer: 'No. Keep every answer, say what failed in words, move focus to the problem and offer a way forward.',
    },
    trace: {
      decision: 'Request state lives outside components in one place; components never clear what people entered.',
      implementation: 'A shared request state model (loading, success, error, retry) and form components that keep values across errors.',
      verification: 'Browser tests that force failures and check input, focus and recovery.',
      measure: { id: 'completion', label: 'Task completion and recovery after errors' },
    },
  },
  {
    id: 'clarity',
    title: 'Say the same thing the same way',
    statement: 'Statuses, actions, dates and numbers use one vocabulary and one format across every product.',
    example: {
      question: 'One product says “Pending” and another says “Awaiting approval” for the same state. Leave each team’s wording?',
      answer: 'No. Agree one status vocabulary, put it in shared code, and have every product render it from there.',
    },
    trace: {
      decision: 'Shared types and formatting functions for statuses and dates, owned by the system.',
      implementation: 'A status type with a label for every value, and formatting helpers used by every product.',
      verification: 'Unit tests for every status label and format, including locale and time-zone cases.',
      measure: { id: 'consistency', label: 'Design-to-code consistency' },
    },
  },
  {
    id: 'meaning',
    title: 'Share meaning, not layout',
    statement: 'Products share what a control means and how it behaves; each composes screens for its own users.',
    example: {
      question: 'Should a consumer app and an internal tool share one page template for the same task?',
      answer: 'Usually not. They share fields, buttons, states and vocabulary; the screens differ because the users and tasks differ.',
    },
    trace: {
      decision: 'Shared foundations and core components; compositions owned by each product.',
      implementation: 'A core package of components and patterns, with product-owned screens and a documented path for promoting product components.',
      verification: 'A pilot in two products built without forking a shared component.',
      measure: { id: 'exceptions', label: 'Frequency and cost of product exceptions' },
    },
  },
  {
    id: 'evidence',
    title: 'Evidence over assertion',
    statement: 'A claim about the system is backed by something that fails when the claim stops being true.',
    example: {
      question: 'The documentation says every component is accessible. Is the sentence enough?',
      answer: 'No. Say what was tested, how, and what was not; make the tests run in CI; generate the documentation from the same sources.',
    },
    trace: {
      decision: 'Documentation is generated from types, token output and tests wherever possible.',
      implementation: 'Props tables typed against component props, token tables from the token build, and maturity labels with written requirements.',
      verification: 'Tests that compare documentation with implementation and fail on drift.',
      measure: { id: 'findability', label: 'People find and correctly use components' },
    },
  },
];

export const principleById = (id: string) => principles.find((principle) => principle.id === id);

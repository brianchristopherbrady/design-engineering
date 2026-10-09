import type { Decision } from '../types';

const element = `// Conceptual sketch: a switch that joins native forms.
class DsSwitch extends HTMLElement {
  static formAssociated = true;
  #internals = this.attachInternals();

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(value: boolean) {
    this.toggleAttribute('checked', value);
    this.#internals.setFormValue(value ? 'on' : null);
    this.#internals.ariaChecked = String(value);
  }

  connectedCallback() {
    this.#internals.role = 'switch';
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
    this.addEventListener('click', () => this.#toggle());
    this.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.#toggle();
      }
    });
  }

  #toggle() {
    this.checked = !this.checked;
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

customElements.define('ds-switch', DsSwitch);`;

const usage = `<form>
  <label for="updates">Email me updates</label>
  <ds-switch id="updates" name="updates"></ds-switch>
</form>`;

export const implementation: Decision = {
  id: 'implementation',
  question: 'How should one design system reach products built with different frameworks?',
  answer:
    'Choose the narrowest approach that covers the products that actually exist. One framework is best served by components written for it. Web Components with thin adapters earn their cost only when several frameworks must share complex interactive behavior and a team can own the integration work. Tokens should be framework-free either way.',
  sections: [
    {
      id: 'current',
      title: 'What this project implements',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            '**Implemented:** this system is a React 19 component library. Its tokens are framework-free: authored as DTCG JSON and generated as CSS custom properties and TypeScript, so any stack could read them. Components are styled with CSS Modules that read only those variables.',
            '**Not implemented:** there are no Web Components and no adapters for other frameworks. Everything on this page about them is analysis and a labelled conceptual example, not a working implementation.',
          ],
        },
        {
          kind: 'evidence',
          items: [
            { label: 'Token pipeline', href: '/foundations/tokens#pipeline', shows: 'From DTCG source files to CSS custom properties and types.' },
            { label: 'Components', href: '/components', shows: 'The React components, with props, states and source.' },
            { label: 'Playground', href: '/playground', shows: 'Real props on real components, with the matching code.' },
          ],
        },
      ],
    },
    {
      id: 'approaches',
      title: 'Four approaches',
      blocks: [
        {
          kind: 'table',
          caption: 'Ways to support more than one framework',
          columns: ['Approach', 'What is shared', 'Fits when', 'Costs'],
          rows: [
            ['Components for one framework', 'Components, tokens and CSS', 'Every product uses the same framework, now and for the foreseeable future.', 'Products on another framework get only tokens and CSS.'],
            ['A separate implementation per framework', 'Tokens, CSS and written specifications', 'Two frameworks, each with a large team, and behavior that can be specified precisely.', 'Every fix and feature is made twice, and behavior drifts without parity reviews.'],
            ['Shared tokens and CSS only', 'Values and class names', 'Many stacks, including server-rendered pages, and mostly simple controls.', 'Interactive behavior and accessibility are rebuilt by each product.'],
            ['Web Components with framework adapters', 'One implementation of each control, wrapped for each framework', 'Several frameworks must share complex controls, and a team can own adapters, testing in every host and server rendering.', 'Integration work in every framework. Styling and accessibility across shadow boundaries need care.'],
          ],
        },
      ],
    },
    {
      id: 'web-components',
      title: 'What Web Components require',
      blocks: [
        { kind: 'text', paragraphs: ['Choosing Web Components is not one decision. Each of these needs an answer before the first component ships.'] },
        {
          kind: 'table',
          caption: 'Decisions, and what to weigh for each',
          columns: ['Decision', 'The question', 'What to weigh'],
          rows: [
            ['Attributes and properties', 'Which inputs are attributes and which are properties?', 'Attributes are strings that work in plain HTML and server-rendered pages. Objects and arrays need properties, which frameworks set in different ways.'],
            ['Events', 'How does a control report changes?', 'Standard events such as `change` and `input` behave predictably. Custom events need documented names and payloads, and each framework binds them differently.'],
            ['Styling boundaries', 'Shadow DOM or light DOM?', 'Shadow DOM protects a component’s internals, but page styles stop at the boundary. CSS custom properties pass through, so tokens still apply, and `::part()` can expose chosen internals.'],
            ['Slots', 'Where can people put their own content?', 'Slotted content stays in the page, so it remains styleable and accessible. Too many slots make an API hard to learn.'],
            ['Form participation', 'Does the control submit a value and take part in validation?', 'Form-associated custom elements use `ElementInternals` to set a value, validity and states. Without it, controls need hidden inputs.'],
            ['Accessibility', 'Do names, descriptions and relationships still work?', 'ID references such as `aria-labelledby` do not cross shadow roots, so labels and descriptions must live inside the component or be supplied another way.'],
            ['Server rendering', 'What appears before JavaScript runs?', 'Declarative shadow DOM can render markup on the server. Without it, controls appear late or unstyled.'],
            ['Testing', 'How is every host covered?', 'Test each element on its own, then inside each framework, including forms and focus.'],
            ['Adapters', 'What does each framework wrapper do?', 'Keep wrappers thin: types, property and event mapping, and form integration such as Angular’s `ControlValueAccessor`. React 19 passes properties and events to custom elements directly, which reduces wrapper work but does not remove it.'],
          ],
        },
      ],
    },
    {
      id: 'example',
      title: 'A conceptual example',
      blocks: [
        {
          kind: 'code',
          evidence: 'conceptual',
          language: 'ts',
          caption: 'A sketch to make the decisions above concrete. It omits disabled and read-only states, styling, server rendering and tests, and nothing like it ships in this project.',
          code: element,
        },
        {
          kind: 'code',
          evidence: 'conceptual',
          language: 'html',
          caption: 'Because it is form-associated, a native `<label>` names it and the form submits its value, in any framework or none.',
          code: usage,
        },
      ],
    },
    {
      id: 'deciding',
      title: 'How I would decide',
      blocks: [
        {
          kind: 'steps',
          items: [
            { title: 'List the frameworks and their lifespans', text: 'Count the frameworks in production and the ones being retired. A framework that will be gone in a year does not need an adapter.' },
            { title: 'Find the controls worth sharing', text: 'Shared code pays off for controls with complex behavior, such as comboboxes, date pickers and dialogs. Simple controls can share tokens and CSS.' },
            { title: 'Spike one form control in every host', text: 'Build one control as a custom element, wrap it for each framework, and test forms, focus and server rendering.' },
            { title: 'Compare the costs', text: 'Weigh adapter and testing work against building the control once per framework.' },
            { title: 'Decide per layer', text: 'Keep tokens framework-free regardless. Decide component code separately, and revisit when the framework mix changes.' },
          ],
        },
        {
          kind: 'note',
          title: 'Scope',
          text: 'Moving this project to Web Components would be a separate project. This page records the reasoning; it does not claim a working implementation.',
        },
      ],
    },
  ],
  sources: ['custom-elements', 'apg', 'wcag'],
};

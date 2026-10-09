import type { TokenRecord, TokenValue } from './generated/manifest';
import type { ModifierInput } from './generated/tokens';

/** The value a token takes in one permutation of the modifiers, read from its manifest record. */
export function tokenValueIn(record: TokenRecord, input: ModifierInput): TokenValue {
  if (!record.variants) return record.values[input.theme];
  const match = record.variants.find((variant) =>
    Object.entries(variant.input).every(([name, context]) => input[name as keyof ModifierInput] === context),
  );
  return match ?? record.values[input.theme];
}

/** The selector the pipeline declares a token under for one permutation: only the modifiers it depends on. */
export function tokenSelectorIn(record: TokenRecord, input: ModifierInput): string {
  if (record.dependsOn.length === 0) return ':root';
  return record.dependsOn.map((name) => `[data-${name}='${input[name as keyof ModifierInput]}']`).join('');
}

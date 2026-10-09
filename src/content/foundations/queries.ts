export interface QueryRule {
  file: string;
  line: number;
  kind: 'container' | 'media';
  /** Container name, or "nearest" for unnamed container queries. */
  target: string;
  condition: string;
  /** The comment directly above the rule, which in this codebase explains the threshold. */
  reason: string;
}

const RULE = /@(container|media)\s+([^{]+)\{/g;

/** Finds every @container and @media rule in a stylesheet, with the comment that justifies it. */
export function parseQueries(file: string, css: string): QueryRule[] {
  const rules: QueryRule[] = [];
  for (const match of css.matchAll(RULE)) {
    const kind = match[1] as QueryRule['kind'];
    const prelude = (match[2] ?? '').trim();
    const before = css.slice(0, match.index);
    const comment = /\/\*([^*]|\*(?!\/))*\*\/\s*$/.exec(before)?.[0] ?? '';
    const named = kind === 'container' ? /^([a-z][\w-]*)\s*(\(.*)$/i.exec(prelude) : null;
    rules.push({
      file,
      line: before.split('\n').length,
      kind,
      target: kind === 'media' ? 'viewport' : (named?.[1] ?? 'nearest'),
      condition: named?.[2] ?? prelude,
      reason: comment.trim().replace(/^\/\*+|\*+\/$/g, '').replace(/\s*\n\s*\*?\s*/g, ' ').trim(),
    });
  }
  return rules;
}

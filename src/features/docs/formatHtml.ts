const VOID_ELEMENT = /^<(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)\b/i;

/** Indents serialized HTML one level per open element so rendered markup is readable. */
export function formatHtml(html: string): string {
  const parts = html
    .replace(/>\s+</g, '><')
    .split(/(?=<)|(?<=>)/)
    .map((part) => part.trim())
    .filter(Boolean);

  let depth = 0;
  const lines: string[] = [];
  for (const part of parts) {
    if (part.startsWith('</')) {
      depth = Math.max(depth - 1, 0);
      lines.push(`${'  '.repeat(depth)}${part}`);
    } else if (part.startsWith('<')) {
      lines.push(`${'  '.repeat(depth)}${part}`);
      if (!part.endsWith('/>') && !VOID_ELEMENT.test(part)) depth += 1;
    } else {
      lines.push(`${'  '.repeat(depth)}${part}`);
    }
  }
  return lines.join('\n');
}

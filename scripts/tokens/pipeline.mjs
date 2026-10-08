// @ts-check
/**
 * Pure token pipeline: DTCG 2025.10 token files + a resolver document in,
 * CSS custom properties, TypeScript keys and an explorer manifest out.
 *
 * It implements the subset of the Format and Resolver modules this project uses
 * and fails loudly on anything else, so unsupported input never degrades silently.
 * File access lives in build-tokens.mjs; everything here is deterministic and testable.
 */

export class TokenError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'TokenError';
  }
}

/**
 * @typedef {'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight' | 'number' | 'cubicBezier' | 'shadow' | 'typography'} TokenType
 * @typedef {{ path: string, type: TokenType | undefined, value: unknown, description?: string, source: string, tier: string }} TokenDefinition
 * @typedef {{ path: string, type: TokenType, value: unknown, description?: string, source: string, tier: string, chain: string[], references: string[], resolved: unknown }} ResolvedToken
 * @typedef {{ sources: Array<{ $ref: string }>, $extensions?: Record<string, unknown> }} ResolverSet
 * @typedef {{ contexts: Record<string, Array<{ $ref: string }>>, default?: string, description?: string, $extensions?: Record<string, unknown> }} ResolverModifier
 * @typedef {{ version: string, name?: string, sets?: Record<string, ResolverSet>, modifiers?: Record<string, ResolverModifier>, resolutionOrder: Array<{ $ref: string }> }} ResolverDocument
 * @typedef {{ group: string, typeName: string, constName: string }} KeyGroup
 */

const SUPPORTED_TYPES = new Set([
  'color',
  'dimension',
  'duration',
  'fontFamily',
  'fontWeight',
  'number',
  'cubicBezier',
  'shadow',
  'typography',
]);
const GROUP_PROPERTIES = new Set(['$type', '$description', '$extensions', '$deprecated', '$schema']);
const TOKEN_PROPERTIES = new Set(['$value', '$type', '$description', '$extensions', '$deprecated']);
const REFERENCE = /^\{([^{}]+)\}$/;
const EXTENSION_KEY = 'org.systemlab';

const FONT_WEIGHT_KEYWORDS = /** @type {Record<string, number>} */ ({
  thin: 100,
  hairline: 100,
  'extra-light': 200,
  'ultra-light': 200,
  light: 300,
  normal: 400,
  regular: 400,
  book: 400,
  medium: 500,
  'semi-bold': 600,
  'demi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  'ultra-bold': 800,
  black: 900,
  heavy: 900,
  'extra-black': 950,
  'ultra-black': 950,
});

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
]);

/** Sub-value types of the composite types this pipeline supports. */
const COMPOSITE_FIELDS = /** @type {Record<string, Record<string, TokenType>>} */ ({
  shadow: { color: 'color', offsetX: 'dimension', offsetY: 'dimension', blur: 'dimension', spread: 'dimension' },
  typography: {
    fontFamily: 'fontFamily',
    fontSize: 'dimension',
    fontWeight: 'fontWeight',
    letterSpacing: 'dimension',
    lineHeight: 'number',
  },
});

/** @param {unknown} value @returns {value is Record<string, any>} */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @returns {string | undefined} */
export function referenceTarget(value) {
  if (typeof value !== 'string') return undefined;
  const match = REFERENCE.exec(value);
  return match ? match[1] : undefined;
}

/**
 * Walks a DTCG document and returns its tokens with group `$type` inheritance applied.
 * @param {unknown} document
 * @param {string} source file name used in error messages
 * @param {string} tier documentation tier assigned by the resolver set
 * @returns {TokenDefinition[]}
 */
export function flattenTokens(document, source, tier) {
  /** @type {TokenDefinition[]} */
  const tokens = [];

  /** @param {unknown} node @param {string[]} path @param {TokenType | undefined} inheritedType */
  function walk(node, path, inheritedType) {
    const where = `${source} → ${path.join('.') || '(root)'}`;
    if (!isObject(node)) throw new TokenError(`${where}: expected a token or group object.`);

    const ownType = node.$type;
    if (ownType !== undefined && (typeof ownType !== 'string' || !SUPPORTED_TYPES.has(ownType))) {
      throw new TokenError(`${where}: unsupported $type "${String(ownType)}".`);
    }
    const type = /** @type {TokenType | undefined} */ (ownType ?? inheritedType);

    if ('$value' in node) {
      if (path.length === 0) throw new TokenError(`${source}: the document root cannot be a token.`);
      for (const key of Object.keys(node)) {
        if (!key.startsWith('$')) {
          throw new TokenError(`${where}: an object with $value is a token and cannot contain "${key}".`);
        }
        if (!TOKEN_PROPERTIES.has(key)) throw new TokenError(`${where}: unknown token property "${key}".`);
      }
      tokens.push({
        path: path.join('.'),
        type,
        value: node.$value,
        description: typeof node.$description === 'string' ? node.$description : undefined,
        source,
        tier,
      });
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) {
        if (key === '$ref' || key === '$extends' || key === '$root') {
          throw new TokenError(`${where}: "${key}" is valid DTCG but not supported by this pipeline.`);
        }
        if (!GROUP_PROPERTIES.has(key)) throw new TokenError(`${where}: unknown group property "${key}".`);
        continue;
      }
      if (/[{}.]/.test(key)) throw new TokenError(`${where}: name "${key}" must not contain "{", "}" or ".".`);
      walk(child, [...path, key], type);
    }
  }

  walk(document, [], undefined);
  return tokens;
}

/**
 * Merges token lists. The DTCG resolver lets later sources override earlier ones;
 * this project is stricter and treats a repeated path as an authoring mistake.
 * @param {TokenDefinition[][]} lists
 * @returns {Map<string, TokenDefinition>}
 */
export function mergeTokens(lists) {
  /** @type {Map<string, TokenDefinition>} */
  const merged = new Map();
  for (const list of lists) {
    for (const token of list) {
      const existing = merged.get(token.path);
      if (existing) {
        throw new TokenError(
          `Token "${token.path}" is defined in both ${existing.source} and ${token.source}. Define each path once.`,
        );
      }
      merged.set(token.path, token);
    }
  }
  return merged;
}

/** @param {unknown} value @param {string} where */
function validateColor(value, where) {
  if (!isObject(value)) throw new TokenError(`${where}: color value must be an object.`);
  if (value.colorSpace !== 'srgb') {
    throw new TokenError(`${where}: only the "srgb" colorSpace is supported (got "${String(value.colorSpace)}").`);
  }
  const { components, alpha, hex } = value;
  if (!Array.isArray(components) || components.length !== 3 || components.some((c) => typeof c !== 'number' || c < 0 || c > 1)) {
    throw new TokenError(`${where}: srgb components must be three numbers between 0 and 1.`);
  }
  if (alpha !== undefined && (typeof alpha !== 'number' || alpha < 0 || alpha > 1)) {
    throw new TokenError(`${where}: alpha must be a number between 0 and 1.`);
  }
  if (hex !== undefined) {
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) throw new TokenError(`${where}: hex must look like #rrggbb.`);
    const fromHex = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const fromComponents = components.map((c) => Math.round(c * 255));
    if (fromHex.some((channel, i) => Math.abs(channel - fromComponents[i]) > 1)) {
      throw new TokenError(`${where}: hex ${hex} does not match components [${components.join(', ')}].`);
    }
  }
}

/** @param {unknown} value @param {string} where @param {string[]} units */
function validateMeasure(value, where, units) {
  if (!isObject(value) || typeof value.value !== 'number' || !units.includes(value.unit)) {
    throw new TokenError(`${where}: expected { value: number, unit: ${units.map((u) => `"${u}"`).join(' | ')} }.`);
  }
}

/**
 * Validates an explicit (non-reference) value against its declared type.
 * @param {TokenType} type @param {unknown} value @param {string} where
 */
function validateValue(type, value, where) {
  switch (type) {
    case 'color':
      return validateColor(value, where);
    case 'dimension':
      return validateMeasure(value, where, ['px', 'rem']);
    case 'duration':
      return validateMeasure(value, where, ['ms', 's']);
    case 'number':
      if (typeof value !== 'number') throw new TokenError(`${where}: number value must be a JSON number.`);
      return;
    case 'fontFamily':
      if (typeof value === 'string' && value.length > 0) return;
      if (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string' && v.length > 0)) return;
      throw new TokenError(`${where}: fontFamily must be a name or a non-empty array of names.`);
    case 'fontWeight':
      if (typeof value === 'number' && value >= 1 && value <= 1000) return;
      if (typeof value === 'string' && value in FONT_WEIGHT_KEYWORDS) return;
      throw new TokenError(`${where}: fontWeight must be 1–1000 or a DTCG keyword.`);
    case 'cubicBezier':
      if (
        Array.isArray(value) &&
        value.length === 4 &&
        value.every((v) => typeof v === 'number') &&
        value[0] >= 0 &&
        value[0] <= 1 &&
        value[2] >= 0 &&
        value[2] <= 1
      ) {
        return;
      }
      throw new TokenError(`${where}: cubicBezier must be [P1x, P1y, P2x, P2y] with x values in [0, 1].`);
    default:
      throw new TokenError(`${where}: "${type}" values are validated through their sub-values.`);
  }
}

/**
 * Resolves every alias, validates types and detects missing references and cycles.
 * References are preserved on the result (`value`, `chain`) so outputs can keep them.
 * @param {Map<string, TokenDefinition>} definitions
 * @returns {Map<string, ResolvedToken>}
 */
export function resolveTokens(definitions) {
  /** @type {Map<string, ResolvedToken>} */
  const resolved = new Map();
  /** @type {string[]} */
  const stack = [];

  /** @param {string} path @param {string} requestedBy @returns {ResolvedToken} */
  function resolvePath(path, requestedBy) {
    const done = resolved.get(path);
    if (done) return done;

    const definition = definitions.get(path);
    if (!definition) throw new TokenError(`Missing reference {${path}} in ${requestedBy}.`);
    if (stack.includes(path)) {
      const cycle = [...stack.slice(stack.indexOf(path)), path];
      throw new TokenError(`Circular reference: ${cycle.map((p) => `{${p}}`).join(' → ')}.`);
    }

    stack.push(path);
    const where = `${definition.source} → ${path}`;
    /** @type {string[]} */
    const references = [];
    /** @type {TokenType | undefined} */
    let type = definition.type;
    /** @type {string[]} */
    let chain = [path];
    /** @type {unknown} */
    let value;

    const target = referenceTarget(definition.value);
    if (target) {
      const aliased = resolvePath(target, where);
      if (type && type !== aliased.type) {
        throw new TokenError(`${where}: declared as ${type} but {${target}} is ${aliased.type}.`);
      }
      type = aliased.type;
      chain = [path, ...aliased.chain];
      references.push(target);
      value = aliased.resolved;
    } else {
      if (!type) throw new TokenError(`${where}: no $type on the token or its groups, and the value is not a reference.`);
      value = resolveExplicit(type, definition.value, where, references);
    }

    stack.pop();
    const result = { ...definition, type: /** @type {TokenType} */ (type), chain, references, resolved: value };
    resolved.set(path, result);
    return result;
  }

  /**
   * @param {TokenType} type @param {unknown} value @param {string} where @param {string[]} references
   * @returns {unknown}
   */
  function resolveExplicit(type, value, where, references) {
    const fields = COMPOSITE_FIELDS[type];
    if (!fields) {
      validateValue(type, value, where);
      return value;
    }

    const layers = type === 'shadow' && Array.isArray(value) ? value : [value];
    const resolvedLayers = layers.map((layer, index) => {
      const layerWhere = layers.length > 1 ? `${where}[${index}]` : where;
      const layerTarget = referenceTarget(layer);
      if (layerTarget) {
        const aliased = resolvePath(layerTarget, layerWhere);
        if (aliased.type !== type) throw new TokenError(`${layerWhere}: {${layerTarget}} is ${aliased.type}, expected ${type}.`);
        references.push(layerTarget);
        return aliased.resolved;
      }
      if (!isObject(layer)) throw new TokenError(`${layerWhere}: ${type} value must be an object.`);
      /** @type {Record<string, unknown>} */
      const out = {};
      for (const key of Object.keys(layer)) {
        if (!(key in fields) && !(type === 'shadow' && key === 'inset')) {
          throw new TokenError(`${layerWhere}: unknown ${type} property "${key}".`);
        }
      }
      for (const [field, fieldType] of Object.entries(fields)) {
        const fieldValue = layer[field];
        if (fieldValue === undefined) throw new TokenError(`${layerWhere}: ${type} is missing "${field}".`);
        const fieldTarget = referenceTarget(fieldValue);
        if (fieldTarget) {
          const aliased = resolvePath(fieldTarget, `${layerWhere}.${field}`);
          if (aliased.type !== fieldType) {
            throw new TokenError(`${layerWhere}.${field}: {${fieldTarget}} is ${aliased.type}, expected ${fieldType}.`);
          }
          references.push(fieldTarget);
          out[field] = aliased.resolved;
        } else {
          validateValue(fieldType, fieldValue, `${layerWhere}.${field}`);
          out[field] = fieldValue;
        }
      }
      if (type === 'shadow') {
        if (layer.inset !== undefined && typeof layer.inset !== 'boolean') {
          throw new TokenError(`${layerWhere}: shadow inset must be a boolean.`);
        }
        out.inset = layer.inset === true;
      }
      return out;
    });
    return type === 'shadow' && Array.isArray(value) ? resolvedLayers : resolvedLayers[0];
  }

  for (const path of definitions.keys()) resolvePath(path, 'the token set');
  return resolved;
}

/** @param {string} path */
export function cssVarName(path) {
  return `--${path.split('.').join('-')}`;
}

/** @param {number} value */
function formatNumber(value) {
  return String(Number(value.toFixed(4)));
}

/**
 * Converts a fully resolved value to CSS.
 * @param {TokenType} type @param {any} value
 * @returns {string}
 */
export function toCssValue(type, value) {
  switch (type) {
    case 'color': {
      const alpha = value.alpha ?? 1;
      if (alpha === 1 && value.hex) return value.hex.toLowerCase();
      const [r, g, b] = value.components.map((/** @type {number} */ c) => Math.round(c * 255));
      return alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${formatNumber(alpha)})`;
    }
    case 'dimension':
    case 'duration':
      return `${formatNumber(value.value)}${value.unit}`;
    case 'number':
      return formatNumber(value);
    case 'fontWeight':
      return String(typeof value === 'number' ? value : FONT_WEIGHT_KEYWORDS[value]);
    case 'fontFamily':
      return (Array.isArray(value) ? value : [value])
        .map((name) => (GENERIC_FONT_FAMILIES.has(name) || /^[\w-]+$/.test(name) ? name : `"${name}"`))
        .join(', ');
    case 'cubicBezier':
      return `cubic-bezier(${value.map(formatNumber).join(', ')})`;
    case 'shadow':
      return (Array.isArray(value) ? value : [value])
        .map((layer) =>
          [
            layer.inset ? 'inset' : '',
            toCssValue('dimension', layer.offsetX),
            toCssValue('dimension', layer.offsetY),
            toCssValue('dimension', layer.blur),
            toCssValue('dimension', layer.spread),
            toCssValue('color', layer.color),
          ]
            .filter(Boolean)
            .join(' '),
        )
        .join(', ');
    case 'typography':
      return [
        `${toCssValue('fontWeight', value.fontWeight)}`,
        `${toCssValue('dimension', value.fontSize)}/${toCssValue('number', value.lineHeight)}`,
        toCssValue('fontFamily', value.fontFamily),
      ].join(' ');
    default:
      throw new TokenError(`Cannot convert ${type} to CSS.`);
  }
}

/** @param {string} field */
function kebab(field) {
  return field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * CSS declarations for one token. Aliases stay as var() references so the
 * chain remains visible in DevTools and theme overrides propagate.
 * @param {ResolvedToken} token @param {Map<string, TokenDefinition>} definitions
 * @returns {Array<[string, string]>}
 */
export function cssDeclarations(token, definitions) {
  const name = cssVarName(token.path);
  const authored = /** @type {TokenDefinition} */ (definitions.get(token.path)).value;
  const target = referenceTarget(authored);

  if (token.type === 'typography') {
    const fields = COMPOSITE_FIELDS.typography;
    return Object.entries(fields).map(([field, fieldType]) => {
      const property = `${name}-${kebab(field)}`;
      if (target) return [property, `var(${cssVarName(target)}-${kebab(field)})`];
      const fieldValue = /** @type {Record<string, unknown>} */ (authored)[field];
      const fieldTarget = referenceTarget(fieldValue);
      return [property, fieldTarget ? `var(${cssVarName(fieldTarget)})` : toCssValue(fieldType, fieldValue)];
    });
  }

  if (target) return [[name, `var(${cssVarName(target)})`]];

  if (token.type === 'shadow') {
    const layers = Array.isArray(authored) ? authored : [authored];
    const css = layers
      .map((layer) => {
        const layerTarget = referenceTarget(layer);
        if (layerTarget) return `var(${cssVarName(layerTarget)})`;
        /** @param {string} field @param {TokenType} fieldType */
        const part = (field, fieldType) => {
          const fieldTarget = referenceTarget(layer[field]);
          return fieldTarget ? `var(${cssVarName(fieldTarget)})` : toCssValue(fieldType, layer[field]);
        };
        return [
          layer.inset ? 'inset' : '',
          part('offsetX', 'dimension'),
          part('offsetY', 'dimension'),
          part('blur', 'dimension'),
          part('spread', 'dimension'),
          part('color', 'color'),
        ]
          .filter(Boolean)
          .join(' ');
      })
      .join(', ');
    return [[name, css]];
  }

  return [[name, toCssValue(token.type, token.resolved)]];
}

/**
 * Applies the resolver: validates structure, then returns one merged definition map per context
 * of the (single) modifier, in resolutionOrder.
 * @param {ResolverDocument} resolver
 * @param {(ref: string) => unknown} loadSource returns parsed JSON for a relative $ref
 */
export function applyResolver(resolver, loadSource) {
  if (resolver.version !== '2025.10') throw new TokenError(`Resolver version must be "2025.10".`);
  if (!Array.isArray(resolver.resolutionOrder) || resolver.resolutionOrder.length === 0) {
    throw new TokenError('Resolver needs a non-empty resolutionOrder.');
  }

  /** @param {{ $extensions?: Record<string, unknown> } | undefined} item @param {string} fallback */
  const tierOf = (item, fallback) => {
    const extension = item?.$extensions?.[EXTENSION_KEY];
    return isObject(extension) && typeof extension.tier === 'string' ? extension.tier : fallback;
  };

  /** @param {Array<{ $ref: string }>} sources @param {string} tier */
  const loadSources = (sources, tier) =>
    sources.map((source) => {
      if (!source || typeof source.$ref !== 'string' || source.$ref.startsWith('#')) {
        throw new TokenError('Set and context sources must reference token files with { "$ref": "file.tokens.json" }.');
      }
      return flattenTokens(loadSource(source.$ref), source.$ref, tier);
    });

  const modifierRefs = resolver.resolutionOrder.filter((item) => item.$ref?.startsWith('#/modifiers/'));
  if (modifierRefs.length !== 1) throw new TokenError('This pipeline expects exactly one modifier (the theme).');
  const modifierName = modifierRefs[0].$ref.slice('#/modifiers/'.length);
  const modifier = resolver.modifiers?.[modifierName];
  if (!modifier) throw new TokenError(`resolutionOrder references unknown modifier "${modifierName}".`);
  const contexts = Object.keys(modifier.contexts ?? {});
  if (contexts.length < 2) throw new TokenError(`Modifier "${modifierName}" needs at least two contexts.`);
  const defaultContext = modifier.default ?? contexts[0];
  if (!contexts.includes(defaultContext)) {
    throw new TokenError(`Modifier "${modifierName}" default "${defaultContext}" is not one of its contexts.`);
  }

  /** @type {Map<string, Map<string, TokenDefinition>>} */
  const byContext = new Map();
  /** @type {Set<string>} */
  const modifierPaths = new Set();

  for (const context of contexts) {
    /** @type {TokenDefinition[][]} */
    const lists = [];
    for (const item of resolver.resolutionOrder) {
      const ref = item?.$ref;
      if (typeof ref !== 'string') throw new TokenError('Inline resolutionOrder items are not supported; use $ref.');
      if (ref.startsWith('#/sets/')) {
        const name = ref.slice('#/sets/'.length);
        const set = resolver.sets?.[name];
        if (!set) throw new TokenError(`resolutionOrder references unknown set "${name}".`);
        lists.push(...loadSources(set.sources, tierOf(set, name)));
      } else if (ref === `#/modifiers/${modifierName}`) {
        const contextLists = loadSources(modifier.contexts[context], tierOf(modifier, modifierName));
        for (const list of contextLists) for (const token of list) modifierPaths.add(`${context}:${token.path}`);
        lists.push(...contextLists);
      } else {
        throw new TokenError(`Unsupported resolutionOrder reference "${ref}".`);
      }
    }
    byContext.set(context, mergeTokens(lists));
  }

  const pathSets = contexts.map((context) =>
    [...modifierPaths].filter((key) => key.startsWith(`${context}:`)).map((key) => key.slice(context.length + 1)),
  );
  const [first, ...others] = pathSets;
  others.forEach((paths, index) => {
    const missing = first.filter((path) => !paths.includes(path));
    const extra = paths.filter((path) => !first.includes(path));
    if (missing.length || extra.length) {
      throw new TokenError(
        `Theme contexts must define the same tokens. "${contexts[index + 1]}" is missing [${missing.join(', ')}] and adds [${extra.join(', ')}].`,
      );
    }
  });

  return { modifierName, contexts, defaultContext, byContext, modifierTokenPaths: new Set(first) };
}

/**
 * Runs the whole pipeline and returns file contents.
 * @param {ResolverDocument} resolver
 * @param {(ref: string) => unknown} loadSource
 * @param {{ keyGroups: KeyGroup[], banner: string }} options
 */
export function buildTokenOutputs(resolver, loadSource, options) {
  const { modifierName, contexts, defaultContext, byContext, modifierTokenPaths } = applyResolver(resolver, loadSource);

  /** @type {Map<string, Map<string, ResolvedToken>>} */
  const resolvedByContext = new Map();
  for (const [context, definitions] of byContext) resolvedByContext.set(context, resolveTokens(definitions));

  const defaultDefinitions = /** @type {Map<string, TokenDefinition>} */ (byContext.get(defaultContext));
  const defaultResolved = /** @type {Map<string, ResolvedToken>} */ (resolvedByContext.get(defaultContext));
  const paths = [...defaultResolved.keys()];

  const seenNames = new Map();
  for (const path of paths) {
    const name = cssVarName(path);
    if (seenNames.has(name)) throw new TokenError(`"${path}" and "${seenNames.get(name)}" both become ${name}.`);
    seenNames.set(name, path);
  }

  /** @type {Map<string, boolean>} */
  const themed = new Map();
  /** @param {string} path @returns {boolean} */
  const isThemed = (path) => {
    const known = themed.get(path);
    if (known !== undefined) return known;
    const result = contexts.some((context) => {
      if (modifierTokenPaths.has(path)) return true;
      const token = resolvedByContext.get(context)?.get(path);
      return token ? token.references.some(isThemed) : false;
    });
    themed.set(path, result);
    return result;
  };

  /** @param {Map<string, TokenDefinition>} definitions @param {Map<string, ResolvedToken>} resolved @param {(path: string) => boolean} include */
  const block = (definitions, resolved, include) =>
    paths
      .filter(include)
      .flatMap((path) => cssDeclarations(/** @type {ResolvedToken} */ (resolved.get(path)), definitions))
      .map(([property, value]) => `    ${property}: ${value};`)
      .join('\n');

  const attribute = `data-${modifierName}`;
  const themeBlocks = contexts.map((context) => {
    const definitions = /** @type {Map<string, TokenDefinition>} */ (byContext.get(context));
    const resolved = /** @type {Map<string, ResolvedToken>} */ (resolvedByContext.get(context));
    const selector = context === defaultContext ? `:root,\n  [${attribute}='${context}']` : `[${attribute}='${context}']`;
    return { context, body: `    color-scheme: ${context === 'dark' ? 'dark' : 'light'};\n${block(definitions, resolved, isThemed)}`, selector };
  });

  const darkBlock = themeBlocks.find((entry) => entry.context === 'dark');
  const css = [
    `/* ${options.banner} */`,
    '@layer tokens {',
    '  :root {',
    block(defaultDefinitions, defaultResolved, (path) => !isThemed(path)),
    '  }',
    '',
    ...themeBlocks.map((entry) => `  ${entry.selector} {\n${entry.body}\n  }\n`),
    ...(darkBlock
      ? [
          '  @media (prefers-color-scheme: dark) {',
          `    :root:not([${attribute}]) {`,
          darkBlock.body.replace(/^ {4}/gm, '      '),
          '    }',
          '  }',
        ]
      : []),
    '}',
    '',
  ].join('\n');

  /** @param {string} group */
  const keysOf = (group) =>
    paths.filter((path) => path.startsWith(`${group}.`) && !path.slice(group.length + 1).includes('.')).map((path) => path.slice(group.length + 1));

  const keyBlocks = options.keyGroups.map(({ group, typeName, constName }) => {
    const keys = keysOf(group);
    if (keys.length === 0) throw new TokenError(`Key group "${group}" has no direct tokens.`);
    return [
      `/** Direct children of \`${group}\`. */`,
      `export const ${constName} = ${JSON.stringify(keys)} as const;`,
      `export type ${typeName} = (typeof ${constName})[number];`,
    ].join('\n');
  });

  const ts = [
    `// ${options.banner}`,
    '',
    `export const themeNames = ${JSON.stringify(contexts)} as const;`,
    'export type ThemeName = (typeof themeNames)[number];',
    '',
    ...keyBlocks.flatMap((block) => [block, '']),
    'export type TokenPath =',
    ...paths.map((path) => `  | '${path}'`),
    '  ;',
    '',
    '/** `var()` reference for a token path, e.g. cssVar(\'space.md\') → var(--space-md). */',
    'export function cssVar(path: TokenPath): string {',
    "  return `var(--${path.split('.').join('-')})`;",
    '}',
    '',
  ].join('\n');

  const manifest = paths.map((path) => {
    const token = /** @type {ResolvedToken} */ (defaultResolved.get(path));
    /** @type {Record<string, { authored: string, resolved: string, chain: string[] }>} */
    const values = {};
    for (const context of contexts) {
      const contextToken = /** @type {ResolvedToken} */ (resolvedByContext.get(context)?.get(path));
      const definition = /** @type {TokenDefinition} */ (byContext.get(context)?.get(path));
      const authored = definition.value;
      values[context] = {
        authored: referenceTarget(authored) ? String(authored) : toCssValue(contextToken.type, contextToken.resolved),
        resolved: toCssValue(contextToken.type, contextToken.resolved),
        chain: contextToken.chain,
      };
    }
    return {
      path,
      cssVar: cssVarName(path),
      type: token.type,
      tier: token.tier,
      source: token.source,
      description: token.description ?? '',
      themed: isThemed(path),
      values,
    };
  });

  const manifestTs = [
    `// ${options.banner}`,
    "import type { ThemeName } from './tokens';",
    '',
    'export interface TokenRecord {',
    '  path: string;',
    '  cssVar: string;',
    '  type: string;',
    '  tier: string;',
    '  source: string;',
    '  description: string;',
    '  /** True when the value changes per theme (directly or through an alias). */',
    '  themed: boolean;',
    '  values: Record<ThemeName, { authored: string; resolved: string; chain: string[] }>;',
    '}',
    '',
    `export const tokenManifest: readonly TokenRecord[] = ${JSON.stringify(manifest, null, 2)};`,
    '',
  ].join('\n');

  return { css, ts, manifest: manifestTs, tokenCount: paths.length, contexts };
}

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
 * @typedef {{ name: string, contexts: string[], defaultContext: string, complete: boolean, overrides: boolean }} ModifierInfo
 * @typedef {Record<string, string>} ModifierInput
 */

/** Every combination of modifier contexts, in modifier and context order. */
/** @param {ModifierInfo[]} modifiers @returns {ModifierInput[]} */
export function permutationsOf(modifiers) {
  /** @type {ModifierInput[]} */
  let inputs = [{}];
  for (const modifier of modifiers) {
    inputs = inputs.flatMap((input) => modifier.contexts.map((context) => ({ ...input, [modifier.name]: context })));
  }
  return inputs;
}

/** @param {ModifierInput} input */
export const inputKey = (input) =>
  Object.entries(input)
    .map(([name, context]) => `${name}=${context}`)
    .join(',');

/**
 * Adds a token list to a merged map. Ordinary sets and modifiers may only introduce new paths;
 * modifiers flagged `overrides` may only replace existing ones, keeping the original type and tier.
 * @param {Map<string, TokenDefinition>} merged @param {TokenDefinition[]} list @param {boolean} override
 */
function addTokens(merged, list, override) {
  for (const token of list) {
    const existing = merged.get(token.path);
    if (override) {
      if (!existing) {
        throw new TokenError(`"${token.path}" in ${token.source} overrides nothing. Override modifiers may only replace existing tokens.`);
      }
      if (existing.tier === 'reference') {
        throw new TokenError(
          `Token policy (invariant-reference): ${token.source} overrides the reference token "${token.path}". Reference scales are the same in every permutation; override a semantic or component token instead.`,
        );
      }
      merged.set(token.path, {
        ...existing,
        value: token.value,
        type: token.type ?? existing.type,
        description: token.description ?? existing.description,
        source: token.source,
      });
    } else if (existing) {
      throw new TokenError(`Token "${token.path}" is defined in both ${existing.source} and ${token.source}. Define each path once.`);
    } else {
      merged.set(token.path, token);
    }
  }
}

/**
 * Applies the resolver: validates structure, then returns one merged definition map per
 * permutation of modifier contexts (DTCG resolver § 4.1.5.4), in resolutionOrder.
 * A modifier's `$extensions["org.systemlab"]` may set `complete: true` (every context defines
 * the same paths, as themes must) and `overrides: true` (contexts only replace existing tokens).
 * @param {ResolverDocument} resolver
 * @param {(ref: string) => unknown} loadSource returns parsed JSON for a relative $ref
 */
export function applyResolver(resolver, loadSource) {
  if (resolver.version !== '2025.10') throw new TokenError(`Resolver version must be "2025.10".`);
  if (!Array.isArray(resolver.resolutionOrder) || resolver.resolutionOrder.length === 0) {
    throw new TokenError('Resolver needs a non-empty resolutionOrder.');
  }

  /** @param {{ $extensions?: Record<string, unknown> } | undefined} item */
  const extensionOf = (item) => {
    const extension = item?.$extensions?.[EXTENSION_KEY];
    return isObject(extension) ? extension : {};
  };
  /** @param {{ $extensions?: Record<string, unknown> } | undefined} item @param {string} fallback */
  const tierOf = (item, fallback) => {
    const tier = extensionOf(item).tier;
    return typeof tier === 'string' ? tier : fallback;
  };

  /** @type {Map<string, TokenDefinition[]>} */
  const loaded = new Map();
  /** @param {Array<{ $ref: string }>} sources @param {string} tier */
  const loadSources = (sources, tier) =>
    sources.map((source) => {
      if (!source || typeof source.$ref !== 'string' || source.$ref.startsWith('#')) {
        throw new TokenError('Set and context sources must reference token files with { "$ref": "file.tokens.json" }.');
      }
      const key = `${tier}:${source.$ref}`;
      if (!loaded.has(key)) loaded.set(key, flattenTokens(loadSource(source.$ref), source.$ref, tier));
      return /** @type {TokenDefinition[]} */ (loaded.get(key));
    });

  const modifierNames = resolver.resolutionOrder
    .map((item) => item?.$ref)
    .filter((ref) => typeof ref === 'string' && ref.startsWith('#/modifiers/'))
    .map((ref) => ref.slice('#/modifiers/'.length));
  if (!modifierNames.includes('theme')) throw new TokenError('This pipeline expects a "theme" modifier in resolutionOrder.');
  if (new Set(modifierNames).size !== modifierNames.length) throw new TokenError('A modifier appears twice in resolutionOrder.');

  /** @type {ModifierInfo[]} */
  const modifiers = modifierNames.map((name) => {
    const modifier = resolver.modifiers?.[name];
    if (!modifier) throw new TokenError(`resolutionOrder references unknown modifier "${name}".`);
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new TokenError(`Modifier name "${name}" must be lowercase kebab-case; it becomes a data attribute.`);
    const contexts = Object.keys(modifier.contexts ?? {});
    if (contexts.length < 2) throw new TokenError(`Modifier "${name}" needs at least two contexts.`);
    for (const context of contexts) {
      if (!/^[a-z][a-z0-9-]*$/.test(context)) throw new TokenError(`Context "${name}: ${context}" must be lowercase kebab-case.`);
    }
    const defaultContext = modifier.default ?? contexts[0];
    if (!contexts.includes(defaultContext)) {
      throw new TokenError(`Modifier "${name}" default "${defaultContext}" is not one of its contexts.`);
    }
    const extension = extensionOf(modifier);
    return { name, contexts, defaultContext, complete: extension.complete === true || name === 'theme', overrides: extension.overrides === true };
  });
  const byName = new Map(modifiers.map((modifier) => [modifier.name, modifier]));

  for (const modifier of modifiers.filter((candidate) => candidate.complete)) {
    const source = /** @type {ResolverModifier} */ (resolver.modifiers?.[modifier.name]);
    const pathSets = modifier.contexts.map((context) =>
      loadSources(source.contexts[context] ?? [], tierOf(source, modifier.name)).flatMap((list) => list.map((token) => token.path)),
    );
    const [first = [], ...others] = pathSets;
    others.forEach((paths, index) => {
      const missing = first.filter((path) => !paths.includes(path));
      const extra = paths.filter((path) => !first.includes(path));
      if (missing.length || extra.length) {
        const label = modifier.name === 'theme' ? 'Theme' : `"${modifier.name}"`;
        throw new TokenError(
          `${label} contexts must define the same tokens. "${modifier.contexts[index + 1]}" is missing [${missing.join(', ')}] and adds [${extra.join(', ')}].`,
        );
      }
    });
  }

  const permutations = permutationsOf(modifiers);
  /** @type {Map<string, Map<string, TokenDefinition>>} */
  const byInput = new Map();
  for (const input of permutations) {
    /** @type {Map<string, TokenDefinition>} */
    const merged = new Map();
    for (const item of resolver.resolutionOrder) {
      const ref = item?.$ref;
      if (typeof ref !== 'string') throw new TokenError('Inline resolutionOrder items are not supported; use $ref.');
      if (ref.startsWith('#/sets/')) {
        const name = ref.slice('#/sets/'.length);
        const set = resolver.sets?.[name];
        if (!set) throw new TokenError(`resolutionOrder references unknown set "${name}".`);
        for (const list of loadSources(set.sources, tierOf(set, name))) addTokens(merged, list, false);
      } else if (ref.startsWith('#/modifiers/')) {
        const info = /** @type {ModifierInfo} */ (byName.get(ref.slice('#/modifiers/'.length)));
        const source = /** @type {ResolverModifier} */ (resolver.modifiers?.[info.name]);
        const context = /** @type {string} */ (input[info.name]);
        for (const list of loadSources(source.contexts[context] ?? [], tierOf(source, info.name))) addTokens(merged, list, info.overrides);
      } else {
        throw new TokenError(`Unsupported resolutionOrder reference "${ref}".`);
      }
    }
    byInput.set(inputKey(input), merged);
  }

  const defaultInput = Object.fromEntries(modifiers.map((modifier) => [modifier.name, modifier.defaultContext]));
  return { modifiers, permutations, byInput, defaultInput };
}

/** Tiers the dependency policy knows, lowest first. Sets with other tier names are not checked. */
const TIER_RANK = /** @type {Record<string, number>} */ ({ reference: 0, semantic: 1, component: 2 });

/**
 * The build-time half of the token dependency policy (src/design-system/tokens/policy.ts):
 * aliases never point up a tier, component tokens are always aliases, and component colors
 * alias semantic roles rather than palettes.
 * @param {Map<string, ResolvedToken>} resolved
 * @param {string} permutation
 */
export function checkTierPolicy(resolved, permutation) {
  for (const token of resolved.values()) {
    const rank = TIER_RANK[token.tier];
    if (rank === undefined) continue;
    const where = `"${token.path}" (${token.tier}, ${token.source}${permutation ? `, ${permutation}` : ''})`;
    if (token.tier === 'component' && !referenceTarget(token.value)) {
      throw new TokenError(`Token policy (component-alias): ${where} has a literal value. Component tokens alias a semantic role or a reference scale.`);
    }
    for (const target of token.references) {
      const aliased = resolved.get(target);
      const targetRank = aliased ? TIER_RANK[aliased.tier] : undefined;
      if (!aliased || targetRank === undefined) continue;
      if (targetRank > rank) {
        throw new TokenError(`Token policy (tier-direction): ${where} aliases {${target}} (${aliased.tier}). Aliases point to the same tier or a lower one.`);
      }
      if (token.tier === 'component' && aliased.tier === 'reference' && aliased.type === 'color') {
        throw new TokenError(`Token policy (palette-isolation): ${where} aliases the palette color {${target}}. Component colors alias a semantic role.`);
      }
    }
  }
}

/** @param {string} name */
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
/** @param {string} name */
const pascal = (name) => camel(name).replace(/^./, (letter) => letter.toUpperCase());

/**
 * Runs the whole pipeline and returns file contents.
 *
 * CSS emission is dependency-minimal: each token is declared under a selector made of exactly
 * the modifiers its resolved value depends on (directly or through aliases). Tokens that vary
 * only by theme live in `[data-theme]` blocks, tokens that vary by theme and product in
 * `[data-theme][data-product]` blocks, and so on. Every declaration is repeated where its
 * dependencies change, because a custom property's var() is substituted where it is declared.
 * @param {ResolverDocument} resolver
 * @param {(ref: string) => unknown} loadSource
 * @param {{ keyGroups: KeyGroup[], banner: string }} options
 */
export function buildTokenOutputs(resolver, loadSource, options) {
  const { modifiers, permutations, byInput, defaultInput } = applyResolver(resolver, loadSource);

  /** @type {Map<string, Map<string, ResolvedToken>>} */
  const resolvedByInput = new Map();
  for (const [key, definitions] of byInput) {
    const resolved = resolveTokens(definitions);
    checkTierPolicy(resolved, key);
    resolvedByInput.set(key, resolved);
  }

  const defaultKey = inputKey(defaultInput);
  const defaultResolved = /** @type {Map<string, ResolvedToken>} */ (resolvedByInput.get(defaultKey));
  const paths = [...defaultResolved.keys()];
  for (const [key, resolved] of resolvedByInput) {
    if (resolved.size !== paths.length || paths.some((path) => !resolved.has(path))) {
      throw new TokenError(`Permutation ${key} resolves a different set of tokens than the default permutation.`);
    }
  }

  const seenNames = new Map();
  for (const path of paths) {
    const name = cssVarName(path);
    if (seenNames.has(name)) throw new TokenError(`"${path}" and "${seenNames.get(name)}" both become ${name}.`);
    seenNames.set(name, path);
  }

  /** @param {ModifierInput} input @param {string} path */
  const declarationsAt = (input, path) => {
    const key = inputKey({ ...defaultInput, ...input });
    const resolved = /** @type {Map<string, ResolvedToken>} */ (resolvedByInput.get(key));
    return cssDeclarations(/** @type {ResolvedToken} */ (resolved.get(path)), /** @type {Map<string, TokenDefinition>} */ (byInput.get(key)));
  };
  /** @param {ModifierInput} input @param {string} path */
  const signature = (input, path) => {
    const key = inputKey(input);
    const token = /** @type {ResolvedToken} */ (resolvedByInput.get(key)?.get(path));
    return JSON.stringify([declarationsAt(input, path), token.resolved]);
  };

  /** Modifiers whose context changes this token's declarations or resolved value. */
  /** @type {Map<string, ModifierInfo[]>} */
  const dependencies = new Map();
  for (const path of paths) {
    const signatures = new Map(permutations.map((input) => [inputKey(input), signature(input, path)]));
    dependencies.set(
      path,
      modifiers.filter((modifier) =>
        permutations.some((input) =>
          modifier.contexts.some(
            (context) => signatures.get(inputKey({ ...input, [modifier.name]: context })) !== signatures.get(inputKey(input)),
          ),
        ),
      ),
    );
  }

  /** @param {ModifierInfo[]} dependsOn */
  const combinationsOver = (dependsOn) => permutationsOf(dependsOn);
  /** @param {ModifierInput} combination */
  const selectorFor = (combination) =>
    Object.entries(combination)
      .map(([name, context]) => `[data-${name}='${context}']`)
      .join('');

  /** @type {Map<string, { selector: string, lines: string[], rank: number }>} */
  const blocks = new Map();
  /** @type {string[]} */
  const rootLines = [];
  for (const path of paths) {
    const dependsOn = /** @type {ModifierInfo[]} */ (dependencies.get(path));
    if (dependsOn.length === 0) {
      rootLines.push(...declarationsAt(defaultInput, path).map(([property, value]) => `    ${property}: ${value};`));
      continue;
    }
    for (const combination of combinationsOver(dependsOn)) {
      const isDefault = dependsOn.every((modifier) => combination[modifier.name] === modifier.defaultContext);
      const selector = isDefault ? `:root,\n  ${selectorFor(combination)}` : selectorFor(combination);
      const rank =
        dependsOn.length * 1000 +
        dependsOn.reduce((sum, modifier) => sum * 10 + modifiers.indexOf(modifier) + 1, 0) * 10 +
        dependsOn.reduce((sum, modifier) => sum * 10 + modifier.contexts.indexOf(combination[modifier.name] ?? ''), 0);
      const block = blocks.get(selector) ?? { selector, lines: [], rank };
      block.lines.push(...declarationsAt(combination, path).map(([property, value]) => `    ${property}: ${value};`));
      blocks.set(selector, block);
    }
  }

  const theme = /** @type {ModifierInfo} */ (modifiers.find((modifier) => modifier.name === 'theme'));
  const schemeOf = (/** @type {string} */ context) => (context === 'dark' || context === 'light' ? context : undefined);
  const schemeBlocks = theme.contexts
    .filter((context) => schemeOf(context))
    .map((context) => {
      const selector = context === theme.defaultContext ? `:root,\n  [data-theme='${context}']` : `[data-theme='${context}']`;
      return `  ${selector} {\n    color-scheme: ${context};\n  }\n`;
    });

  const themeDependent = paths.filter((path) => dependencies.get(path)?.includes(theme));
  const darkFallback = theme.contexts.includes('dark')
    ? [
        '  /* Without JavaScript, follow the system color scheme for the default product and density. */',
        '  @media (prefers-color-scheme: dark) {',
        "    :root:not([data-theme]) {",
        '      color-scheme: dark;',
        ...themeDependent.flatMap((path) =>
          declarationsAt({ theme: 'dark' }, path).map(([property, value]) => `      ${property}: ${value};`),
        ),
        '    }',
        '  }',
      ]
    : [];

  const css = [
    `/* ${options.banner} */`,
    `/* Modifiers: ${modifiers.map((modifier) => `data-${modifier.name} (${modifier.contexts.join(' | ')})`).join(', ')}. */`,
    '/* Scoped regions must set every modifier attribute; ThemeScope does this. */',
    '@layer tokens {',
    '  :root {',
    ...rootLines,
    '  }',
    '',
    ...schemeBlocks,
    ...[...blocks.values()]
      .sort((a, b) => a.rank - b.rank)
      .map((block) => `  ${block.selector} {\n${block.lines.join('\n')}\n  }\n`),
    ...darkFallback,
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
    `export const modifierNames = ${JSON.stringify(modifiers.map((modifier) => modifier.name))} as const;`,
    'export type ModifierName = (typeof modifierNames)[number];',
    '',
    ...modifiers.flatMap((modifier) => [
      `export const ${camel(modifier.name)}Names = ${JSON.stringify(modifier.contexts)} as const;`,
      `export type ${pascal(modifier.name)}Name = (typeof ${camel(modifier.name)}Names)[number];`,
    ]),
    '',
    '/** One context per modifier: the inputs of a resolver permutation. */',
    'export interface ModifierInput {',
    ...modifiers.map((modifier) => `  ${camel(modifier.name)}: ${pascal(modifier.name)}Name;`),
    '}',
    '',
    `export const modifierDefaults: ModifierInput = ${JSON.stringify(
      Object.fromEntries(modifiers.map((modifier) => [camel(modifier.name), modifier.defaultContext])),
    )};`,
    '',
    '/** Token counts per tier, so summaries need not load the full manifest. */',
    `export const tokenCounts = ${JSON.stringify(
      paths.reduce(
        (counts, path) => {
          const tier = /** @type {ResolvedToken} */ (defaultResolved.get(path)).tier;
          return { ...counts, [tier]: (counts[tier] ?? 0) + 1 };
        },
        /** @type {Record<string, number>} */ ({ total: paths.length }),
      ),
    )} as const;`,
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

  /** @param {ModifierInput} input @param {string} path */
  const valueAt = (input, path) => {
    const key = inputKey({ ...defaultInput, ...input });
    const token = /** @type {ResolvedToken} */ (resolvedByInput.get(key)?.get(path));
    const authored = byInput.get(key)?.get(path)?.value;
    const value = {
      authored: referenceTarget(authored) ? String(authored) : toCssValue(token.type, token.resolved),
      resolved: toCssValue(token.type, token.resolved),
      chain: token.chain,
    };
    // The file that set this value, recorded only where a context changed it.
    const defaultSource = defaultResolved.get(path)?.source;
    return token.source === defaultSource ? value : { ...value, source: token.source };
  };

  const manifest = paths.map((path) => {
    const token = /** @type {ResolvedToken} */ (defaultResolved.get(path));
    const dependsOn = /** @type {ModifierInfo[]} */ (dependencies.get(path));
    /** @type {Record<string, { authored: string, resolved: string, chain: string[] }>} */
    const values = {};
    for (const context of theme.contexts) values[context] = valueAt({ theme: context }, path);
    const record = {
      path,
      cssVar: cssVarName(path),
      type: token.type,
      tier: token.tier,
      source: token.source,
      description: token.description ?? '',
      themed: dependsOn.includes(theme),
      dependsOn: dependsOn.map((modifier) => modifier.name),
      values,
    };
    if (!dependsOn.some((modifier) => modifier !== theme)) return record;
    return {
      ...record,
      variants: combinationsOver(dependsOn).map((input) => ({ input, ...valueAt(input, path) })),
    };
  });

  const manifestTs = [
    `// ${options.banner}`,
    "import type { ThemeName } from './tokens';",
    '',
    'export interface TokenValue {',
    '  authored: string;',
    '  resolved: string;',
    '  chain: string[];',
    "  /** Source file that set this value, when it is not the record's own source. */",
    '  source?: string;',
    '}',
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
    '  /** Modifiers whose context changes this token; its CSS selector uses exactly these. */',
    '  dependsOn: string[];',
    '  /** Values per theme, with every other modifier at its default. */',
    '  values: Record<ThemeName, TokenValue>;',
    '  /** Every combination of the modifiers in dependsOn, present when a modifier other than theme applies. */',
    '  variants?: Array<TokenValue & { input: Record<string, string> }>;',
    '}',
    '',
    `export const tokenManifest: readonly TokenRecord[] = ${JSON.stringify(manifest, null, 2)};`,
    '',
  ].join('\n');

  return {
    css,
    ts,
    manifest: manifestTs,
    tokenCount: paths.length,
    contexts: modifiers.map((modifier) => `${modifier.name}: ${modifier.contexts.join(', ')}`),
    permutationCount: permutations.length,
  };
}

/** Color math for theming: sRGB ⇄ OKLCH, gamut mapping, WCAG 2 and APCA contrast, color-vision simulation. No dependencies. */

export type Rgb = readonly [number, number, number];
export interface Oklch {
  l: number;
  c: number;
  h: number;
}
export interface Oklab {
  l: number;
  a: number;
  b: number;
}

/** Accepts `#rgb`, `#rrggbb`, with or without `#`, in any case. Returns lowercase `#rrggbb`, or null. */
export function parseHex(input: string): string | null {
  const digits = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim())?.[1];
  if (!digits) return null;
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join('') : digits;
  return `#${full.toLowerCase()}`;
}

export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) throw new Error(`"${hex}" is not a 6-digit hex color.`);
  const value = match[1];
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255) as unknown as Rgb;
}

export function rgbToHex(rgb: Rgb): string {
  return `#${rgb
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

const toLinear = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const toGamma = (channel: number) => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);

/** Björn Ottosson's OKLab, via linear sRGB. */
export function rgbToOklab(rgb: Rgb): Oklab {
  const [r, g, b] = rgb.map(toLinear) as unknown as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function rgbToOklch(rgb: Rgb): Oklch {
  const { l, a, b } = rgbToOklab(rgb);
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return { l, c: Math.hypot(a, b), h: hue < 0 ? hue + 360 : hue };
}

/** Euclidean distance in OKLab (ΔEOK). Around 0.02 is just noticeable side by side. */
export function deltaEOK(first: string, second: string): number {
  const p = rgbToOklab(hexToRgb(first));
  const q = rgbToOklab(hexToRgb(second));
  return Math.hypot(p.l - q.l, p.a - q.a, p.b - q.b);
}

/** Linear-light sRGB for an OKLCH color; channels may fall outside 0–1 when out of gamut. */
function oklchToLinear({ l: L, c, h }: Oklch): Rgb {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (linear: Rgb) => linear.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/** Converts to sRGB, reducing chroma (keeping lightness and hue) until the color fits the gamut. */
export function oklchToRgb(color: Oklch): Rgb {
  let linear = oklchToLinear(color);
  if (!inGamut(linear)) {
    let low = 0;
    let high = color.c;
    for (let step = 0; step < 24; step += 1) {
      const middle = (low + high) / 2;
      if (inGamut(oklchToLinear({ ...color, c: middle }))) low = middle;
      else high = middle;
    }
    linear = oklchToLinear({ ...color, c: low });
  }
  return linear.map((channel) => toGamma(Math.min(1, Math.max(0, channel)))) as unknown as Rgb;
}

/** The most chroma sRGB can display at this OKLCH lightness and hue. */
export function maxChroma(l: number, h: number): number {
  let low = 0;
  let high = 0.5;
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;
    if (inGamut(oklchToLinear({ l, c: middle, h }))) low = middle;
    else high = middle;
  }
  return low;
}

export const visionTypes = ['typical', 'protanopia', 'deuteranopia', 'tritanopia'] as const;
export type Vision = (typeof visionTypes)[number];

/** Machado, Oliveira and Fernandes (2009), severity 1.0, applied to linear sRGB. Rows sum to 1, so grays are unchanged. */
const deficiency: Record<Exclude<Vision, 'typical'>, readonly number[]> = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
};

/** How a color appears with a full dichromacy, simulated. An approximation: perception varies between people. */
export function simulateVision(hex: string, vision: Vision): string {
  if (vision === 'typical') return hex;
  const matrix = deficiency[vision];
  const [r, g, b] = hexToRgb(hex).map(toLinear) as unknown as Rgb;
  const row = (index: number) => (matrix[index] ?? 0) * r + (matrix[index + 1] ?? 0) * g + (matrix[index + 2] ?? 0) * b;
  return rgbToHex([row(0), row(3), row(6)].map((channel) => toGamma(Math.min(1, Math.max(0, channel)))) as unknown as Rgb);
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as unknown as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio (1–21). */
export function wcagContrast(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * APCA lightness contrast (Lc), SAPC 0.0.98G-4g constants as published in apca-w3 0.1.9.
 * Polarity matters: positive for dark text on light, negative for light text on dark.
 * Informative only: APCA is a WCAG 3 draft method, not a WCAG 2 requirement.
 */
export function apcaContrast(text: string, background: string): number {
  const toY = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  };
  const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const textY = clamp(toY(text));
  const backgroundY = clamp(toY(background));
  if (Math.abs(backgroundY - textY) < 0.0005) return 0;
  if (backgroundY > textY) {
    const sapc = (backgroundY ** 0.56 - textY ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (backgroundY ** 0.65 - textY ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}

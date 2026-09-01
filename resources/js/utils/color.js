// Centralized color presentation helpers.
// Product/variant colors are stored as HEX (or already-readable names) in the
// database. The UI should always show a human-readable color NAME, while any
// swatch keeps using the real HEX/RGB value. Convert at the presentation layer
// only — never mutate stored values.

// Named reference palette (name -> RGB). Custom HEX values are mapped to the
// nearest entry by Euclidean distance in RGB space.
const NAMED_COLORS = [
  ['Black', 0, 0, 0],
  ['White', 255, 255, 255],
  ['Red', 255, 0, 0],
  ['Green', 0, 128, 0],
  ['Blue', 0, 0, 255],
  ['Yellow', 255, 255, 0],
  ['Orange', 255, 165, 0],
  ['Purple', 128, 0, 128],
  ['Pink', 255, 192, 203],
  ['Brown', 165, 42, 42],
  ['Gray', 128, 128, 128],
  ['Navy', 0, 0, 128],
  ['Teal', 0, 128, 128],
  ['Maroon', 128, 0, 0],
  ['Olive', 128, 128, 0],
  ['Cyan', 0, 255, 255],
  ['Magenta', 255, 0, 255],
  ['Beige', 245, 245, 220],
  ['Khaki', 195, 176, 145],
  ['Gold', 255, 215, 0],
  ['Silver', 192, 192, 192],
  ['Violet', 238, 130, 238],
  ['Indigo', 75, 0, 130],
  ['Ivory', 255, 255, 240],
  ['Chocolate', 210, 105, 30],
  ['Tan', 210, 180, 140],
  ['Coral', 255, 127, 80],
  ['Crimson', 220, 20, 60],
  ['Lavender', 230, 230, 250],
  ['Light Blue', 173, 216, 230],
  ['Light Green', 144, 238, 144],
  ['Light Gray', 211, 211, 211],
  ['Dark Gray', 105, 105, 105],
  ['Slate Gray', 112, 128, 144],
  ['Dark Slate Gray', 47, 79, 79],
  ['Dark Olive Green', 85, 107, 47],
  ['Wheat', 245, 222, 179],
]

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

// Parse a #RGB or #RRGGBB string (case-insensitive) into {r,g,b}, or null.
function parseHex(value) {
  if (typeof value !== 'string') return null
  const m = value.trim().match(HEX_RE)
  if (!m) return null
  let hex = m[1]
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  const int = parseInt(hex, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function nearestColorName({ r, g, b }) {
  let best = NAMED_COLORS[0][0]
  let min = Infinity
  for (const [name, nr, ng, nb] of NAMED_COLORS) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2
    if (d < min) {
      min = d
      best = name
    }
  }
  return best
}

// Title-case a slug/lowercase word, e.g. "dark-blue" -> "Dark Blue".
function titleize(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// Convert a single color token to a readable name. HEX -> nearest name;
// slug/lowercase -> Title Case; already-readable names are kept as-is.
export function humanizeColor(value) {
  if (value == null || value === '') return value
  const str = String(value).trim()
  const rgb = parseHex(str)
  if (rgb) return nearestColorName(rgb)
  if (/[-_]/.test(str) || str === str.toLowerCase()) return titleize(str)
  return str
}

// Format a possibly-composite label such as a variant label ("M / #000000")
// or a plain color, converting only the color parts to readable names.
export function formatColorText(value) {
  if (value == null || value === '') return value
  return String(value)
    .split('/')
    .map((part) => humanizeColor(part.trim()))
    .join(' / ')
}

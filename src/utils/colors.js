/** Map common color names to hex for swatches when color_hex is null. */
const COLOR_HEX_MAP = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  red: '#d32f2f',
  blue: '#1976d2',
  green: '#388e3c',
  yellow: '#f9a825',
  orange: '#f57c00',
  pink: '#ec407a',
  purple: '#7b1fa2',
  silver: '#bdbdbd',
  grey: '#9e9e9e',
  gray: '#9e9e9e',
  gold: '#c9a227',
  clear: '#e3f2fd',
  transparent: '#e3f2fd',
}

function guessColorHex(name) {
  const key = name.toLowerCase().trim()
  return COLOR_HEX_MAP[key] || '#c97818'
}

/**
 * Normalize colors from whatsapp_bot_item_colors relation rows.
 */
export function normalizeColorRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return []

  return [...rows]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row) => ({
      id: row.id,
      name: row.color_name,
      hex: row.color_hex || guessColorHex(row.color_name),
    }))
}

/** Get normalized color options for a product. */
export function getProductColors(product) {
  if (!product) return []

  // From whatsapp_bot_item_colors relation (primary source)
  if (Array.isArray(product.whatsapp_bot_item_colors)) {
    return normalizeColorRows(product.whatsapp_bot_item_colors)
  }

  // Normalized colors array attached during fetch
  if (Array.isArray(product.colors)) {
    return product.colors
  }

  return []
}

export function productHasColors(product) {
  return getProductColors(product).length > 0
}

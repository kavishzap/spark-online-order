import { getProductColors } from '../utils/colors'

export default function ColorSelector({ colors, selected, onChange, name, variant = 'inline' }) {
  if (!colors.length) return null

  return (
    <div
      className={`color-selector${variant === 'modal' ? ' color-selector--modal' : ''}`}
      role="group"
      aria-label={`${name} color`}
    >
      <span className="color-selector__label">Color</span>
      <div className="color-selector__options">
        {colors.map((color) => {
          const isSelected = selected === color.name
          return (
            <button
              key={color.name}
              type="button"
              className={`color-selector__option${isSelected ? ' color-selector__option--selected' : ''}`}
              onClick={() => onChange(color.name)}
              aria-pressed={isSelected}
              title={color.name}
            >
              <span
                className="color-selector__swatch"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <span className="color-selector__name">{color.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Hook-friendly helper to init selected color from product. */
export function getDefaultColor(product) {
  const colors = getProductColors(product)
  return colors[0]?.name ?? null
}

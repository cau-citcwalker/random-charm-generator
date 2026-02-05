import { motion } from 'framer-motion'
import type { ColorOption } from '@/types/choices'

interface ColorPickerProps {
  colors: ColorOption[]
  selected: string | null
  onSelect: (colorId: string) => void
}

export function ColorPicker({ colors, selected, onSelect }: ColorPickerProps) {
  return (
    <div className="picker-grid color-grid">
      {colors.map((color) => (
        <motion.button
          key={color.id}
          className={`color-item ${selected === color.id ? 'picker-selected' : ''}`}
          onClick={() => onSelect(color.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="color-swatch"
            style={{ backgroundColor: color.hex }}
          />
          <span className="picker-label">{color.name}</span>
        </motion.button>
      ))}
    </div>
  )
}

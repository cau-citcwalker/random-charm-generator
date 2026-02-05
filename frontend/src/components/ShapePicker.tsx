import { motion } from 'framer-motion'

interface ShapePickerProps {
  shapes: string[]
  selected: string | null
  onSelect: (shape: string) => void
}

const SHAPE_ICONS: Record<string, string> = {
  circle: '⭕',
  star: '⭐',
  heart: '❤️',
  hexagon: '⬡',
  cloud: '☁️',
  diamond: '💎',
}

const SHAPE_NAMES: Record<string, string> = {
  circle: '원',
  star: '별',
  heart: '하트',
  hexagon: '육각형',
  cloud: '구름',
  diamond: '다이아몬드',
}

export function ShapePicker({ shapes, selected, onSelect }: ShapePickerProps) {
  return (
    <div className="picker-grid">
      {shapes.map((shape) => (
        <motion.button
          key={shape}
          className={`picker-item ${selected === shape ? 'picker-selected' : ''}`}
          onClick={() => onSelect(shape)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="picker-icon">{SHAPE_ICONS[shape] ?? '⬜'}</span>
          <span className="picker-label">{SHAPE_NAMES[shape] ?? shape}</span>
        </motion.button>
      ))}
    </div>
  )
}

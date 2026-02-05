import { motion } from 'framer-motion'

interface PatternPickerProps {
  patterns: string[]
  selected: string | null
  onSelect: (pattern: string) => void
}

const PATTERN_ICONS: Record<string, string> = {
  swirl: '🌀',
  dots: '⚪',
  stripes: '📏',
  floral: '🌸',
  geometric: '🔷',
  plain: '⬜',
}

const PATTERN_NAMES: Record<string, string> = {
  swirl: '소용돌이',
  dots: '도트',
  stripes: '스트라이프',
  floral: '꽃무늬',
  geometric: '기하학',
  plain: '단색',
}

export function PatternPicker({ patterns, selected, onSelect }: PatternPickerProps) {
  return (
    <div className="picker-grid">
      {patterns.map((pattern) => (
        <motion.button
          key={pattern}
          className={`picker-item ${selected === pattern ? 'picker-selected' : ''}`}
          onClick={() => onSelect(pattern)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="picker-icon">{PATTERN_ICONS[pattern] ?? '⬜'}</span>
          <span className="picker-label">{PATTERN_NAMES[pattern] ?? pattern}</span>
        </motion.button>
      ))}
    </div>
  )
}

import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { Potion } from '@/types/choices'

interface CauldronProps {
  selectedPotions: string[]
  potions: Potion[]
}

export function Cauldron({ selectedPotions, potions }: CauldronProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'cauldron' })

  const mixedColor = selectedPotions.length > 0
    ? blendColors(selectedPotions.map((id) => {
        const potion = potions.find((p) => p.id === id)
        return potion?.color ?? '#666'
      }))
    : '#4a4a4a'

  return (
    <div ref={setNodeRef} className={`cauldron ${isOver ? 'cauldron-active' : ''}`}>
      <div className="cauldron-body">
        <motion.div
          className="cauldron-liquid"
          style={{ backgroundColor: mixedColor }}
          animate={{
            scale: isOver ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {selectedPotions.length > 0 && (
            <div className="bubbles">
              {[...Array(Math.min(selectedPotions.length * 2, 10))].map((_, i) => (
                <motion.div
                  key={i}
                  className="bubble"
                  animate={{
                    y: [-10, -30 - Math.random() * 20],
                    opacity: [0.8, 0],
                    scale: [0.5 + Math.random() * 0.5, 0],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
        <div className="cauldron-rim" />
      </div>
      <p className="cauldron-label">
        {selectedPotions.length === 0
          ? '포션을 여기에 넣으세요'
          : `${selectedPotions.length}개의 포션 투입됨`}
      </p>
    </div>
  )
}

function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#4a4a4a'
  if (colors.length === 1) return colors[0]

  let r = 0, g = 0, b = 0
  for (const color of colors) {
    const hex = color.replace('#', '')
    r += parseInt(hex.substring(0, 2), 16)
    g += parseInt(hex.substring(2, 4), 16)
    b += parseInt(hex.substring(4, 6), 16)
  }
  const n = colors.length
  r = Math.round(r / n)
  g = Math.round(g / n)
  b = Math.round(b / n)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

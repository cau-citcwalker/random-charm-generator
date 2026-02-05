import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import type { BaseElement } from '@/types/choices'

interface RouletteProps {
  result: BaseElement | null
  onReveal: () => void
  revealed: boolean
}

const SEGMENTS = [
  { label: '???', color: '#FF6B6B' },
  { label: '???', color: '#4ECDC4' },
  { label: '???', color: '#45B7D1' },
  { label: '???', color: '#96CEB4' },
  { label: '???', color: '#FFEAA7' },
  { label: '???', color: '#DDA0DD' },
  { label: '???', color: '#98D8C8' },
  { label: '???', color: '#F7DC6F' },
]

export function Roulette({ result, onReveal, revealed }: RouletteProps) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleSpin = () => {
    if (spinning || !result || revealed) return
    setSpinning(true)

    const targetRotation = rotation + 1440 + Math.random() * 720
    setRotation(targetRotation)

    setTimeout(() => {
      setSpinning(false)
      onReveal()
    }, 4000)
  }

  return (
    <div className="roulette">
      <div className="roulette-frame">
        <div className="roulette-pointer">▼</div>
        <motion.div
          ref={wheelRef}
          className="roulette-wheel"
          animate={{ rotate: rotation }}
          transition={{
            duration: 4,
            ease: [0.15, 0.85, 0.35, 1],
          }}
        >
          {SEGMENTS.map((segment, i) => {
            const angle = (360 / SEGMENTS.length) * i
            return (
              <div
                key={i}
                className="roulette-segment"
                style={{
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: segment.color,
                }}
              >
                <span className="segment-label">{segment.label}</span>
              </div>
            )
          })}
        </motion.div>
      </div>

      <motion.button
        className="btn-spin"
        onClick={handleSpin}
        disabled={spinning || revealed}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {spinning ? '돌아가는 중...' : revealed ? '완료!' : '돌리기!'}
      </motion.button>
    </div>
  )
}

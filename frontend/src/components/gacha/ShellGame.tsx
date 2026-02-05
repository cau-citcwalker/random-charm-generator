import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { BaseElement } from '@/types/choices'
import { playShuffle } from '@/utils/audio'

interface ShellGameProps {
  result: BaseElement | null
  onReveal: () => void
  revealed: boolean
}

type ShellPhase = 'show' | 'shuffle' | 'pick' | 'reveal'

export function ShellGame({ onReveal, revealed }: ShellGameProps) {
  const [phase, setPhase] = useState<ShellPhase>('show')
  const [positions, setPositions] = useState([0, 1, 2])
  const [ballPosition] = useState(1)
  const [selectedCup, setSelectedCup] = useState<number | null>(null)

  const shuffle = useCallback(() => {
    setPositions((prev) => {
      const next = [...prev]
      const a = Math.floor(Math.random() * 3)
      let b = Math.floor(Math.random() * 3)
      while (b === a) b = Math.floor(Math.random() * 3)
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })
  }, [])

  useEffect(() => {
    if (phase === 'show') {
      const timer = setTimeout(() => {
        setPhase('shuffle')
      }, 1500)
      return () => clearTimeout(timer)
    }
    if (phase === 'shuffle') {
      let count = 0
      const interval = setInterval(() => {
        playShuffle()
        shuffle()
        count++
        if (count >= 6) {
          clearInterval(interval)
          setPhase('pick')
        }
      }, 400)
      return () => clearInterval(interval)
    }
  }, [phase, shuffle])

  const handlePick = (index: number) => {
    if (phase !== 'pick' || revealed) return
    setSelectedCup(index)
    setPhase('reveal')
    onReveal()
  }

  const getCupSpacing = () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--cup-spacing')
      .trim()
    return parseInt(value, 10) || 140
  }

  const getCupX = (index: number) => {
    return positions[index] * getCupSpacing()
  }

  return (
    <div className="shell-game">
      <p className="gacha-instruction">
        {phase === 'show' && '공의 위치를 기억하세요!'}
        {phase === 'shuffle' && '셔플 중...'}
        {phase === 'pick' && '공이 어디에 있을까요?'}
        {phase === 'reveal' && '결과를 확인하세요!'}
      </p>
      <div className="cups-container">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`cup ${selectedCup === index ? 'selected' : ''}`}
            animate={{
              x: getCupX(index),
              y: phase === 'reveal' && selectedCup === index ? -60 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => handlePick(index)}
            whileHover={phase === 'pick' ? { y: -10 } : undefined}
            style={{ cursor: phase === 'pick' ? 'pointer' : 'default' }}
          >
            <div className="cup-body">🥤</div>
          </motion.div>
        ))}
        {(phase === 'show' || phase === 'reveal') && (
          <motion.div
            className="ball"
            initial={{ opacity: 0 }}
            animate={{ x: getCupX(ballPosition) + getCupSpacing() * 0.32, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🔮
          </motion.div>
        )}
      </div>
    </div>
  )
}

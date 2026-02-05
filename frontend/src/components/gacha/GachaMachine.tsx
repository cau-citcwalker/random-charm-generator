import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BaseElement } from '@/types/choices'

interface GachaMachineProps {
  result: BaseElement | null
  onReveal: () => void
  revealed: boolean
}

type MachinePhase = 'ready' | 'turning' | 'dispensing' | 'done'

export function GachaMachine({ result, onReveal }: GachaMachineProps) {
  const [phase, setPhase] = useState<MachinePhase>('ready')

  const handleTurn = () => {
    if (phase !== 'ready' || !result) return
    setPhase('turning')
    setTimeout(() => {
      setPhase('dispensing')
      setTimeout(() => {
        setPhase('done')
        onReveal()
      }, 1000)
    }, 1500)
  }

  return (
    <div className="gacha-machine">
      <div className="machine-body">
        <div className="machine-dome">
          <motion.div
            className="capsules-inside"
            animate={
              phase === 'turning'
                ? { rotate: [0, 15, -15, 10, -10, 0] }
                : {}
            }
            transition={{ duration: 1.5 }}
          >
            {['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'].map((emoji, i) => (
              <span key={i} className="capsule-ball">
                {emoji}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="machine-handle"
          onClick={handleTurn}
          whileHover={phase === 'ready' ? { rotate: -10 } : undefined}
          animate={
            phase === 'turning'
              ? { rotate: [0, -180, -360] }
              : {}
          }
          transition={{ duration: 1.5 }}
          style={{ cursor: phase === 'ready' ? 'pointer' : 'default' }}
        >
          🎰
        </motion.div>

        <div className="machine-slot">
          {(phase === 'dispensing' || phase === 'done') && (
            <motion.div
              className="dispensed-capsule"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              🎁
            </motion.div>
          )}
        </div>
      </div>

      <p className="gacha-instruction">
        {phase === 'ready' && '핸들을 돌려 뽑기를 시작하세요!'}
        {phase === 'turning' && '캡슐이 나오는 중...'}
        {phase === 'dispensing' && '캡슐이 나왔어요!'}
        {phase === 'done' && '결과를 확인하세요!'}
      </p>
    </div>
  )
}

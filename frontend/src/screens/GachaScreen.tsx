import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGachaStore } from '@/stores/useGachaStore'
import { gachaSpin } from '@/api/client'
import { ShellGame } from '@/components/gacha/ShellGame'
import { GachaMachine } from '@/components/gacha/GachaMachine'
import { Roulette } from '@/components/gacha/Roulette'
import type { BaseElement } from '@/types/choices'
import { playGachaReveal, playClick } from '@/utils/audio'

export function GachaScreen() {
  const gachaType = useGachaStore((s) => s.gachaType)
  const setBaseElement = useGachaStore((s) => s.setBaseElement)
  const setScreen = useGachaStore((s) => s.setScreen)
  const [result, setResult] = useState<BaseElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    gachaSpin().then(setResult).catch(console.error)
  }, [])

  const handleReveal = () => {
    if (!result) return
    playGachaReveal()
    setRevealed(true)
  }

  const handleContinue = () => {
    if (!result) return
    playClick()
    setBaseElement(result)
    setScreen('potion')
  }

  const renderGacha = () => {
    const props = { result, onReveal: handleReveal, revealed }
    switch (gachaType) {
      case 'shell':
        return <ShellGame {...props} />
      case 'machine':
        return <GachaMachine {...props} />
      case 'roulette':
        return <Roulette {...props} />
    }
  }

  return (
    <div className="gacha-screen">
      {!revealed ? (
        <>
          <h2 className="screen-title">뽑기</h2>
          <div className="gacha-container">
            {renderGacha()}
          </div>
        </>
      ) : result && (
        <motion.div
          className="gacha-result-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`result-card-big rarity-${result.rarity}`}>
            <span className="result-icon-big">{result.icon}</span>
            <h3 className="result-name-big">{result.display_name}</h3>
            <span className="rarity-badge-big">{result.rarity}</span>
          </div>
          <motion.button
            className="btn-next"
            onClick={handleContinue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            다음
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

import { motion } from 'framer-motion'
import { useGachaStore } from '@/stores/useGachaStore'
import { playClick } from '@/utils/audio'

export function TitleScreen() {
  const setScreen = useGachaStore((s) => s.setScreen)
  const randomizeGachaType = useGachaStore((s) => s.randomizeGachaType)

  const handleStart = () => {
    playClick()
    randomizeGachaType()
    setScreen('gacha')
  }

  return (
    <div className="title-screen">
      <motion.h1
        className="title-text"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
      >
        키링 가챠
      </motion.h1>
      <motion.p
        className="title-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        나만의 특별한 키링을 만들어보세요
      </motion.p>
      <motion.button
        className="btn-start"
        onClick={handleStart}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        시작하기
      </motion.button>
    </div>
  )
}

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGachaStore } from '@/stores/useGachaStore'
import { subscribeToStatus } from '@/api/client'
import { ProgressBar } from '@/components/ProgressBar'
import { KeyringResult } from '@/components/KeyringResult'
import { MiniGameSelector } from '@/minigames/MiniGameSelector'
import { playComplete, playError } from '@/utils/audio'

export function GenerationScreen() {
  const {
    generationId,
    generationStatus,
    generationProgress,
    imageUrl,
    setGenerationStatus,
    setGenerationProgress,
    setImageUrl,
    reset,
  } = useGachaStore()

  useEffect(() => {
    if (!generationId) return

    const eventSource = subscribeToStatus(
      generationId,
      (event) => {
        setGenerationStatus(event.status)
        setGenerationProgress(event.progress)
        if (event.status === 'complete' && event.image_url) {
          playComplete()
          setImageUrl(event.image_url)
        }
        if (event.status === 'error') {
          playError()
        }
      },
      () => {
        playError()
        setGenerationStatus('error')
      },
    )

    return () => eventSource.close()
  }, [generationId, setGenerationStatus, setGenerationProgress, setImageUrl])

  const handleRestart = () => {
    reset()
  }

  if (generationStatus === 'complete' && imageUrl) {
    return (
      <div className="generation-screen">
        <KeyringResult imageUrl={imageUrl} onRestart={handleRestart} />
      </div>
    )
  }

  if (generationStatus === 'error') {
    return (
      <div className="generation-screen">
        <div className="error-container">
          <h2>생성 중 오류가 발생했습니다</h2>
          <motion.button
            className="btn-restart"
            onClick={handleRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            처음부터 다시
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="generation-screen">
      <h2 className="screen-title">키링 생성 중...</h2>
      <ProgressBar progress={generationProgress} />
      <p className="generation-hint">생성되는 동안 미니게임을 즐겨보세요!</p>
      <MiniGameSelector />
    </div>
  )
}

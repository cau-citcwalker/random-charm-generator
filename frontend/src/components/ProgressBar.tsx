import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percent = Math.round(progress * 100)

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="progress-text">{percent}%</span>
    </div>
  )
}

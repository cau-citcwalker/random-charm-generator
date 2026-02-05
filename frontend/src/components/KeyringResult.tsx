import { motion } from 'framer-motion'

interface KeyringResultProps {
  imageUrl: string
  onRestart: () => void
}

export function KeyringResult({ imageUrl, onRestart }: KeyringResultProps) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'my-keyring.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      className="keyring-result"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'backOut' }}
    >
      <h2>나만의 키링이 완성되었어요!</h2>
      <div className="result-image-container">
        <img src={imageUrl} alt="생성된 키링" className="result-image" />
      </div>
      <div className="result-actions">
        <motion.button
          className="btn-download"
          onClick={handleDownload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          다운로드
        </motion.button>
        <motion.button
          className="btn-restart"
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          다시 뽑기
        </motion.button>
      </div>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Game2048 } from './Game2048'
import { Minesweeper } from './Minesweeper'
import { SnakeGame } from './SnakeGame'

type GameType = '2048' | 'minesweeper' | 'snake'

const GAMES: { id: GameType; name: string; emoji: string }[] = [
  { id: '2048', name: '2048', emoji: '🔢' },
  { id: 'minesweeper', name: '지뢰찾기', emoji: '💣' },
  { id: 'snake', name: '뱀 게임', emoji: '🐍' },
]

export function MiniGameSelector() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)

  if (selectedGame) {
    const GameComponent = {
      '2048': Game2048,
      minesweeper: Minesweeper,
      snake: SnakeGame,
    }[selectedGame]

    return (
      <div className="minigame-container">
        <button className="btn-back-game" onClick={() => setSelectedGame(null)}>
          ← 게임 선택으로
        </button>
        <GameComponent />
      </div>
    )
  }

  return (
    <div className="game-picker">
      <p>미니게임을 선택하세요!</p>
      <div className="game-options">
        {GAMES.map((game) => (
          <motion.button
            key={game.id}
            className="game-option"
            onClick={() => setSelectedGame(game.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="game-emoji">{game.emoji}</span>
            <span className="game-name">{game.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

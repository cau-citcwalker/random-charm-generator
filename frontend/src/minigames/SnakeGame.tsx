import { useEffect, useRef, useState, useCallback } from 'react'

const CELL_SIZE = 20
const GRID_W = 15
const GRID_H = 15
const CANVAS_W = GRID_W * CELL_SIZE
const CANVAS_H = GRID_H * CELL_SIZE

type Point = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const gameState = useRef({
    snake: [{ x: 7, y: 7 }] as Point[],
    food: { x: 3, y: 3 } as Point,
    direction: 'right' as Direction,
    nextDirection: 'right' as Direction,
    running: true,
  })

  const spawnFood = useCallback(() => {
    const snake = gameState.current.snake
    let food: Point
    do {
      food = {
        x: Math.floor(Math.random() * GRID_W),
        y: Math.floor(Math.random() * GRID_H),
      }
    } while (snake.some((s) => s.x === food.x && s.y === food.y))
    gameState.current.food = food
  }, [])

  const resetGame = useCallback(() => {
    gameState.current = {
      snake: [{ x: 7, y: 7 }],
      food: { x: 3, y: 3 },
      direction: 'right',
      nextDirection: 'right',
      running: true,
    }
    spawnFood()
    setScore(0)
    setGameOver(false)
  }, [spawnFood])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleKey = (e: KeyboardEvent) => {
      const opposites: Record<string, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      }
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      }
      const dir = keyMap[e.key]
      if (dir && dir !== opposites[gameState.current.direction]) {
        e.preventDefault()
        gameState.current.nextDirection = dir
      }
    }
    window.addEventListener('keydown', handleKey)

    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (Math.max(absDx, absDy) < 20) return

      const opposites: Record<string, Direction> = {
        up: 'down', down: 'up', left: 'right', right: 'left',
      }
      let dir: Direction
      if (absDx > absDy) {
        dir = dx > 0 ? 'right' : 'left'
      } else {
        dir = dy > 0 ? 'down' : 'up'
      }
      if (dir !== opposites[gameState.current.direction]) {
        gameState.current.nextDirection = dir
      }
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })

    const tick = () => {
      const gs = gameState.current
      if (!gs.running) return

      gs.direction = gs.nextDirection
      const head = { ...gs.snake[0] }
      switch (gs.direction) {
        case 'up': head.y--; break
        case 'down': head.y++; break
        case 'left': head.x--; break
        case 'right': head.x++; break
      }

      if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
        gs.running = false
        setGameOver(true)
        return
      }
      if (gs.snake.some((s) => s.x === head.x && s.y === head.y)) {
        gs.running = false
        setGameOver(true)
        return
      }

      gs.snake.unshift(head)
      if (head.x === gs.food.x && head.y === gs.food.y) {
        setScore((s) => s + 1)
        spawnFood()
      } else {
        gs.snake.pop()
      }

      // Draw
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      ctx.fillStyle = '#e74c3c'
      ctx.fillRect(gs.food.x * CELL_SIZE, gs.food.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)

      gs.snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#2ecc71' : '#27ae60'
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
      })
    }

    const interval = setInterval(tick, 150)
    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKey)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [spawnFood])

  return (
    <div className="snake-game">
      <div className="game-header">
        <span className="game-score">점수: {score}</span>
        <button className="btn-reset-game" onClick={resetGame}>
          리셋
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="snake-canvas"
      />
      {gameOver && (
        <div className="game-over-overlay">
          <p>게임 오버!</p>
          <button onClick={resetGame}>다시 시작</button>
        </div>
      )}
    </div>
  )
}

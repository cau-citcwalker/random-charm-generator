import { useState, useEffect, useCallback, useRef } from 'react'

type Board = number[][]

function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0))
}

function addRandomTile(board: Board): Board {
  const newBoard = board.map((row) => [...row])
  const empty: [number, number][] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newBoard[r][c] === 0) empty.push([r, c])
    }
  }
  if (empty.length === 0) return newBoard
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4
  return newBoard
}

function slide(row: number[]): { result: number[]; score: number } {
  const filtered = row.filter((x) => x !== 0)
  let score = 0
  const merged: number[] = []
  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2
      merged.push(val)
      score += val
      i += 2
    } else {
      merged.push(filtered[i])
      i++
    }
  }
  while (merged.length < 4) merged.push(0)
  return { result: merged, score }
}

function moveLeft(board: Board): { board: Board; score: number; moved: boolean } {
  let totalScore = 0
  let moved = false
  const newBoard = board.map((row) => {
    const { result, score } = slide(row)
    totalScore += score
    if (result.some((v, i) => v !== row[i])) moved = true
    return result
  })
  return { board: newBoard, score: totalScore, moved }
}

function rotate90(board: Board): Board {
  const n = board.length
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => board[n - 1 - c][r]),
  )
}

function move(board: Board, direction: string): { board: Board; score: number; moved: boolean } {
  let rotated = board
  const rotations: Record<string, number> = { left: 0, up: 1, right: 2, down: 3 }
  const count = rotations[direction] ?? 0
  for (let i = 0; i < count; i++) rotated = rotate90(rotated)
  const result = moveLeft(rotated)
  let final = result.board
  for (let i = 0; i < (4 - count) % 4; i++) final = rotate90(final)
  return { board: final, score: result.score, moved: result.moved }
}

function isGameOver(board: Board): boolean {
  for (const dir of ['left', 'right', 'up', 'down']) {
    if (move(board, dir).moved) return false
  }
  return true
}

const TILE_COLORS: Record<number, string> = {
  0: '#cdc1b4',
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

export function Game2048() {
  const [board, setBoard] = useState<Board>(() => {
    let b = createEmptyBoard()
    b = addRandomTile(b)
    b = addRandomTile(b)
    return b
  })
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const handleMove = useCallback(
    (direction: string) => {
      if (gameOver) return
      const result = move(board, direction)
      if (!result.moved) return
      const newBoard = addRandomTile(result.board)
      setBoard(newBoard)
      setScore((s) => s + result.score)
      if (isGameOver(newBoard)) setGameOver(true)
    },
    [board, gameOver],
  )

  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keyMap: Record<string, string> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        handleMove(dir)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleMove])

  useEffect(() => {
    const el = boardRef.current
    if (!el) return

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

      let dir: string
      if (absDx > absDy) {
        dir = dx > 0 ? 'right' : 'left'
      } else {
        dir = dy > 0 ? 'down' : 'up'
      }
      handleMove(dir)
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMove])

  const handleReset = () => {
    let b = createEmptyBoard()
    b = addRandomTile(b)
    b = addRandomTile(b)
    setBoard(b)
    setScore(0)
    setGameOver(false)
  }

  return (
    <div className="game-2048">
      <div className="game-header">
        <span className="game-score">점수: {score}</span>
        <button className="btn-reset-game" onClick={handleReset}>
          리셋
        </button>
      </div>
      <div className="board-2048" ref={boardRef}>
        {board.map((row, r) =>
          row.map((value, c) => (
            <div
              key={`${r}-${c}`}
              className="tile-2048"
              style={{
                backgroundColor: TILE_COLORS[value] ?? '#3c3a32',
                color: value <= 4 ? '#776e65' : '#f9f6f2',
              }}
            >
              {value > 0 ? value : ''}
            </div>
          )),
        )}
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <p>게임 오버!</p>
          <button onClick={handleReset}>다시 시작</button>
        </div>
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'

const ROWS = 8
const COLS = 8
const MINES = 10

interface Cell {
  mine: boolean
  revealed: boolean
  flagged: boolean
  adjacent: number
}

type Board = Cell[][]

function createBoard(): Board {
  const board: Board = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  )

  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!board[r][c].mine) {
      board[r][c].mine = true
      placed++
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
            count++
          }
        }
      }
      board[r][c].adjacent = count
    }
  }

  return board
}

function revealCell(board: Board, r: number, c: number): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  const stack: [number, number][] = [[r, c]]

  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue
    if (newBoard[cr][cc].revealed || newBoard[cr][cc].flagged) continue
    newBoard[cr][cc].revealed = true
    if (newBoard[cr][cc].adjacent === 0 && !newBoard[cr][cc].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          stack.push([cr + dr, cc + dc])
        }
      }
    }
  }

  return newBoard
}

const ADJ_COLORS: Record<number, string> = {
  1: '#2563eb',
  2: '#16a34a',
  3: '#dc2626',
  4: '#7c3aed',
  5: '#b91c1c',
  6: '#0891b2',
  7: '#1f2937',
  8: '#6b7280',
}

export function Minesweeper() {
  const [board, setBoard] = useState<Board>(createBoard)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const checkWin = useCallback((b: Board) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!b[r][c].mine && !b[r][c].revealed) return false
      }
    }
    return true
  }, [])

  const handleClick = (r: number, c: number) => {
    if (gameOver || won || board[r][c].flagged || board[r][c].revealed) return

    if (board[r][c].mine) {
      const newBoard = board.map((row) =>
        row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)),
      )
      setBoard(newBoard)
      setGameOver(true)
      return
    }

    const newBoard = revealCell(board, r, c)
    setBoard(newBoard)
    if (checkWin(newBoard)) setWon(true)
  }

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameOver || won || board[r][c].revealed) return
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    setBoard(newBoard)
  }

  const handleReset = () => {
    setBoard(createBoard())
    setGameOver(false)
    setWon(false)
  }

  const flagCount = board.flat().filter((c) => c.flagged).length

  return (
    <div className="minesweeper">
      <div className="game-header">
        <span>💣 {MINES - flagCount}</span>
        <button className="btn-reset-game" onClick={handleReset}>
          리셋
        </button>
      </div>
      <div className="mine-board" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              className={`mine-cell ${cell.revealed ? 'revealed' : ''} ${cell.mine && cell.revealed ? 'mine' : ''}`}
              onClick={() => handleClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
            >
              {cell.flagged && !cell.revealed
                ? '🚩'
                : cell.revealed
                  ? cell.mine
                    ? '💣'
                    : cell.adjacent > 0
                      ? (
                          <span style={{ color: ADJ_COLORS[cell.adjacent] }}>
                            {cell.adjacent}
                          </span>
                        )
                      : ''
                  : ''}
            </button>
          )),
        )}
      </div>
      {(gameOver || won) && (
        <div className="game-over-overlay">
          <p>{won ? '승리!' : '게임 오버!'}</p>
          <button onClick={handleReset}>다시 시작</button>
        </div>
      )}
    </div>
  )
}

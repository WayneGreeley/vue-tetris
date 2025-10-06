import { reactive, computed, readonly } from 'vue'
import type { 
  GameState, 
  GameConfig, 
  Position, 
  Piece, 
  GameStatus,
  GameStats,
  LinesClearedResult
} from '@/types'

// Game configuration constants
const DEFAULT_CONFIG: GameConfig = {
  boardWidth: 10,
  boardHeight: 20,
  initialFallInterval: 1000, // 1 second
  levelSpeedMultiplier: 0.9, // 10% faster each level
  colors: [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9'  // Light Blue
  ],
  pointsPerLine: [100, 300, 500, 800], // Points for 1, 2, 3, 4 lines
  linesPerLevel: 10
}

// Initialize empty board
function createEmptyBoard(width: number, height: number): number[][] {
  return Array(height).fill(null).map(() => Array(width).fill(0))
}

// Initial game state
function createInitialState(): GameState {
  return {
    board: createEmptyBoard(DEFAULT_CONFIG.boardWidth, DEFAULT_CONFIG.boardHeight),
    currentPiece: null,
    nextPiece: null,
    piecePosition: { x: Math.floor(DEFAULT_CONFIG.boardWidth / 2) - 2, y: 0 },
    pieceRotation: 0,
    score: 0,
    level: 1,
    linesCleared: 0,
    gameStatus: 'ready',
    fallTimer: 0,
    fallInterval: DEFAULT_CONFIG.initialFallInterval,
    isGameRunning: false,
    lastUpdateTime: 0
  }
}

// Reactive game state
const gameState = reactive<GameState>(createInitialState())

export function useGameState() {
  // Computed properties for derived state
  const gameStats = computed<GameStats>(() => ({
    totalLinesCleared: gameState.linesCleared,
    totalPiecesPlaced: 0, // Will be tracked separately
    currentLevel: gameState.level,
    currentScore: gameState.score,
    gameTime: gameState.lastUpdateTime
  }))

  const isGameActive = computed(() => 
    gameState.gameStatus === 'playing'
  )

  const isGamePaused = computed(() => 
    gameState.gameStatus === 'paused'
  )

  const isGameOver = computed(() => 
    gameState.gameStatus === 'gameOver'
  )

  const currentFallSpeed = computed(() => 
    Math.max(50, gameState.fallInterval * Math.pow(DEFAULT_CONFIG.levelSpeedMultiplier, gameState.level - 1))
  )

  const nextLevelProgress = computed(() => {
    const linesInCurrentLevel = gameState.linesCleared % DEFAULT_CONFIG.linesPerLevel
    return linesInCurrentLevel / DEFAULT_CONFIG.linesPerLevel
  })

  // State management functions
  function initializeGame(): void {
    Object.assign(gameState, createInitialState())
    gameState.gameStatus = 'ready'
  }

  function startGame(): void {
    // Only initialize if game is over, not if it's ready (pieces already set)
    if (gameState.gameStatus === 'gameOver') {
      initializeGame()
    }
    gameState.gameStatus = 'playing'
    gameState.isGameRunning = true
    gameState.lastUpdateTime = Date.now()
  }

  function pauseGame(): void {
    if (gameState.gameStatus === 'playing') {
      gameState.gameStatus = 'paused'
      gameState.isGameRunning = false
    }
  }

  function resumeGame(): void {
    if (gameState.gameStatus === 'paused') {
      gameState.gameStatus = 'playing'
      gameState.isGameRunning = true
      gameState.lastUpdateTime = Date.now()
    }
  }

  function endGame(): void {
    gameState.gameStatus = 'gameOver'
    gameState.isGameRunning = false
  }

  function restartGame(): void {
    initializeGame()
    startGame()
  }

  // Piece management
  function setCurrentPiece(piece: Piece | null): void {
    gameState.currentPiece = piece
    if (piece) {
      // Reset piece position to top center
      gameState.piecePosition = { 
        x: Math.floor(DEFAULT_CONFIG.boardWidth / 2) - 2, 
        y: 0 
      }
      gameState.pieceRotation = 0
    }
  }

  function setNextPiece(piece: Piece | null): void {
    gameState.nextPiece = piece
  }

  function updatePiecePosition(position: Position): void {
    gameState.piecePosition = { ...position }
  }

  function updatePieceRotation(rotation: number): void {
    gameState.pieceRotation = rotation
  }

  // Board management
  function updateBoard(newBoard: number[][]): void {
    gameState.board = newBoard.map(row => [...row])
  }

  function lockPieceToBoard(): void {
    if (!gameState.currentPiece) return

    const piece = gameState.currentPiece
    const position = gameState.piecePosition
    const rotation = gameState.pieceRotation
    const shape = piece.rotations[rotation]

    // Create a copy of the current board
    const newBoard = gameState.board.map(row => [...row])

    // Lock the piece to the board
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = position.x + x
          const boardY = position.y + y
          if (boardY >= 0 && boardY < DEFAULT_CONFIG.boardHeight && 
              boardX >= 0 && boardX < DEFAULT_CONFIG.boardWidth) {
            newBoard[boardY][boardX] = 1
          }
        }
      }
    }

    updateBoard(newBoard)
  }

  // Scoring and level management
  function updateScore(linesCleared: number): void {
    if (linesCleared > 0 && linesCleared <= 4) {
      const points = DEFAULT_CONFIG.pointsPerLine[linesCleared - 1] * gameState.level
      gameState.score += points
      gameState.linesCleared += linesCleared
      
      // Check for level up
      const newLevel = Math.floor(gameState.linesCleared / DEFAULT_CONFIG.linesPerLevel) + 1
      if (newLevel > gameState.level) {
        gameState.level = newLevel
        gameState.fallInterval = Math.max(50, 
          DEFAULT_CONFIG.initialFallInterval * Math.pow(DEFAULT_CONFIG.levelSpeedMultiplier, newLevel - 1)
        )
      }
    }
  }

  function clearLines(lineIndices: number[]): LinesClearedResult {
    if (lineIndices.length === 0) {
      return { lines: [], count: 0, points: 0 }
    }

    // Create new board without the cleared lines
    const newBoard = gameState.board.filter((_, index) => !lineIndices.includes(index))
    
    // Add empty lines at the top
    const emptyLines = Array(lineIndices.length)
      .fill(null)
      .map(() => Array(DEFAULT_CONFIG.boardWidth).fill(0))
    
    const finalBoard = [...emptyLines, ...newBoard]
    updateBoard(finalBoard)

    // Calculate points
    const points = lineIndices.length <= 4 ? 
      DEFAULT_CONFIG.pointsPerLine[lineIndices.length - 1] * gameState.level : 0

    updateScore(lineIndices.length)

    return {
      lines: [...lineIndices],
      count: lineIndices.length,
      points
    }
  }

  // Timer management
  function updateFallTimer(deltaTime: number): void {
    gameState.fallTimer += deltaTime
  }

  function resetFallTimer(): void {
    gameState.fallTimer = 0
  }

  function updateLastUpdateTime(time: number): void {
    gameState.lastUpdateTime = time
  }

  // Return readonly state and management functions
  return {
    // Readonly state
    gameState: readonly(gameState),
    gameStats,
    isGameActive,
    isGamePaused,
    isGameOver,
    currentFallSpeed,
    nextLevelProgress,
    config: DEFAULT_CONFIG,

    // State management functions
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    restartGame,

    // Piece management
    setCurrentPiece,
    setNextPiece,
    updatePiecePosition,
    updatePieceRotation,

    // Board management
    updateBoard,
    lockPieceToBoard,
    clearLines,

    // Timer management
    updateFallTimer,
    resetFallTimer,
    updateLastUpdateTime,

    // Scoring
    updateScore
  }
}
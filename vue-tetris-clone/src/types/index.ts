// Core game types and interfaces

export interface Position {
  x: number
  y: number
}

export interface Piece {
  id: string
  shape: number[][]  // 4x4 matrix with 1s for filled cells
  color: string
  size: number      // actual number of filled cells (4-7)
  rotations: number[][][] // pre-calculated rotation states
  boundingBox: {
    width: number
    height: number
  }
}

export interface GameState {
  board: number[][]
  currentPiece: Piece | null
  nextPiece: Piece | null
  piecePosition: Position
  pieceRotation: number
  score: number
  level: number
  linesCleared: number
  gameStatus: GameStatus
  fallTimer: number
  fallInterval: number
  isGameRunning: boolean
  lastUpdateTime: number
}

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameOver'

export type Direction = 'left' | 'right' | 'down'

export type RotationDirection = 'clockwise' | 'counterclockwise'

export interface Board {
  grid: number[][]
  width: number
  height: number
}

export interface GameConfig {
  boardWidth: number
  boardHeight: number
  initialFallInterval: number
  levelSpeedMultiplier: number
  colors: string[]
  pointsPerLine: number[]
  linesPerLevel: number
}

export interface PieceGenerationConfig {
  minSize: number // 4
  maxSize: number // 7
  gridSize: number // 4 (4x4 constraint)
  maxAttempts: number // for generation algorithm
}

export interface CollisionResult {
  hasCollision: boolean
  type: 'boundary' | 'piece' | 'none'
  position?: Position
}

export interface LinesClearedResult {
  lines: number[]
  count: number
  points: number
}

export interface GameStats {
  totalLinesCleared: number
  totalPiecesPlaced: number
  currentLevel: number
  currentScore: number
  gameTime: number
}

// Event types for game actions
export type GameAction = 
  | { type: 'MOVE_PIECE'; direction: Direction }
  | { type: 'ROTATE_PIECE'; direction: RotationDirection }
  | { type: 'DROP_PIECE' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'RESTART_GAME' }

// Utility types
export type CellState = 0 | 1 // 0 = empty, 1 = filled
export type Grid = CellState[][]
export type ColorPalette = readonly string[]
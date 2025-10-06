import { PieceGenerator } from './PieceGenerator'
import { CollisionDetection } from './CollisionDetection'
import type { 
  Piece, 
  Position, 
  Direction, 
  RotationDirection, 
  LinesClearedResult 
} from '@/types'

export class GameEngine {
  /**
   * Move a piece in the specified direction if possible
   */
  static movePiece(
    piece: Piece,
    currentPosition: Position,
    direction: Direction,
    rotation: number,
    board: number[][]
  ): Position | null {
    if (!CollisionDetection.canMovePiece(piece, currentPosition, direction, rotation, board)) {
      return null
    }

    const newPosition = { ...currentPosition }
    switch (direction) {
      case 'left':
        newPosition.x -= 1
        break
      case 'right':
        newPosition.x += 1
        break
      case 'down':
        newPosition.y += 1
        break
    }

    return newPosition
  }

  /**
   * Rotate a piece if possible, with wall kick support
   */
  static rotatePiece(
    piece: Piece,
    currentPosition: Position,
    currentRotation: number,
    direction: RotationDirection,
    board: number[][]
  ): { position: Position; rotation: number } | null {
    const newRotation = direction === 'clockwise' 
      ? (currentRotation + 1) % 4 
      : (currentRotation + 3) % 4

    return CollisionDetection.getValidRotation(piece, currentPosition, newRotation, board)
  }

  /**
   * Perform a hard drop (instant drop to bottom)
   */
  static hardDropPiece(
    piece: Piece,
    currentPosition: Position,
    rotation: number,
    board: number[][]
  ): Position {
    return CollisionDetection.getHardDropPosition(piece, currentPosition, rotation, board)
  }

  /**
   * Check if a piece should be locked (can't move down anymore)
   */
  static shouldLockPiece(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][]
  ): boolean {
    return !CollisionDetection.canMovePiece(piece, position, 'down', rotation, board)
  }

  /**
   * Lock a piece to the board
   */
  static lockPieceToBoard(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][]
  ): number[][] {
    const newBoard = board.map(row => [...row])
    const shape = piece.rotations[rotation]

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = position.x + x
          const boardY = position.y + y

          if (boardY >= 0 && boardY < newBoard.length && 
              boardX >= 0 && boardX < newBoard[0].length) {
            newBoard[boardY][boardX] = 1
          }
        }
      }
    }

    return newBoard
  }

  /**
   * Check for completed lines on the board
   */
  static checkCompletedLines(board: number[][]): number[] {
    const completedLines: number[] = []

    for (let y = 0; y < board.length; y++) {
      if (board[y].every(cell => cell === 1)) {
        completedLines.push(y)
      }
    }

    return completedLines
  }

  /**
   * Clear completed lines from the board
   */
  static clearLines(board: number[][], lineIndices: number[]): number[][] {
    if (lineIndices.length === 0) {
      return board
    }

    // Remove completed lines
    const newBoard = board.filter((_, index) => !lineIndices.includes(index))
    
    // Add empty lines at the top
    const emptyLines = Array(lineIndices.length)
      .fill(null)
      .map(() => Array(board[0].length).fill(0))
    
    return [...emptyLines, ...newBoard]
  }

  /**
   * Calculate score for cleared lines
   */
  static calculateLineScore(linesCleared: number, level: number): number {
    const basePoints = [0, 100, 300, 500, 800] // Points for 0, 1, 2, 3, 4 lines
    const points = linesCleared <= 4 ? basePoints[linesCleared] : 800
    return points * level
  }

  /**
   * Check if the game should end
   */
  static checkGameOver(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][]
  ): boolean {
    return CollisionDetection.wouldCauseGameOver(piece, position, rotation, board)
  }

  /**
   * Generate a new random piece
   */
  static generateNewPiece(): Piece {
    return PieceGenerator.generateRandomPiece()
  }

  /**
   * Get the spawn position for a new piece
   */
  static getSpawnPosition(boardWidth: number): Position {
    return {
      x: Math.floor(boardWidth / 2) - 2,
      y: 0
    }
  }

  /**
   * Process a complete game tick
   */
  static processTick(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][],
    forceDown: boolean = false
  ): {
    newPosition: Position;
    shouldLock: boolean;
    gameOver: boolean;
  } {
    let newPosition = position
    let shouldLock = false
    let gameOver = false

    // Try to move piece down
    if (forceDown || this.shouldLockPiece(piece, position, rotation, board)) {
      const downPosition = this.movePiece(piece, position, 'down', rotation, board)
      
      if (downPosition) {
        newPosition = downPosition
      } else {
        // Can't move down, should lock
        shouldLock = true
        
        // Check if this causes game over
        if (position.y <= 1) {
          gameOver = this.checkGameOver(piece, position, rotation, board)
        }
      }
    }

    return { newPosition, shouldLock, gameOver }
  }

  /**
   * Process line clearing and return results
   */
  static processLineClear(board: number[][], level: number): {
    newBoard: number[][];
    linesCleared: number;
    score: number;
    completedLines: number[];
  } {
    const completedLines = this.checkCompletedLines(board)
    const newBoard = this.clearLines(board, completedLines)
    const linesCleared = completedLines.length
    const score = this.calculateLineScore(linesCleared, level)

    return {
      newBoard,
      linesCleared,
      score,
      completedLines
    }
  }

  /**
   * Calculate new level based on total lines cleared
   */
  static calculateLevel(totalLinesCleared: number, linesPerLevel: number = 10): number {
    return Math.floor(totalLinesCleared / linesPerLevel) + 1
  }

  /**
   * Calculate fall interval based on level
   */
  static calculateFallInterval(level: number, baseInterval: number = 1000): number {
    const speedMultiplier = 0.9 // 10% faster each level
    return Math.max(50, baseInterval * Math.pow(speedMultiplier, level - 1))
  }

  /**
   * Validate piece placement (for debugging/testing)
   */
  static isValidPlacement(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][]
  ): boolean {
    const collision = CollisionDetection.checkCollision(piece, position, rotation, board)
    return !collision.hasCollision
  }

  /**
   * Get ghost piece position (preview of where piece will land)
   */
  static getGhostPiecePosition(
    piece: Piece,
    position: Position,
    rotation: number,
    board: number[][]
  ): Position {
    return this.hardDropPiece(piece, position, rotation, board)
  }

  /**
   * Check if a position is within board bounds
   */
  static isWithinBounds(position: Position, boardWidth: number, boardHeight: number): boolean {
    return position.x >= 0 && position.x < boardWidth && 
           position.y >= 0 && position.y < boardHeight
  }

  /**
   * Get all occupied cells on the board
   */
  static getOccupiedCells(board: number[][]): Position[] {
    const occupiedCells: Position[] = []
    
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === 1) {
          occupiedCells.push({ x, y })
        }
      }
    }

    return occupiedCells
  }
}
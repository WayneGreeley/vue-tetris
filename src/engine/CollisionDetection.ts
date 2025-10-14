import type { Piece, Position, CollisionResult, Board } from '@/types'

export class CollisionDetection {
  /**
   * Check if a piece at a given position and rotation collides with the board or boundaries
   */
  static checkCollision(
    piece: Piece, 
    position: Position, 
    rotation: number, 
    board: number[][]
  ): CollisionResult {
    const shape = piece.rotations[rotation]
    
    // Check boundary collisions first
    const boundaryCollision = this.checkBoundaryCollision(shape, position, board[0].length, board.length)
    if (boundaryCollision.hasCollision) {
      return boundaryCollision
    }

    // Check piece-to-piece collisions
    const pieceCollision = this.checkPieceCollision(shape, position, board)
    if (pieceCollision.hasCollision) {
      return pieceCollision
    }

    return { hasCollision: false, type: 'none' }
  }

  /**
   * Check if a piece collides with board boundaries
   */
  static checkBoundaryCollision(
    shape: number[][], 
    position: Position, 
    boardWidth: number, 
    boardHeight: number
  ): CollisionResult {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = position.x + x
          const boardY = position.y + y

          // Check left and right boundaries
          if (boardX < 0 || boardX >= boardWidth) {
            return {
              hasCollision: true,
              type: 'boundary',
              position: { x: boardX, y: boardY }
            }
          }

          // Check bottom boundary
          if (boardY >= boardHeight) {
            return {
              hasCollision: true,
              type: 'boundary',
              position: { x: boardX, y: boardY }
            }
          }

          // Top boundary is allowed (pieces spawn above the board)
        }
      }
    }

    return { hasCollision: false, type: 'none' }
  }

  /**
   * Check if a piece collides with existing pieces on the board
   */
  static checkPieceCollision(
    shape: number[][], 
    position: Position, 
    board: number[][]
  ): CollisionResult {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = position.x + x
          const boardY = position.y + y

          // Only check positions that are within the board
          if (boardY >= 0 && boardY < board.length && 
              boardX >= 0 && boardX < board[0].length) {
            if (board[boardY][boardX] === 1) {
              return {
                hasCollision: true,
                type: 'piece',
                position: { x: boardX, y: boardY }
              }
            }
          }
        }
      }
    }

    return { hasCollision: false, type: 'none' }
  }

  /**
   * Check if a piece can move in a specific direction
   */
  static canMovePiece(
    piece: Piece, 
    currentPosition: Position, 
    direction: 'left' | 'right' | 'down', 
    rotation: number, 
    board: number[][]
  ): boolean {
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

    const collision = this.checkCollision(piece, newPosition, rotation, board)
    return !collision.hasCollision
  }

  /**
   * Check if a piece can rotate at its current position
   */
  static canRotatePiece(
    piece: Piece, 
    position: Position, 
    newRotation: number, 
    board: number[][]
  ): boolean {
    const collision = this.checkCollision(piece, position, newRotation, board)
    return !collision.hasCollision
  }

  /**
   * Get a valid rotation with wall kicks if needed
   */
  static getValidRotation(
    piece: Piece, 
    position: Position, 
    newRotation: number, 
    board: number[][]
  ): { position: Position; rotation: number } | null {
    // First try the rotation at the current position
    if (this.canRotatePiece(piece, position, newRotation, board)) {
      return { position, rotation: newRotation }
    }

    // Try wall kicks - standard Tetris wall kick offsets
    const wallKickOffsets = this.getWallKickOffsets(piece, position, newRotation)

    for (const offset of wallKickOffsets) {
      const testPosition = {
        x: position.x + offset.x,
        y: position.y + offset.y
      }

      if (this.canRotatePiece(piece, testPosition, newRotation, board)) {
        return { position: testPosition, rotation: newRotation }
      }
    }

    return null
  }

  /**
   * Get wall kick offsets for rotation attempts
   */
  private static getWallKickOffsets(
    piece: Piece, 
    position: Position, 
    newRotation: number
  ): Position[] {
    // Standard wall kick offsets adapted for random pieces
    // These are the most common positions to try when a rotation fails
    return [
      { x: -1, y: 0 },  // Try moving left
      { x: 1, y: 0 },   // Try moving right
      { x: 0, y: -1 },  // Try moving up
      { x: -2, y: 0 },  // Try moving further left
      { x: 2, y: 0 },   // Try moving further right
      { x: -1, y: -1 }, // Try diagonal up-left
      { x: 1, y: -1 },  // Try diagonal up-right
      { x: 0, y: 1 }    // Try moving down (last resort)
    ]
  }

  /**
   * Check if a piece position is completely above the board (for game over detection)
   */
  static isPieceAboveBoard(
    piece: Piece, 
    position: Position, 
    rotation: number
  ): boolean {
    const shape = piece.rotations[rotation]

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardY = position.y + y
          if (boardY >= 0) {
            return false // At least one part is at or below the board top
          }
        }
      }
    }

    return true // Entire piece is above the board
  }

  /**
   * Check if placing a piece would cause game over
   */
  static wouldCauseGameOver(
    piece: Piece, 
    position: Position, 
    rotation: number, 
    board: number[][]
  ): boolean {
    const shape = piece.rotations[rotation]

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = position.x + x
          const boardY = position.y + y

          // If any part of the piece is in the top rows and would collide
          if (boardY < 2 && boardX >= 0 && boardX < board[0].length) {
            if (boardY >= 0 && board[boardY][boardX] === 1) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  /**
   * Get the lowest possible position for a piece (hard drop)
   */
  static getHardDropPosition(
    piece: Piece, 
    position: Position, 
    rotation: number, 
    board: number[][]
  ): Position {
    let dropPosition = { ...position }

    while (this.canMovePiece(piece, dropPosition, 'down', rotation, board)) {
      dropPosition.y += 1
    }

    return dropPosition
  }

  /**
   * Check if a specific cell on the board is occupied
   */
  static isCellOccupied(x: number, y: number, board: number[][]): boolean {
    if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) {
      return true // Out of bounds counts as occupied
    }
    return board[y][x] === 1
  }

  /**
   * Get all cells that would be occupied by a piece at a given position
   */
  static getPieceOccupiedCells(
    piece: Piece, 
    position: Position, 
    rotation: number
  ): Position[] {
    const occupiedCells: Position[] = []
    const shape = piece.rotations[rotation]

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          occupiedCells.push({
            x: position.x + x,
            y: position.y + y
          })
        }
      }
    }

    return occupiedCells
  }
}
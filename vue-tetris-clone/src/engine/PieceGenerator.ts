import type { Piece, PieceGenerationConfig, Position } from '@/types'

// Configuration for piece generation
const GENERATION_CONFIG: PieceGenerationConfig = {
  minSize: 4,
  maxSize: 7,
  gridSize: 4,
  maxAttempts: 100
}

// Color palette for pieces
const PIECE_COLORS = [
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
]

export class PieceGenerator {
  private static idCounter = 0

  /**
   * Generate a random piece with 4-7 connected squares fitting in a 4x4 box
   */
  static generateRandomPiece(): Piece {
    let attempts = 0
    let piece: Piece | null = null

    while (attempts < GENERATION_CONFIG.maxAttempts && !piece) {
      piece = this.attemptPieceGeneration()
      attempts++
    }

    if (!piece) {
      // Fallback to a simple 4-square piece if generation fails
      piece = this.createFallbackPiece()
    }

    return piece
  }

  /**
   * Attempt to generate a valid piece
   */
  private static attemptPieceGeneration(): Piece | null {
    const targetSize = Math.floor(Math.random() * (GENERATION_CONFIG.maxSize - GENERATION_CONFIG.minSize + 1)) + GENERATION_CONFIG.minSize
    const grid = this.createEmptyGrid()
    
    // Start with a random seed position
    const seedPosition = this.getRandomPosition()
    grid[seedPosition.y][seedPosition.x] = 1
    const filledCells: Position[] = [seedPosition]

    // Grow the piece by adding connected cells
    while (filledCells.length < targetSize) {
      const availableNeighbors = this.getAllAvailableNeighbors(filledCells, grid)
      
      if (availableNeighbors.length === 0) {
        // Can't grow anymore, check if we have a valid piece
        break
      }

      // Randomly select a neighbor to fill
      const randomNeighbor = availableNeighbors[Math.floor(Math.random() * availableNeighbors.length)]
      grid[randomNeighbor.y][randomNeighbor.x] = 1
      filledCells.push(randomNeighbor)
    }

    // Validate the piece
    if (filledCells.length >= GENERATION_CONFIG.minSize && this.isConnected(filledCells)) {
      return this.createPieceFromGrid(grid, filledCells.length)
    }

    return null
  }

  /**
   * Create an empty 4x4 grid
   */
  private static createEmptyGrid(): number[][] {
    return Array(GENERATION_CONFIG.gridSize).fill(null).map(() => 
      Array(GENERATION_CONFIG.gridSize).fill(0)
    )
  }

  /**
   * Get a random position within the 4x4 grid
   */
  private static getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * GENERATION_CONFIG.gridSize),
      y: Math.floor(Math.random() * GENERATION_CONFIG.gridSize)
    }
  }

  /**
   * Get all available neighbors for the current filled cells
   */
  private static getAllAvailableNeighbors(filledCells: Position[], grid: number[][]): Position[] {
    const neighbors: Position[] = []
    const neighborSet = new Set<string>()

    for (const cell of filledCells) {
      const cellNeighbors = this.getEmptyNeighbors(cell, grid)
      for (const neighbor of cellNeighbors) {
        const key = `${neighbor.x},${neighbor.y}`
        if (!neighborSet.has(key)) {
          neighborSet.add(key)
          neighbors.push(neighbor)
        }
      }
    }

    return neighbors
  }

  /**
   * Get empty neighbors for a specific cell
   */
  private static getEmptyNeighbors(position: Position, grid: number[][]): Position[] {
    const neighbors: Position[] = []
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ]

    for (const dir of directions) {
      const newX = position.x + dir.x
      const newY = position.y + dir.y

      if (this.isValidPosition(newX, newY) && grid[newY][newX] === 0) {
        neighbors.push({ x: newX, y: newY })
      }
    }

    return neighbors
  }

  /**
   * Check if a position is valid within the 4x4 grid
   */
  private static isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < GENERATION_CONFIG.gridSize && y >= 0 && y < GENERATION_CONFIG.gridSize
  }

  /**
   * Verify that all filled cells are connected
   */
  private static isConnected(filledCells: Position[]): boolean {
    if (filledCells.length === 0) return false
    if (filledCells.length === 1) return true

    // Use flood fill to check connectivity
    const visited = new Set<string>()
    const queue: Position[] = [filledCells[0]]
    visited.add(`${filledCells[0].x},${filledCells[0].y}`)

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = this.getAdjacentPositions(current)

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`
        if (!visited.has(key) && this.isPositionInList(neighbor, filledCells)) {
          visited.add(key)
          queue.push(neighbor)
        }
      }
    }

    return visited.size === filledCells.length
  }

  /**
   * Get adjacent positions (4-directional)
   */
  private static getAdjacentPositions(position: Position): Position[] {
    return [
      { x: position.x, y: position.y - 1 },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y + 1 },
      { x: position.x - 1, y: position.y }
    ]
  }

  /**
   * Check if a position exists in a list of positions
   */
  private static isPositionInList(position: Position, list: Position[]): boolean {
    return list.some(p => p.x === position.x && p.y === position.y)
  }

  /**
   * Create a Piece object from a grid
   */
  private static createPieceFromGrid(grid: number[][], size: number): Piece {
    const rotations = this.generateAllRotations(grid)
    const boundingBox = this.calculateBoundingBox(grid)
    
    return {
      id: `piece-${++this.idCounter}`,
      shape: grid,
      color: this.getRandomColor(),
      size,
      rotations,
      boundingBox
    }
  }

  /**
   * Generate all 4 rotation states for a piece
   */
  private static generateAllRotations(grid: number[][]): number[][][] {
    const rotations: number[][][] = []
    let currentGrid = grid

    for (let i = 0; i < 4; i++) {
      rotations.push(currentGrid.map(row => [...row]))
      currentGrid = this.rotateGrid90Clockwise(currentGrid)
    }

    return rotations
  }

  /**
   * Rotate a grid 90 degrees clockwise
   */
  private static rotateGrid90Clockwise(grid: number[][]): number[][] {
    const size = grid.length
    const rotated: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        rotated[x][size - 1 - y] = grid[y][x]
      }
    }

    return rotated
  }

  /**
   * Calculate the bounding box of a piece
   */
  private static calculateBoundingBox(grid: number[][]): { width: number; height: number } {
    let minX = GENERATION_CONFIG.gridSize, maxX = -1
    let minY = GENERATION_CONFIG.gridSize, maxY = -1

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 1) {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        }
      }
    }

    return {
      width: maxX - minX + 1,
      height: maxY - minY + 1
    }
  }

  /**
   * Get a random color from the palette
   */
  private static getRandomColor(): string {
    return PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)]
  }

  /**
   * Create a fallback piece if generation fails
   */
  private static createFallbackPiece(): Piece {
    // Simple 4-square L-shape as fallback
    const grid = [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0]
    ]

    return this.createPieceFromGrid(grid, 4)
  }

  /**
   * Validate that a piece meets all requirements
   */
  static validatePiece(piece: Piece): boolean {
    // Check size constraints
    if (piece.size < GENERATION_CONFIG.minSize || piece.size > GENERATION_CONFIG.maxSize) {
      return false
    }

    // Check that the piece fits in 4x4
    if (piece.shape.length !== GENERATION_CONFIG.gridSize || 
        piece.shape.some(row => row.length !== GENERATION_CONFIG.gridSize)) {
      return false
    }

    // Count filled cells
    const filledCount = piece.shape.flat().filter(cell => cell === 1).length
    if (filledCount !== piece.size) {
      return false
    }

    // Check connectivity
    const filledCells: Position[] = []
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] === 1) {
          filledCells.push({ x, y })
        }
      }
    }

    return this.isConnected(filledCells)
  }
}
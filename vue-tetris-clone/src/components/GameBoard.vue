<template>
  <div class="game-board">
    <div 
      class="board-grid"
      :style="{ 
        gridTemplateColumns: `repeat(${boardWidth}, 1fr)`,
        gridTemplateRows: `repeat(${boardHeight}, 1fr)`
      }"
    >
      <div
        v-for="(cell, index) in boardCells"
        :key="index"
        class="board-cell"
        :class="{
          'filled': cell.filled,
          'current-piece': cell.isCurrentPiece,
          'ghost-piece': cell.isGhost
        }"
        :style="{ backgroundColor: cell.color }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Piece, Position } from '@/types'

interface Props {
  board: number[][]
  currentPiece?: Piece | null
  piecePosition?: Position
  pieceRotation?: number
  showGhost?: boolean
  ghostPosition?: Position
}

const props = withDefaults(defineProps<Props>(), {
  currentPiece: null,
  piecePosition: () => ({ x: 0, y: 0 }),
  pieceRotation: 0,
  showGhost: false,
  ghostPosition: () => ({ x: 0, y: 0 })
})

const boardWidth = computed(() => props.board[0]?.length || 10)
const boardHeight = computed(() => props.board.length || 20)

interface BoardCell {
  filled: boolean
  isCurrentPiece: boolean
  isGhost: boolean
  color: string
}

const boardCells = computed<BoardCell[]>(() => {
  const cells: BoardCell[] = []
  
  // Create a map of current piece positions
  const currentPiecePositions = new Set<string>()
  const ghostPiecePositions = new Set<string>()
  
  if (props.currentPiece && props.piecePosition) {
    if (!props.currentPiece.rotations || !props.currentPiece.rotations[props.pieceRotation]) {
      console.error('Invalid piece rotations:', props.currentPiece.rotations)
      return Array(boardWidth.value * boardHeight.value).fill({
        filled: false,
        isCurrentPiece: false,
        isGhost: false,
        color: ''
      })
    }
    
    const shape = props.currentPiece.rotations[props.pieceRotation]
    
    // Add current piece positions
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] === 1) {
          const boardX = props.piecePosition.x + x
          const boardY = props.piecePosition.y + y
          if (boardX >= 0 && boardX < boardWidth.value && 
              boardY >= 0 && boardY < boardHeight.value) {
            currentPiecePositions.add(`${boardX},${boardY}`)
          }
        }
      }
    }
    
    // Add ghost piece positions if enabled
    if (props.showGhost && props.ghostPosition) {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] === 1) {
            const boardX = props.ghostPosition.x + x
            const boardY = props.ghostPosition.y + y
            if (boardX >= 0 && boardX < boardWidth.value && 
                boardY >= 0 && boardY < boardHeight.value) {
              // Only show ghost if it's not overlapping with current piece
              if (!currentPiecePositions.has(`${boardX},${boardY}`)) {
                ghostPiecePositions.add(`${boardX},${boardY}`)
              }
            }
          }
        }
      }
    }
  }
  
  // Generate cells for the entire board
  for (let y = 0; y < boardHeight.value; y++) {
    for (let x = 0; x < boardWidth.value; x++) {
      const positionKey = `${x},${y}`
      const isCurrentPiece = currentPiecePositions.has(positionKey)
      const isGhost = ghostPiecePositions.has(positionKey)
      const isFilled = props.board[y]?.[x] === 1
      
      let color = ''
      if (isCurrentPiece && props.currentPiece) {
        color = props.currentPiece.color
      } else if (isFilled) {
        color = '#666666' // Default color for locked pieces
      } else if (isGhost && props.currentPiece) {
        color = props.currentPiece.color
      }
      
      cells.push({
        filled: isFilled || isCurrentPiece,
        isCurrentPiece,
        isGhost,
        color
      })
    }
  }
  
  return cells
})
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.board-grid {
  display: grid;
  gap: 1px;
  background-color: #333;
  border: 2px solid #555;
  padding: 1px;
  aspect-ratio: 1/2;
  width: 300px;
  max-width: 90vw;
}

.board-cell {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  transition: all 0.1s ease;
  min-height: 0;
  aspect-ratio: 1;
}

.board-cell.filled {
  border-color: #444;
  box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.1),
              inset -2px -2px 4px rgba(0, 0, 0, 0.3);
}

.board-cell.current-piece {
  border-color: #666;
  box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.2),
              inset -2px -2px 4px rgba(0, 0, 0, 0.4);
  animation: pulse 1s ease-in-out infinite alternate;
}

.board-cell.ghost-piece {
  opacity: 0.3;
  border-style: dashed;
  border-width: 1px;
  animation: none;
}

@keyframes pulse {
  from {
    box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.2),
                inset -2px -2px 4px rgba(0, 0, 0, 0.4);
  }
  to {
    box-shadow: inset 2px 2px 6px rgba(255, 255, 255, 0.3),
                inset -2px -2px 6px rgba(0, 0, 0, 0.5);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .board-grid {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .board-grid {
    width: 200px;
  }
  
  .game-board {
    padding: 0.5rem;
  }
}
</style>
<template>
  <div class="app">
    <header class="app-header">
      <h1 class="game-title">Vue Tetris Clone</h1>
      <p class="game-subtitle">With Random Generated Pieces</p>
    </header>

    <main class="game-container">
      <div class="game-area">
        <GameBoard
          :board="gameState.board"
          :current-piece="gameState.currentPiece"
          :piece-position="gameState.piecePosition"
          :piece-rotation="gameState.pieceRotation"
          :show-ghost="true"
          :ghost-position="ghostPosition"
        />
      </div>

      <aside class="game-sidebar">
        <GameUI
          :score="gameState.score"
          :level="gameState.level"
          :lines-cleared="gameState.linesCleared"
          :next-piece="gameState.nextPiece"
          :game-status="gameState.gameStatus"
          @restart="handleRestart"
        />
      </aside>
    </main>

    <footer class="app-footer">
      <p>Use arrow keys to move and rotate pieces. Space for hard drop, P to pause.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { GameBoard, GameUI } from './components'
import { useGameControls } from './composables/useGameControls'
import { GameEngine } from './engine'

// Initialize game controls and state
const gameControls = useGameControls()
const { gameState, lockCurrentPiece, handlePause } = gameControls

// Game loop variables
let gameLoopId: number | null = null
let lastTime = 0

// Computed properties
const ghostPosition = computed(() => {
  if (!gameState.currentPiece) return { x: 0, y: 0 }
  
  return GameEngine.getGhostPiecePosition(
    gameState.currentPiece,
    gameState.piecePosition,
    gameState.pieceRotation,
    gameState.board
  )
})

// Game loop
const gameLoop = (currentTime: number) => {
  const deltaTime = currentTime - lastTime
  lastTime = currentTime

  if (gameState.gameStatus === 'playing' && gameState.currentPiece) {
    // Update fall timer
    gameControls.updateFallTimer(deltaTime)

    // Check if piece should fall
    if (gameState.fallTimer >= gameState.fallInterval) {
      const tickResult = GameEngine.processTick(
        gameState.currentPiece,
        gameState.piecePosition,
        gameState.pieceRotation,
        gameState.board,
        true // Force down movement
      )

      if (tickResult.shouldLock) {
        lockCurrentPiece()
      } else {
        gameControls.updatePiecePosition(tickResult.newPosition)
      }

      if (tickResult.gameOver) {
        gameControls.endGame()
      }

      gameControls.resetFallTimer()
    }
  }

  gameLoopId = requestAnimationFrame(gameLoop)
}

// Initialize game
const initializeGame = () => {
  gameControls.initializeGame()
  
  // Generate initial pieces
  const firstPiece = GameEngine.generateNewPiece()
  const nextPiece = GameEngine.generateNewPiece()
  
  gameControls.setCurrentPiece(firstPiece)
  gameControls.setNextPiece(nextPiece)
}

// Handle restart
const handleRestart = () => {
  initializeGame()
  gameControls.startGame()
}

// Handle space key for starting game
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.code === 'Space' && gameState.gameStatus === 'ready') {
    event.preventDefault()
    gameControls.startGame()
  }
}

// Lifecycle
onMounted(() => {
  initializeGame()
  gameLoopId = requestAnimationFrame(gameLoop)
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #444;
}

.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #4ECDC4, #45B7D1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.game-subtitle {
  font-size: 1rem;
  color: #aaa;
  margin: 0.5rem 0 0 0;
  font-style: italic;
}

.game-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.game-area {
  flex-shrink: 0;
}

.game-sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-footer {
  text-align: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-top: 2px solid #444;
  color: #aaa;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 1024px) {
  .game-container {
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .game-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .game-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.8rem;
  }
  
  .game-subtitle {
    font-size: 0.9rem;
  }
  
  .app-footer {
    font-size: 0.8rem;
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.75rem;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .game-subtitle {
    font-size: 0.8rem;
  }
  
  .game-container {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  
  .app-footer {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
}

/* Focus and accessibility */
.app:focus-within {
  outline: none;
}

/* Prevent text selection during gameplay */
.game-container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
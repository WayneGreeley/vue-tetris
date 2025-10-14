<template>
  <div class="game-ui">
    <div class="ui-section">
      <ScoreDisplay 
        :score="score"
        :level="level"
        :lines-cleared="linesCleared"
      />
    </div>
    
    <div class="ui-section">
      <NextPiecePreview :next-piece="nextPiece" />
    </div>
    
    <div class="ui-section">
      <div class="game-controls">
        <h3 class="controls-title">Controls</h3>
        <div class="control-item">
          <span class="key">←→</span>
          <span class="action">Move</span>
        </div>
        <div class="control-item">
          <span class="key">↑</span>
          <span class="action">Rotate</span>
        </div>
        <div class="control-item">
          <span class="key">↓</span>
          <span class="action">Soft Drop</span>
        </div>
        <div class="control-item">
          <span class="key">Space</span>
          <span class="action">Hard Drop</span>
        </div>
        <div class="control-item">
          <span class="key">P</span>
          <span class="action">Pause</span>
        </div>
      </div>
    </div>
    
    <div v-if="gameStatus !== 'playing'" class="ui-section">
      <div class="game-status">
        <div class="status-message">
          <span v-if="gameStatus === 'ready'">Press Space to Start</span>
          <span v-else-if="gameStatus === 'paused'">Game Paused</span>
          <span v-else-if="gameStatus === 'gameOver'">Game Over</span>
        </div>
        <button 
          v-if="gameStatus === 'gameOver'"
          class="restart-button"
          @click="$emit('restart')"
        >
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ScoreDisplay from './ScoreDisplay.vue'
import NextPiecePreview from './NextPiecePreview.vue'
import type { Piece, GameStatus } from '@/types'

interface Props {
  score: number
  level: number
  linesCleared: number
  nextPiece: Piece | null
  gameStatus: GameStatus
}

defineProps<Props>()

defineEmits<{
  restart: []
}>()
</script>

<style scoped>
.game-ui {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-width: 200px;
}

.ui-section {
  flex-shrink: 0;
}

.game-controls {
  background-color: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1rem;
}

.controls-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.75rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

.control-item:last-child {
  margin-bottom: 0;
}

.key {
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  border: 1px solid #555;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 2rem;
  text-align: center;
}

.action {
  color: #ccc;
  font-size: 0.8rem;
}

.game-status {
  background-color: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.status-message {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.restart-button {
  background-color: #4ECDC4;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.restart-button:hover {
  background-color: #45B7D1;
}

.restart-button:active {
  background-color: #3a9bc1;
}

/* Responsive design */
@media (max-width: 768px) {
  .game-ui {
    min-width: 150px;
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .game-controls {
    padding: 0.75rem;
  }
  
  .controls-title {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .control-item {
    margin-bottom: 0.4rem;
  }
  
  .key {
    font-size: 0.7rem;
    padding: 0.15rem 0.3rem;
    min-width: 1.5rem;
  }
  
  .action {
    font-size: 0.7rem;
  }
  
  .game-status {
    padding: 0.75rem;
  }
  
  .status-message {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .restart-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .game-ui {
    min-width: 120px;
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .game-controls {
    padding: 0.5rem;
  }
  
  .controls-title {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  .control-item {
    margin-bottom: 0.3rem;
  }
  
  .key {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
    min-width: 1.2rem;
  }
  
  .action {
    font-size: 0.6rem;
  }
  
  .game-status {
    padding: 0.5rem;
  }
  
  .status-message {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
  }
  
  .restart-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }
}
</style>
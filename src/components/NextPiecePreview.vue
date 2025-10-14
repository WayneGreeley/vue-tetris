<template>
  <div class="next-piece-preview">
    <h3 class="preview-title">Next</h3>
    <div class="preview-container">
      <div 
        v-if="nextPiece"
        class="preview-grid"
        :style="{ 
          gridTemplateColumns: `repeat(4, 1fr)`,
          gridTemplateRows: `repeat(4, 1fr)`
        }"
      >
        <div
          v-for="(cell, index) in previewCells"
          :key="index"
          class="preview-cell"
          :class="{ 'filled': cell.filled }"
          :style="{ backgroundColor: cell.color }"
        />
      </div>
      <div v-else class="preview-empty">
        <div class="empty-message">No piece</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Piece } from '@/types'

interface Props {
  nextPiece: Piece | null
}

const props = defineProps<Props>()

interface PreviewCell {
  filled: boolean
  color: string
}

const previewCells = computed<PreviewCell[]>(() => {
  const cells: PreviewCell[] = []
  
  if (!props.nextPiece) {
    // Return empty 4x4 grid
    return Array(16).fill({ filled: false, color: '' })
  }
  
  const shape = props.nextPiece.shape // Use the base shape (rotation 0)
  
  // Create 4x4 grid
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const isFilled = shape[y]?.[x] === 1
      cells.push({
        filled: isFilled,
        color: isFilled ? props.nextPiece.color : ''
      })
    }
  }
  
  return cells
})
</script>

<style scoped>
.next-piece-preview {
  background-color: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1rem;
  min-width: 120px;
}

.preview-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.preview-grid {
  display: grid;
  gap: 1px;
  background-color: #333;
  padding: 2px;
  border-radius: 4px;
  width: 80px;
  height: 80px;
}

.preview-cell {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 1px;
  transition: all 0.2s ease;
}

.preview-cell.filled {
  border-color: #555;
  box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.1),
              inset -1px -1px 2px rgba(0, 0, 0, 0.3);
}

.preview-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background-color: #1a1a1a;
  border: 2px dashed #444;
  border-radius: 4px;
}

.empty-message {
  color: #666;
  font-size: 0.8rem;
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .next-piece-preview {
    min-width: 100px;
    padding: 0.75rem;
  }
  
  .preview-grid {
    width: 60px;
    height: 60px;
  }
  
  .preview-empty {
    width: 60px;
    height: 60px;
  }
  
  .preview-title {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .next-piece-preview {
    min-width: 80px;
    padding: 0.5rem;
  }
  
  .preview-grid {
    width: 50px;
    height: 50px;
  }
  
  .preview-empty {
    width: 50px;
    height: 50px;
  }
  
  .preview-title {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
}
</style>
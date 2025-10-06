<template>
  <div class="score-display">
    <div class="score-item">
      <div class="score-label">Score</div>
      <div class="score-value">{{ formattedScore }}</div>
    </div>
    <div class="score-item">
      <div class="score-label">Level</div>
      <div class="score-value">{{ level }}</div>
    </div>
    <div class="score-item">
      <div class="score-label">Lines</div>
      <div class="score-value">{{ linesCleared }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number
  level: number
  linesCleared: number
}

const props = defineProps<Props>()

const formattedScore = computed(() => {
  return props.score.toLocaleString()
})
</script>

<style scoped>
.score-display {
  background-color: #2a2a2a;
  border: 2px solid #444;
  border-radius: 8px;
  padding: 1rem;
  min-width: 120px;
}

.score-item {
  margin-bottom: 0.75rem;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-label {
  color: #aaa;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.score-value {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-align: right;
  background-color: #1a1a1a;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #333;
}

/* Responsive design */
@media (max-width: 768px) {
  .score-display {
    min-width: 100px;
    padding: 0.75rem;
  }
  
  .score-item {
    margin-bottom: 0.5rem;
  }
  
  .score-label {
    font-size: 0.7rem;
  }
  
  .score-value {
    font-size: 1rem;
    padding: 0.2rem 0.4rem;
  }
}

@media (max-width: 480px) {
  .score-display {
    min-width: 80px;
    padding: 0.5rem;
  }
  
  .score-item {
    margin-bottom: 0.4rem;
  }
  
  .score-label {
    font-size: 0.6rem;
    margin-bottom: 0.2rem;
  }
  
  .score-value {
    font-size: 0.9rem;
    padding: 0.15rem 0.3rem;
  }
}
</style>
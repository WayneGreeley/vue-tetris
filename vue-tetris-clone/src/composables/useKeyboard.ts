import { ref, onMounted, onUnmounted } from 'vue'

export interface KeyboardState {
  left: boolean
  right: boolean
  down: boolean
  up: boolean
  space: boolean
  p: boolean
}

export interface KeyboardEvents {
  onLeft: () => void
  onRight: () => void
  onDown: () => void
  onUp: () => void
  onSpace: () => void
  onPause: () => void
}

export function useKeyboard(events: KeyboardEvents) {
  const keyState = ref<KeyboardState>({
    left: false,
    right: false,
    down: false,
    up: false,
    space: false,
    p: false
  })

  // Debounce settings for different keys
  const debounceTimers = ref<{ [key: string]: number }>({})
  const repeatTimers = ref<{ [key: string]: number }>({})
  
  // Key repeat intervals (in milliseconds)
  const KEY_REPEAT_DELAYS = {
    left: 150,
    right: 150,
    down: 50,
    up: 200,
    space: 300,
    p: 300
  }

  // Initial delay before key repeat starts
  const INITIAL_REPEAT_DELAY = 200

  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent default browser behavior for game keys
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyP']
    if (gameKeys.includes(event.code)) {
      event.preventDefault()
    }

    let keyPressed = false
    let action: (() => void) | null = null
    let repeatDelay = 0

    switch (event.code) {
      case 'ArrowLeft':
        if (!keyState.value.left) {
          keyState.value.left = true
          action = events.onLeft
          repeatDelay = KEY_REPEAT_DELAYS.left
          keyPressed = true
        }
        break
      case 'ArrowRight':
        if (!keyState.value.right) {
          keyState.value.right = true
          action = events.onRight
          repeatDelay = KEY_REPEAT_DELAYS.right
          keyPressed = true
        }
        break
      case 'ArrowDown':
        if (!keyState.value.down) {
          keyState.value.down = true
          action = events.onDown
          repeatDelay = KEY_REPEAT_DELAYS.down
          keyPressed = true
        }
        break
      case 'ArrowUp':
        if (!keyState.value.up) {
          keyState.value.up = true
          action = events.onUp
          repeatDelay = KEY_REPEAT_DELAYS.up
          keyPressed = true
        }
        break
      case 'Space':
        if (!keyState.value.space) {
          keyState.value.space = true
          action = events.onSpace
          repeatDelay = KEY_REPEAT_DELAYS.space
          keyPressed = true
        }
        break
      case 'KeyP':
        if (!keyState.value.p) {
          keyState.value.p = true
          action = events.onPause
          repeatDelay = KEY_REPEAT_DELAYS.p
          keyPressed = true
        }
        break
    }

    // Execute action and set up key repeat
    if (keyPressed && action) {
      action()
      
      // Set up key repeat for movement keys
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.code)) {
        setupKeyRepeat(event.code, action, repeatDelay)
      }
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
        keyState.value.left = false
        clearKeyRepeat('ArrowLeft')
        break
      case 'ArrowRight':
        keyState.value.right = false
        clearKeyRepeat('ArrowRight')
        break
      case 'ArrowDown':
        keyState.value.down = false
        clearKeyRepeat('ArrowDown')
        break
      case 'ArrowUp':
        keyState.value.up = false
        clearKeyRepeat('ArrowUp')
        break
      case 'Space':
        keyState.value.space = false
        clearKeyRepeat('Space')
        break
      case 'KeyP':
        keyState.value.p = false
        clearKeyRepeat('KeyP')
        break
    }
  }

  const setupKeyRepeat = (keyCode: string, action: () => void, repeatDelay: number) => {
    // Clear any existing repeat timer
    clearKeyRepeat(keyCode)
    
    // Set up initial delay, then repeat
    repeatTimers.value[keyCode] = window.setTimeout(() => {
      const repeatInterval = () => {
        if (isKeyPressed(keyCode)) {
          action()
          repeatTimers.value[keyCode] = window.setTimeout(repeatInterval, repeatDelay)
        }
      }
      repeatInterval()
    }, INITIAL_REPEAT_DELAY)
  }

  const clearKeyRepeat = (keyCode: string) => {
    if (repeatTimers.value[keyCode]) {
      clearTimeout(repeatTimers.value[keyCode])
      delete repeatTimers.value[keyCode]
    }
  }

  const isKeyPressed = (keyCode: string): boolean => {
    switch (keyCode) {
      case 'ArrowLeft': return keyState.value.left
      case 'ArrowRight': return keyState.value.right
      case 'ArrowDown': return keyState.value.down
      case 'ArrowUp': return keyState.value.up
      case 'Space': return keyState.value.space
      case 'KeyP': return keyState.value.p
      default: return false
    }
  }

  const clearAllTimers = () => {
    Object.values(debounceTimers.value).forEach(timer => clearTimeout(timer))
    Object.values(repeatTimers.value).forEach(timer => clearTimeout(timer))
    debounceTimers.value = {}
    repeatTimers.value = {}
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    clearAllTimers()
  })

  return {
    keyState: keyState.value,
    clearAllTimers
  }
}
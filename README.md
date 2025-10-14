# Vue Tetris Clone

A Tetris clone built with Vue.js 3 and TypeScript, featuring randomly generated pieces instead of traditional tetrominoes.

## 🎮 Play Online

**🚀 [Play Vue Tetris Clone](https://waynegreeley.github.io/vue-tetris/)**

## Features

- Vue 3 with Composition API
- TypeScript for type safety
- Randomly generated pieces (4-7 squares, fitting in 4x4 box)
- Modern build system with Vite

## Project Structure

```
src/
├── components/     # Vue components
├── composables/    # Vue composables for game logic
├── engine/         # Core game engine modules
├── types/          # TypeScript type definitions
├── App.vue         # Main application component
├── main.ts         # Application entry point
└── style.css       # Global styles
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Game Features

- Random piece generation with 4-7 connected squares
- Standard Tetris gameplay mechanics
- Score tracking and level progression
- Smooth animations and modern UI
- Keyboard controls for piece movement and rotation

## Controls

- **Arrow Keys**: Move and rotate pieces
- **Space**: Hard drop
- **P**: Pause/Resume
- **Enter**: Start game

## Current Status

✅ **All Tasks Completed!**

**Core Implementation:**
- ✅ Task 1: Project structure and core interfaces
- ✅ Task 2: Core data models and game state management
- ✅ Task 3: Random piece generation system
- ✅ Task 4: Collision detection and game physics
- ✅ Task 5: Core game mechanics
- ✅ Task 6: Vue components for game rendering
- ✅ Task 7: User input handling
- ✅ Task 8: Game engine integration
- ✅ Task 9: Visual polish and animations
- ✅ Task 10: Final integration and optimization

**Features Implemented:**
- 🎲 **Random Piece Generation**: Unique 4-7 square pieces that fit in 4x4 box
- 🎮 **Complete Tetris Gameplay**: Movement, rotation, line clearing, scoring
- 🎨 **Modern Vue 3 UI**: Responsive design with smooth animations
- ⌨️ **Full Keyboard Controls**: Arrow keys, space for hard drop, P for pause
- 📊 **Game Statistics**: Score, level progression, lines cleared
- 👁️ **Ghost Piece Preview**: Shows where piece will land
- 🔄 **Game State Management**: Start, pause, restart functionality

## Deployment

The game is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

## Requirements

- Node.js 18+ (recommended)
- Modern browser with ES2020 support
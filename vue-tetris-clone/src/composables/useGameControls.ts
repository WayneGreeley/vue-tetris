import { useKeyboard } from './useKeyboard'
import { useGameState } from './useGameState'
import { GameEngine } from '@/engine'
import type { Direction, RotationDirection } from '@/types'

export function useGameControls() {
  const gameState = useGameState()

  const handleMoveLeft = () => {
    if (!gameState.isGameActive.value || !gameState.gameState.currentPiece) return

    const newPosition = GameEngine.movePiece(
      gameState.gameState.currentPiece,
      gameState.gameState.piecePosition,
      'left' as Direction,
      gameState.gameState.pieceRotation,
      gameState.gameState.board
    )

    if (newPosition) {
      gameState.updatePiecePosition(newPosition)
    }
  }

  const handleMoveRight = () => {
    if (!gameState.isGameActive.value || !gameState.gameState.currentPiece) return

    const newPosition = GameEngine.movePiece(
      gameState.gameState.currentPiece,
      gameState.gameState.piecePosition,
      'right' as Direction,
      gameState.gameState.pieceRotation,
      gameState.gameState.board
    )

    if (newPosition) {
      gameState.updatePiecePosition(newPosition)
    }
  }

  const handleMoveDown = () => {
    if (!gameState.isGameActive.value || !gameState.gameState.currentPiece) return

    const newPosition = GameEngine.movePiece(
      gameState.gameState.currentPiece,
      gameState.gameState.piecePosition,
      'down' as Direction,
      gameState.gameState.pieceRotation,
      gameState.gameState.board
    )

    if (newPosition) {
      gameState.updatePiecePosition(newPosition)
      gameState.resetFallTimer()
    }
  }

  const handleRotate = () => {
    if (!gameState.isGameActive.value || !gameState.gameState.currentPiece) return

    const rotationResult = GameEngine.rotatePiece(
      gameState.gameState.currentPiece,
      gameState.gameState.piecePosition,
      gameState.gameState.pieceRotation,
      'clockwise' as RotationDirection,
      gameState.gameState.board
    )

    if (rotationResult) {
      gameState.updatePiecePosition(rotationResult.position)
      gameState.updatePieceRotation(rotationResult.rotation)
    }
  }

  const handleHardDrop = () => {
    if (!gameState.isGameActive.value || !gameState.gameState.currentPiece) return

    const dropPosition = GameEngine.hardDropPiece(
      gameState.gameState.currentPiece,
      gameState.gameState.piecePosition,
      gameState.gameState.pieceRotation,
      gameState.gameState.board
    )

    gameState.updatePiecePosition(dropPosition)
    
    // Force immediate locking after hard drop
    lockCurrentPiece()
  }

  const handlePause = () => {
    if (gameState.gameState.gameStatus === 'ready') {
      gameState.startGame()
    } else if (gameState.isGameActive.value) {
      gameState.pauseGame()
    } else if (gameState.isGamePaused.value) {
      gameState.resumeGame()
    } else if (gameState.gameState.gameStatus === 'gameOver') {
      gameState.restartGame()
    }
  }

  const lockCurrentPiece = () => {
    if (!gameState.gameState.currentPiece) return

    try {
      // Lock piece to board
      const newBoard = GameEngine.lockPieceToBoard(
        gameState.gameState.currentPiece,
        gameState.gameState.piecePosition,
        gameState.gameState.pieceRotation,
        gameState.gameState.board
      )

      gameState.updateBoard(newBoard)

      // Check for completed lines
      const lineResult = GameEngine.processLineClear(newBoard, gameState.gameState.level)
      
      if (lineResult.linesCleared > 0) {
        gameState.updateBoard(lineResult.newBoard)
        gameState.updateScore(lineResult.linesCleared)
      }

      // Move next piece to current and generate new next piece
      if (gameState.gameState.nextPiece) {
        gameState.setCurrentPiece(gameState.gameState.nextPiece)
        gameState.setNextPiece(GameEngine.generateNewPiece())
        
        // Check for game over
        if (GameEngine.checkGameOver(
          gameState.gameState.currentPiece,
          gameState.gameState.piecePosition,
          gameState.gameState.pieceRotation,
          gameState.gameState.board
        )) {
          gameState.endGame()
        }
      }

      gameState.resetFallTimer()
    } catch (error) {
      console.error('Error locking piece:', error)
      // Fallback: end game on critical error
      gameState.endGame()
    }
  }

  // Set up keyboard controls
  const keyboard = useKeyboard({
    onLeft: handleMoveLeft,
    onRight: handleMoveRight,
    onDown: handleMoveDown,
    onUp: handleRotate,
    onSpace: handleHardDrop,
    onPause: handlePause
  })

  return {
    ...gameState,
    keyboard,
    lockCurrentPiece,
    handleMoveLeft,
    handleMoveRight,
    handleMoveDown,
    handleRotate,
    handleHardDrop,
    handlePause
  }
}
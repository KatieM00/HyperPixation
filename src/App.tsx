import React, { useState } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { useGameState } from './hooks/useGameState';
import { GameScreen as GameScreenType } from './types/game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('start');
  const { gameState, startGame, resetGame, makeGuess, closeLevelCompletePopup, useHint, skipLevel } = useGameState();

  const handleStartGame = () => {
    startGame();
    setCurrentScreen('playing');
  };

  const handleRestart = () => {
    resetGame();
    setCurrentScreen('start');
  };

  // Check if game is complete
  React.useEffect(() => {
    if (gameState.isGameComplete) {
      setCurrentScreen('end');
    }
  }, [gameState.isGameComplete]);

  return (
    <div className="font-sans">
      {currentScreen === 'start' && (
        <StartScreen onStartGame={handleStartGame} />
      )}
      
      {currentScreen === 'playing' && gameState.isGameActive && (
        <GameScreen 
          gameState={gameState} 
          onGuess={makeGuess} 
          onCloseLevelCompletePopup={closeLevelCompletePopup}
          onUseHint={useHint}
          onSkipLevel={skipLevel}
        />
      )}
      
      {currentScreen === 'end' && (
        <EndScreen gameState={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import { Timer, Star, ArrowRight, Lightbulb } from 'lucide-react';
import { PixelatedImage } from './PixelatedImage';
import { LevelCompletePopup } from './LevelCompletePopup';
import { getHintDisplay } from '../utils/gameHelpers';

interface GameScreenProps {
  gameState: GameState;
  onGuess: (guess: string) => boolean;
  onCloseLevelCompletePopup: () => void;
  onUseHint: () => void;
  onSkipLevel: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameState, onGuess, onCloseLevelCompletePopup, onUseHint, onSkipLevel }) => {
  const [currentGuess, setCurrentGuess] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | null; message: string }>({ type: null, message: '' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuess.trim()) return;

    const isCorrect = onGuess(currentGuess);
    
    if (isCorrect) {
      const points = Math.max(0, 6 - gameState.currentGuess);
      setFeedback({ 
        type: 'correct', 
        message: `Correct! +${points} points` 
      });
    } else {
      setFeedback({ 
        type: 'incorrect', 
        message: gameState.currentGuess >= 5 ? 'Incorrect! Moving to next level...' : 'Try again!' 
      });
    }
    
    setCurrentGuess('');
  };

  // Clear feedback after level change
  useEffect(() => {
    setFeedback({ type: null, message: '' });
  }, [gameState.currentLevel]);

  // Focus input on mount and level change
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.currentLevel]);

  const getPixelationLevel = () => {
    // If showing unblurred image after correct answer, return 1 for clear image
    if (gameState.showUnblurred) {
      return 1;
    }
    const levels = [50, 35, 20, 10, 1]; // Pixel sizes for heavy pixelation
    return levels[gameState.currentGuess - 1] || 8;
  };

  if (!gameState.currentImage) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">HyperPixation</h1>
            <div className="flex items-center gap-2 text-orange-600">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-semibold">{gameState.score}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Level {gameState.currentLevel}/10</span>
            {gameState.showTimer && (
              <div className="flex items-center gap-2 text-red-600 font-semibold">
                <Timer className="w-5 h-5" />
                <span>{gameState.timeRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-6">
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  <PixelatedImage
                    src={gameState.currentImage.url}
                    alt="Guess this image"
                    pixelSize={getPixelationLevel()}
                    className="aspect-square bg-gray-100 rounded-2xl overflow-hidden"
                    onError={onSkipLevel}
                  />
                </div>
                <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                  Guess {gameState.currentGuess}/5
                </div>
              </div>

              {/* Guess Indicators */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      num < gameState.currentGuess
                        ? 'bg-gray-400'
                        : num === gameState.currentGuess
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  What do you see?
                </h2>
                <p className="text-gray-600">
                  {gameState.currentGuess === 5 
                    ? 'Final guess - you have 30 seconds!' 
                    : 'Type your guess below'}
                </p>
              </div>

              {/* Hint Display */}
              {gameState.hintUsed && gameState.currentImage && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Hint:</span>
                  </div>
                  <div className="font-mono text-2xl text-yellow-800 tracking-wider text-center">
                    {getHintDisplay(gameState.currentImage.answer, gameState.revealedLetters)}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    placeholder="Enter your guess..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg transition-colors"
                    disabled={!gameState.isGameActive || gameState.showUnblurred || gameState.showLevelCompletePopup}
                  />
                  <button
                    type="button"
                    onClick={onUseHint}
                    disabled={gameState.hintUsed || !gameState.isGameActive || gameState.showUnblurred || gameState.showLevelCompletePopup}
                    className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                    title={gameState.hintUsed ? "Hint already used" : "Get a hint"}
                  >
                    <Lightbulb className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!currentGuess.trim() || !gameState.isGameActive || gameState.showUnblurred || gameState.showLevelCompletePopup}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Submit Guess
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              {/* Feedback */}
              {feedback.type && (
                <div className={`p-4 rounded-xl text-center font-medium transition-all duration-300 ${
                  feedback.type === 'correct'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feedback.message}
                  {gameState.showUnblurred && (
                    <div className="mt-2 text-sm text-green-700">
                      The answer was: <span className="font-bold">{gameState.currentImage?.answer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Show unblurred message when revealing answer */}
              {gameState.showUnblurred && !feedback.type && (
                <div className="p-4 rounded-xl text-center font-medium bg-green-100 text-green-800">
                  <div className="text-lg font-bold mb-1">Correct!</div>
                  <div className="text-sm">The answer was: <span className="font-bold">{gameState.currentImage?.answer}</span></div>
                  <div className="text-xs mt-2 text-green-600">Moving to next level...</div>
                </div>
              )}

              {/* Previous Guesses */}
              {gameState.guessHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Previous Guesses:</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameState.guessHistory.map((guess, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {guess}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scoring Guide */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Scoring:</h3>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  {[5, 4, 3, 2, 1].map((points, index) => (
                    <div
                      key={points}
                      className={`text-center py-1 rounded-lg ${
                        index + 1 === gameState.currentGuess
                          ? 'bg-blue-200 text-blue-800 font-semibold'
                          : index + 1 < gameState.currentGuess
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-white text-blue-700'
                      }`}
                    >
                      {points}pt
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Complete Popup */}
      {gameState.showLevelCompletePopup && gameState.currentImage && gameState.lastLevelResult && (
        <LevelCompletePopup
          isVisible={gameState.showLevelCompletePopup}
          image={gameState.currentImage}
          wasCorrect={gameState.lastLevelResult.correct}
          pointsEarned={gameState.lastLevelResult.pointsEarned}
          guessNumber={gameState.lastLevelResult.guessNumber}
          playerGuesses={gameState.guessHistory}
          currentLevel={gameState.currentLevel}
          totalLevels={10}
          onContinue={onCloseLevelCompletePopup}
        />
      )}
    </div>
  );
};
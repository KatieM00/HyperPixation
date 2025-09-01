import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import { Timer, Star, ArrowRight } from 'lucide-react';
import { PixelatedImage } from './PixelatedImage';

interface GameScreenProps {
  gameState: GameState;
  onGuess: (guess: string) => boolean;
}

export const GameScreen: React.FC<GameScreenProps> = ({ gameState, onGuess }) => {
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  placeholder="Enter your guess..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg transition-colors"
                  disabled={!gameState.isGameActive}
                />
                <button
                  type="submit"
                  disabled={!currentGuess.trim() || !gameState.isGameActive}
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
    </div>
  );
};
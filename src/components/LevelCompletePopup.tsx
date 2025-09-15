import React, { useEffect, useState } from 'react';
import { GameImage } from '../types/game';
import { CheckCircle, XCircle, ArrowRight, Clock, Target } from 'lucide-react';

interface LevelCompletePopupProps {
  isVisible: boolean;
  image: GameImage;
  wasCorrect: boolean;
  pointsEarned: number;
  guessNumber: number;
  playerGuesses: string[];
  currentLevel: number;
  totalLevels: number;
  onContinue: () => void;
}

export const LevelCompletePopup: React.FC<LevelCompletePopupProps> = ({
  isVisible,
  image,
  wasCorrect,
  pointsEarned,
  guessNumber,
  playerGuesses,
  currentLevel,
  totalLevels,
  onContinue
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Slight delay to allow for smooth animation
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  // Keyboard support
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onContinue();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onContinue();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, onContinue]);

  if (!isVisible) return null;

  const getPerformanceMessage = () => {
    if (!wasCorrect) return "Better luck next time!";
    if (guessNumber === 1) return "Perfect! First try!";
    if (guessNumber === 2) return "Excellent!";
    if (guessNumber === 3) return "Good job!";
    if (guessNumber === 4) return "Nice work!";
    return "Got it!";
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
      showContent ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl transform transition-all duration-300 ${
        showContent ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Level Progress</span>
            <span className="text-sm font-medium text-gray-800">{currentLevel}/{totalLevels}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentLevel / totalLevels) * 100}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            wasCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {wasCorrect ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h2 className={`text-3xl font-bold mb-2 ${
            wasCorrect ? 'text-green-800' : 'text-red-800'
          }`}>
            {getPerformanceMessage()}
          </h2>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Attempt {guessNumber}/5</span>
            </div>
            {wasCorrect && (
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">+{pointsEarned} points</span>
              </div>
            )}
          </div>
        </div>

        {/* Image and Answer */}
        <div className="mb-6">
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 shadow-lg">
              <img
                src={image.url}
                alt={image.answer}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Difficulty indicator */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < image.difficulty ? 'bg-orange-400' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">The answer was:</p>
            <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-2xl shadow-lg transform transition-all duration-200 hover:scale-105 ${
              wasCorrect 
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300' 
                : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-2 border-orange-300'
            }`}>
              {image.answer}
            </div>
          </div>
        </div>

        {/* Player Guesses */}
        {playerGuesses.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Your guesses:
            </p>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex flex-wrap gap-2">
                {playerGuesses.map((guess, index) => (
                  <span
                    key={index}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      guess.toLowerCase().trim() === image.answer.toLowerCase()
                        ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    #{index + 1}: {guess}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 text-lg"
        >
          {currentLevel >= totalLevels ? 'View Results' : 'Next Level'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
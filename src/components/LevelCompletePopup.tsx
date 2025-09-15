import React, { useEffect, useState } from 'react';
import { GameImage } from '../types/game';

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
  onContinue
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show the popup immediately
      setShowContent(true);
      
      // Auto-close after 2 seconds
      const timer = setTimeout(() => {
        onContinue();
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible, onContinue]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300 ${
      showContent ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-2xl px-8 py-6 shadow-2xl transform transition-all duration-300 ${
        showContent ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        <div className="text-center">
          {wasCorrect ? (
            <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-2 border-green-300 inline-block px-6 py-4 rounded-xl font-bold text-3xl shadow-lg">
              Correct!
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-300 inline-block px-6 py-4 rounded-xl shadow-lg">
              <div className="text-xl font-semibold mb-2">Oops! The answer was...</div>
              <div className="text-3xl font-bold">{image.answer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
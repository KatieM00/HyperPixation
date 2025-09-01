import React from 'react';
import { Trophy, RotateCcw, Share2, Star, CheckCircle, XCircle } from 'lucide-react';
import { GameState } from '../types/game';

interface EndScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ gameState, onRestart }) => {
  const correctGuesses = gameState.levelResults.filter(result => result.correct).length;
  const incorrectGuesses = gameState.levelResults.filter(result => !result.correct).length;
  const finalScore = gameState.score;
  
  const getScoreRating = (score: number) => {
    if (score >= 40) return { text: 'Legendary!', color: 'text-yellow-600', emoji: '🏆' };
    if (score >= 30) return { text: 'Excellent!', color: 'text-green-600', emoji: '🌟' };
    if (score >= 20) return { text: 'Great!', color: 'text-blue-600', emoji: '🎉' };
    if (score >= 10) return { text: 'Good!', color: 'text-orange-600', emoji: '👍' };
    return { text: 'Keep trying!', color: 'text-gray-600', emoji: '💪' };
  };

  const rating = getScoreRating(finalScore);

  const handleShare = () => {
    const shareText = `I just scored ${finalScore}/50 points in HyperPixation! Got ${correctGuesses}/10 correct! Can you beat my score? 🎮`;
    
    if (navigator.share) {
      navigator.share({
        title: 'HyperPixation Score',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText + ' ' + window.location.href);
      alert('Score copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Game Complete!
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {rating.emoji} <span className={rating.color}>{rating.text}</span>
            </p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-orange-100 to-blue-100 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8 text-orange-500 fill-current" />
              <span className="text-4xl font-bold text-gray-800">{finalScore}</span>
              <span className="text-2xl text-gray-600">/ 50</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(finalScore / 50) * 100}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((finalScore / 50) * 100)}% accuracy
            </p>
          </div>

          {/* Results Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Results Breakdown</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{correctGuesses}</span>
                </div>
                <p className="text-sm text-gray-600">Correct Guesses</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{incorrectGuesses}</span>
                </div>
                <p className="text-sm text-gray-600">Missed</p>
              </div>
            </div>
            
            {/* Level by Level Results */}
            <div className="grid grid-cols-5 gap-2">
              {gameState.levelResults.map((result) => (
                <div
                  key={result.level}
                  className={`p-2 rounded-lg text-center text-xs ${
                    result.correct
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="font-semibold">L{result.level}</div>
                  <div>{result.correct ? `${result.pointsEarned}pts` : '0pts'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Levels Played</p>
              <p className="text-2xl font-bold text-gray-800">10</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">{(finalScore / 10).toFixed(1)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-800">{Math.round((correctGuesses / 10) * 100)}%</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
            
            <button
              onClick={handleShare}
              className="flex-1 bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
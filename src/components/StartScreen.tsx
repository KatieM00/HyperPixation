import React from 'react';
import { Play } from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-4 tracking-tight">
            Hyper<span className="text-orange-500">Pixation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Test your pixel recognition to work out what's hidden within the pixels! Think you know what pixelated animals, every day items or even landscapes look like? How many points will you get?
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How to Play</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <p className="text-gray-700">Look at the pixelated image and make your guess. Is it one word, or an entire sentence? </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p className="text-gray-700">Each wrong guess reveals more detail - think outside the box!</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <p className="text-gray-700">Score more points for earlier correct guesses</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-600 font-bold">4</span>
                </div>
                <p className="text-gray-700">Final guess has a 30-second timer!</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onStartGame}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
        >
          <Play className="w-6 h-6" />
          Start Playing
        </button>
      </div>
    </div>
  );
};
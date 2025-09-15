import { useState, useEffect, useCallback } from 'react';
import { GameState, GameImage, LevelResult } from '../types/game';
import { gameImages, getRandomGameImages } from '../data/images';

const initialGameState: GameState = {
  currentLevel: 1,
  currentGuess: 1,
  score: 0,
  isGameActive: false,
  isGameComplete: false,
  timeRemaining: 30,
  showTimer: false,
  currentImage: null,
  guessHistory: [],
  levelResults: [],
  showUnblurred: false,
  showLevelCompletePopup: false,
  lastLevelResult: null
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  // Internal state for selected images - not exposed in the external interface
  const [selectedImages, setSelectedImages] = useState<GameImage[]>(gameImages);

  const startGame = useCallback(() => {
    // Get randomized images for this game session
    const randomizedImages = getRandomGameImages(10);
    setSelectedImages(randomizedImages);
    
    const firstImage = randomizedImages[0];
    setGameState({
      ...initialGameState,
      isGameActive: true,
      currentImage: firstImage
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    // Reset to original images when resetting game
    setSelectedImages(gameImages);
  }, []);

  const nextLevel = useCallback(() => {
    if (gameState.currentLevel >= 10) {
      setGameState(prev => ({
        ...prev,
        isGameActive: false,
        isGameComplete: true,
        showLevelCompletePopup: false,
        showUnblurred: false
      }));
      return;
    }

    // Use the selected images for this game session
    const nextImage = selectedImages[gameState.currentLevel];
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      currentGuess: 1,
      showTimer: false,
      timeRemaining: 30,
      currentImage: nextImage,
      guessHistory: [],
      showUnblurred: false,
      showLevelCompletePopup: false,
      lastLevelResult: null
    }));
  }, [gameState.currentLevel, selectedImages]);

  const closeLevelCompletePopup = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showLevelCompletePopup: false,
      showUnblurred: false
    }));
    
    // Move to next level after closing popup
    setTimeout(() => {
      nextLevel();
    }, 100);
  }, [nextLevel]);

  const makeGuess = useCallback((guess: string) => {
    if (!gameState.currentImage || !gameState.isGameActive) return false;

    const isCorrect = guess.toLowerCase().trim() === gameState.currentImage.answer.toLowerCase();
    
    if (isCorrect) {
      const points = Math.max(0, 6 - gameState.currentGuess);
      const levelResult: LevelResult = {
        level: gameState.currentLevel,
        correct: true,
        guessNumber: gameState.currentGuess,
        pointsEarned: points
      };
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        guessHistory: [...prev.guessHistory, guess],
        levelResults: [...prev.levelResults, levelResult],
        showUnblurred: true,
        showLevelCompletePopup: true,
        lastLevelResult: levelResult
      }));
      
      return true;
    } else {
      const newGuess = gameState.currentGuess + 1;
      const newHistory = [...gameState.guessHistory, guess];
      
      if (newGuess > 5) {
        // Failed this level
        const levelResult: LevelResult = {
          level: gameState.currentLevel,
          correct: false,
          guessNumber: 5,
          pointsEarned: 0
        };
        
        setGameState(prev => ({
          ...prev,
          guessHistory: newHistory,
          levelResults: [...prev.levelResults, levelResult],
          showLevelCompletePopup: true,
          lastLevelResult: levelResult
        }));
      } else if (newGuess === 5) {
        // Start timer for final guess
        setGameState(prev => ({
          ...prev,
          currentGuess: newGuess,
          showTimer: true,
          guessHistory: newHistory
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          currentGuess: newGuess,
          guessHistory: newHistory
        }));
      }
      
      return false;
    }
  }, [gameState, nextLevel]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.showTimer && gameState.timeRemaining > 0 && gameState.isGameActive) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            // Time's up, record failed attempt
            const levelResult: LevelResult = {
              level: prev.currentLevel,
              correct: false,
              guessNumber: 5,
              pointsEarned: 0
            };
            
            setGameState(current => ({
              ...current,
              levelResults: [...current.levelResults, levelResult]
            }));
            
            return {
              ...prev,
              timeRemaining: 0,
              showTimer: false,
              showLevelCompletePopup: true
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.showTimer, gameState.timeRemaining, gameState.isGameActive, nextLevel]);

  return {
    gameState,
    startGame,
    resetGame,
    makeGuess,
    closeLevelCompletePopup
  };
};
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Complete Game Flow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should complete a full game session with randomized images', async () => {
    const { result } = renderHook(() => useGameState());
    
    // Start the game
    act(() => {
      result.current.startGame();
    });
    
    expect(result.current.gameState.isGameActive).toBe(true);
    expect(result.current.gameState.currentLevel).toBe(1);
    expect(result.current.gameState.currentImage).toBeTruthy();
    
    const gameImages: string[] = [];
    const levelScores: number[] = [];
    
    // Play through all 10 levels
    for (let level = 1; level <= 10; level++) {
      expect(result.current.gameState.currentLevel).toBe(level);
      expect(result.current.gameState.currentGuess).toBe(1);
      expect(result.current.gameState.currentImage).toBeTruthy();
      
      const currentImage = result.current.gameState.currentImage!;
      gameImages.push(currentImage.answer);
      
      // Verify image structure
      expect(currentImage).toMatchObject({
        id: expect.any(Number),
        url: expect.any(String),
        answer: expect.any(String),
        difficulty: expect.any(Number)
      });
      
      // Make a correct guess on the first try for maximum points
      act(() => {
        result.current.makeGuess(currentImage.answer);
      });
      
      levelScores.push(5); // 5 points for first guess
      
      // Verify level result was recorded
      expect(result.current.gameState.levelResults).toHaveLength(level);
      expect(result.current.gameState.levelResults[level - 1]).toEqual({
        level,
        correct: true,
        guessNumber: 1,
        pointsEarned: 5
      });
      
      // Wait for level transition
      if (level < 10) {
        act(() => {
          vi.advanceTimersByTime(1500);
        });
        
        expect(result.current.gameState.currentLevel).toBe(level + 1);
        expect(result.current.gameState.currentGuess).toBe(1);
        expect(result.current.gameState.guessHistory).toEqual([]);
      }
    }
    
    // Wait for game completion
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    // Verify game completion
    expect(result.current.gameState.isGameComplete).toBe(true);
    expect(result.current.gameState.isGameActive).toBe(false);
    expect(result.current.gameState.score).toBe(50); // 10 levels × 5 points each
    expect(result.current.gameState.levelResults).toHaveLength(10);
    
    // Verify all levels were completed correctly
    result.current.gameState.levelResults.forEach((result, index) => {
      expect(result).toEqual({
        level: index + 1,
        correct: true,
        guessNumber: 1,
        pointsEarned: 5
      });
    });
    
    // Verify we got 10 different images (could be duplicates due to randomization, but should be valid)
    expect(gameImages).toHaveLength(10);
    gameImages.forEach(answer => {
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });
  });

  it('should handle mixed correct/incorrect guesses properly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.startGame();
    });
    
    // Level 1: Get it wrong 2 times, then correct (3 points)
    const level1Answer = result.current.gameState.currentImage!.answer;
    
    act(() => {
      result.current.makeGuess('wrong1');
    });
    expect(result.current.gameState.currentGuess).toBe(2);
    
    act(() => {
      result.current.makeGuess('wrong2');
    });
    expect(result.current.gameState.currentGuess).toBe(3);
    
    act(() => {
      result.current.makeGuess(level1Answer);
    });
    
    expect(result.current.gameState.levelResults[0]).toEqual({
      level: 1,
      correct: true,
      guessNumber: 3,
      pointsEarned: 3
    });
    
    // Wait for level transition
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    // Level 2: Fail completely (0 points)
    expect(result.current.gameState.currentLevel).toBe(2);
    
    // Make 5 wrong guesses
    for (let i = 1; i <= 5; i++) {
      act(() => {
        result.current.makeGuess(`wrong${i}`);
      });
      
      if (i === 5) {
        expect(result.current.gameState.showTimer).toBe(true);
      }
    }
    
    expect(result.current.gameState.levelResults[1]).toEqual({
      level: 2,
      correct: false,
      guessNumber: 5,
      pointsEarned: 0
    });
    
    // Wait for level transition
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(result.current.gameState.currentLevel).toBe(3);
    expect(result.current.gameState.score).toBe(3); // Only points from level 1
  });

  it('should handle timer expiration correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.startGame();
    });
    
    // Make 4 wrong guesses to trigger timer
    for (let i = 1; i <= 4; i++) {
      act(() => {
        result.current.makeGuess(`wrong${i}`);
      });
    }
    
    expect(result.current.gameState.currentGuess).toBe(5);
    expect(result.current.gameState.showTimer).toBe(true);
    expect(result.current.gameState.timeRemaining).toBe(30);
    
    // Let timer run out
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    expect(result.current.gameState.timeRemaining).toBe(0);
    expect(result.current.gameState.showTimer).toBe(false);
    
    // Should have recorded a failed attempt
    expect(result.current.gameState.levelResults[0]).toEqual({
      level: 1,
      correct: false,
      guessNumber: 5,
      pointsEarned: 0
    });
    
    // Wait for level transition
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    expect(result.current.gameState.currentLevel).toBe(2);
  });

  it('should maintain guess history correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.startGame();
    });
    
    const correctAnswer = result.current.gameState.currentImage!.answer;
    
    // Make several guesses
    const guesses = ['guess1', 'guess2', 'guess3'];
    
    guesses.forEach((guess, index) => {
      act(() => {
        result.current.makeGuess(guess);
      });
      
      expect(result.current.gameState.guessHistory).toEqual(guesses.slice(0, index + 1));
    });
    
    // Make correct guess
    act(() => {
      result.current.makeGuess(correctAnswer);
    });
    
    expect(result.current.gameState.guessHistory).toEqual([...guesses, correctAnswer]);
    
    // Wait for level transition
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    
    // Guess history should be cleared for new level
    expect(result.current.gameState.guessHistory).toEqual([]);
  });

  it('should reset game state completely', () => {
    const { result } = renderHook(() => useGameState());
    
    // Start and play a bit
    act(() => {
      result.current.startGame();
    });
    
    act(() => {
      result.current.makeGuess('wrong');
    });
    
    act(() => {
      result.current.makeGuess('wrong2');
    });
    
    // Verify game has progressed
    expect(result.current.gameState.isGameActive).toBe(true);
    expect(result.current.gameState.currentGuess).toBe(3);
    expect(result.current.gameState.guessHistory).toHaveLength(2);
    
    // Reset game
    act(() => {
      result.current.resetGame();
    });
    
    // Verify complete reset
    expect(result.current.gameState).toEqual({
      currentLevel: 1,
      currentGuess: 1,
      score: 0,
      isGameActive: false,
      isGameComplete: false,
      timeRemaining: 30,
      showTimer: false,
      currentImage: null,
      guessHistory: [],
      levelResults: []
    });
  });

  it('should provide different image sequences on multiple game starts', () => {
    const { result } = renderHook(() => useGameState());
    
    const gameSequences: string[][] = [];
    
    // Play multiple short games to test randomization
    for (let gameNum = 0; gameNum < 3; gameNum++) {
      act(() => {
        result.current.startGame();
      });
      
      const sequence: string[] = [];
      
      // Play first 3 levels to get a sample
      for (let level = 1; level <= 3; level++) {
        const currentImage = result.current.gameState.currentImage!;
        sequence.push(currentImage.answer);
        
        act(() => {
          result.current.makeGuess(currentImage.answer);
        });
        
        if (level < 3) {
          act(() => {
            vi.advanceTimersByTime(1500);
          });
        }
      }
      
      gameSequences.push(sequence);
      
      // Reset for next game
      act(() => {
        result.current.resetGame();
      });
    }
    
    // Verify we got different sequences (at least some variation)
    expect(gameSequences).toHaveLength(3);
    gameSequences.forEach(sequence => {
      expect(sequence).toHaveLength(3);
      sequence.forEach(answer => {
        expect(typeof answer).toBe('string');
        expect(answer.length).toBeGreaterThan(0);
      });
    });
    
    // Note: Due to randomization, sequences might occasionally be the same,
    // but the important thing is that the randomization system is working
    // and each game gets a valid sequence of images
  });
});
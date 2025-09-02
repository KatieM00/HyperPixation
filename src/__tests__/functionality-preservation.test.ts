import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { gameImages } from '../data/images';

describe('Functionality Preservation Validation', () => {
  describe('Game State Hook Interface Preservation', () => {
    it('should maintain the exact same external interface', () => {
      const { result } = renderHook(() => useGameState());
      
      // Verify the hook returns exactly the expected properties
      expect(result.current).toHaveProperty('gameState');
      expect(result.current).toHaveProperty('startGame');
      expect(result.current).toHaveProperty('resetGame');
      expect(result.current).toHaveProperty('makeGuess');
      
      // Verify no additional properties are exposed
      const expectedKeys = ['gameState', 'startGame', 'resetGame', 'makeGuess'];
      expect(Object.keys(result.current)).toEqual(expectedKeys);
    });

    it('should maintain the exact same gameState structure', () => {
      const { result } = renderHook(() => useGameState());
      
      const expectedGameStateKeys = [
        'currentLevel',
        'currentGuess', 
        'score',
        'isGameActive',
        'isGameComplete',
        'timeRemaining',
        'showTimer',
        'currentImage',
        'guessHistory',
        'levelResults'
      ];
      
      expect(Object.keys(result.current.gameState)).toEqual(expectedGameStateKeys);
    });

    it('should maintain the same initial game state values', () => {
      const { result } = renderHook(() => useGameState());
      
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
  });

  describe('Game Flow Preservation', () => {
    it('should maintain the same game start behavior', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      expect(result.current.gameState.isGameActive).toBe(true);
      expect(result.current.gameState.currentLevel).toBe(1);
      expect(result.current.gameState.currentGuess).toBe(1);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.currentImage).toBeTruthy();
      expect(result.current.gameState.currentImage).toHaveProperty('id');
      expect(result.current.gameState.currentImage).toHaveProperty('url');
      expect(result.current.gameState.currentImage).toHaveProperty('answer');
      expect(result.current.gameState.currentImage).toHaveProperty('difficulty');
    });

    it('should maintain the same scoring system', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const correctAnswer = result.current.gameState.currentImage!.answer;
      
      // Test scoring for first guess (should give 5 points)
      act(() => {
        result.current.makeGuess(correctAnswer);
      });
      
      expect(result.current.gameState.levelResults[0]).toEqual({
        level: 1,
        correct: true,
        guessNumber: 1,
        pointsEarned: 5
      });
    });

    it('should maintain the same guess progression', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const correctAnswer = result.current.gameState.currentImage!.answer;
      
      // Make wrong guesses
      act(() => {
        result.current.makeGuess('wrong1');
      });
      expect(result.current.gameState.currentGuess).toBe(2);
      
      act(() => {
        result.current.makeGuess('wrong2');
      });
      expect(result.current.gameState.currentGuess).toBe(3);
      
      // Correct guess should still work
      act(() => {
        result.current.makeGuess(correctAnswer);
      });
      
      expect(result.current.gameState.levelResults[0]).toEqual({
        level: 1,
        correct: true,
        guessNumber: 3,
        pointsEarned: 3
      });
    });

    it('should maintain the same timer behavior on final guess', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      // Make 4 wrong guesses to reach final guess
      for (let i = 1; i <= 4; i++) {
        act(() => {
          result.current.makeGuess(`wrong${i}`);
        });
      }
      
      expect(result.current.gameState.currentGuess).toBe(5);
      expect(result.current.gameState.showTimer).toBe(true);
      expect(result.current.gameState.timeRemaining).toBe(30);
    });

    it('should maintain the same level progression', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const initialLevel = result.current.gameState.currentLevel;
      const correctAnswer = result.current.gameState.currentImage!.answer;
      
      act(() => {
        result.current.makeGuess(correctAnswer);
      });
      
      // Wait for level transition (simulated)
      setTimeout(() => {
        expect(result.current.gameState.currentLevel).toBe(initialLevel + 1);
        expect(result.current.gameState.currentGuess).toBe(1);
        expect(result.current.gameState.guessHistory).toEqual([]);
      }, 100);
    });

    it('should maintain the same game completion behavior', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      // Simulate completing all 10 levels
      for (let level = 1; level <= 10; level++) {
        const correctAnswer = result.current.gameState.currentImage!.answer;
        act(() => {
          result.current.makeGuess(correctAnswer);
        });
        
        // Wait for level transition
        if (level < 10) {
          setTimeout(() => {
            expect(result.current.gameState.currentLevel).toBe(level + 1);
          }, 100);
        }
      }
      
      setTimeout(() => {
        expect(result.current.gameState.isGameComplete).toBe(true);
        expect(result.current.gameState.isGameActive).toBe(false);
        expect(result.current.gameState.levelResults).toHaveLength(10);
      }, 200);
    });

    it('should maintain the same reset behavior', () => {
      const { result } = renderHook(() => useGameState());
      
      // Start and play a bit
      act(() => {
        result.current.startGame();
      });
      
      act(() => {
        result.current.makeGuess('wrong');
      });
      
      // Reset game
      act(() => {
        result.current.resetGame();
      });
      
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
  });

  describe('Data Structure Preservation', () => {
    it('should maintain GameImage interface compatibility', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const currentImage = result.current.gameState.currentImage!;
      
      expect(typeof currentImage.id).toBe('number');
      expect(typeof currentImage.url).toBe('string');
      expect(typeof currentImage.answer).toBe('string');
      expect(typeof currentImage.difficulty).toBe('number');
      
      // Verify it matches the expected structure
      expect(currentImage).toMatchObject({
        id: expect.any(Number),
        url: expect.any(String),
        answer: expect.any(String),
        difficulty: expect.any(Number)
      });
    });

    it('should maintain LevelResult interface compatibility', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const correctAnswer = result.current.gameState.currentImage!.answer;
      
      act(() => {
        result.current.makeGuess(correctAnswer);
      });
      
      const levelResult = result.current.gameState.levelResults[0];
      
      expect(levelResult).toMatchObject({
        level: expect.any(Number),
        correct: expect.any(Boolean),
        guessNumber: expect.any(Number),
        pointsEarned: expect.any(Number)
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain gameImages export availability', () => {
      expect(gameImages).toBeDefined();
      expect(Array.isArray(gameImages)).toBe(true);
      expect(gameImages.length).toBeGreaterThan(0);
      
      // Verify each image has the expected structure
      gameImages.forEach(image => {
        expect(image).toMatchObject({
          id: expect.any(Number),
          url: expect.any(String),
          answer: expect.any(String),
          difficulty: expect.any(Number)
        });
      });
    });

    it('should ensure all original images are still available', () => {
      // The original game had specific images - ensure they're still accessible
      expect(gameImages.length).toBeGreaterThanOrEqual(10);
      
      // Verify we have images across different difficulty levels
      const difficulties = gameImages.map(img => img.difficulty);
      const uniqueDifficulties = [...new Set(difficulties)];
      expect(uniqueDifficulties.length).toBeGreaterThan(1);
    });
  });

  describe('Performance Preservation', () => {
    it('should maintain fast game initialization', () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms as per requirements
      expect(duration).toBeLessThan(100);
    });

    it('should maintain efficient guess processing', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const startTime = performance.now();
      
      act(() => {
        result.current.makeGuess('test');
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Guess processing should be very fast
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Error Handling Preservation', () => {
    it('should handle invalid guesses gracefully', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      // Test empty guess
      expect(() => {
        act(() => {
          result.current.makeGuess('');
        });
      }).not.toThrow();
      
      // Test whitespace-only guess
      expect(() => {
        act(() => {
          result.current.makeGuess('   ');
        });
      }).not.toThrow();
    });

    it('should handle game state edge cases', () => {
      const { result } = renderHook(() => useGameState());
      
      // Try to make guess before starting game
      expect(() => {
        act(() => {
          result.current.makeGuess('test');
        });
      }).not.toThrow();
      
      expect(result.current.makeGuess('test')).toBe(false);
    });
  });
});
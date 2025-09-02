import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { getAllImages, getRandomGameImages } from '../data/images';

describe('Performance Validation with Larger Image Pool', () => {
  describe('Image Pool Performance', () => {
    it('should load all images quickly', () => {
      const startTime = performance.now();
      const allImages = getAllImages();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
      expect(allImages.length).toBeGreaterThanOrEqual(30); // Should have expanded pool
    });

    it('should generate random game images quickly', () => {
      const startTime = performance.now();
      const randomImages = getRandomGameImages(10);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
      expect(randomImages).toHaveLength(10);
    });

    it('should handle multiple rapid randomization calls efficiently', () => {
      const startTime = performance.now();
      
      // Generate 100 random selections rapidly
      for (let i = 0; i < 100; i++) {
        const randomImages = getRandomGameImages(10);
        expect(randomImages).toHaveLength(10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(duration / 100).toBeLessThan(10); // Average per call should be < 10ms
    });
  });

  describe('Game State Performance', () => {
    it('should initialize game quickly with larger image pool', () => {
      const { result } = renderHook(() => useGameState());
      
      const startTime = performance.now();
      
      act(() => {
        result.current.startGame();
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should meet the 100ms requirement from the design document
      expect(duration).toBeLessThan(100);
      expect(result.current.gameState.isGameActive).toBe(true);
      expect(result.current.gameState.currentImage).toBeTruthy();
    });

    it('should handle rapid game restarts efficiently', () => {
      const { result } = renderHook(() => useGameState());
      
      const startTime = performance.now();
      
      // Perform 50 rapid start/reset cycles
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.startGame();
        });
        
        act(() => {
          result.current.resetGame();
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(duration / 50).toBeLessThan(40); // Average per cycle should be < 40ms
    });

    it('should process guesses efficiently regardless of image pool size', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startGame();
      });
      
      const startTime = performance.now();
      
      // Make 100 rapid guesses
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.makeGuess(`guess${i}`);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
      expect(duration / 100).toBeLessThan(5); // Average per guess should be < 5ms
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create excessive objects during randomization', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Generate many random selections
      for (let i = 0; i < 1000; i++) {
        const randomImages = getRandomGameImages(10);
        expect(randomImages).toHaveLength(10);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage shouldn't grow excessively (allow for some variance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
    });

    it('should clean up game state properly on reset', () => {
      const { result } = renderHook(() => useGameState());
      
      // Start multiple games and accumulate state
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.startGame();
        });
        
        // Make some guesses to build up state
        act(() => {
          result.current.makeGuess('test1');
        });
        act(() => {
          result.current.makeGuess('test2');
        });
      }
      
      // Reset should clean everything
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.guessHistory).toEqual([]);
      expect(result.current.gameState.levelResults).toEqual([]);
      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.currentImage).toBeNull();
    });
  });

  describe('Scalability Validation', () => {
    it('should handle large image pools efficiently', () => {
      const allImages = getAllImages();
      
      // Verify we have a substantial image pool
      expect(allImages.length).toBeGreaterThanOrEqual(30);
      
      // Test selection from large pool
      const startTime = performance.now();
      const selectedImages = getRandomGameImages(10);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50);
      expect(selectedImages).toHaveLength(10);
      
      // Verify all selected images are valid
      selectedImages.forEach(image => {
        expect(image).toMatchObject({
          id: expect.any(Number),
          url: expect.any(String),
          answer: expect.any(String),
          difficulty: expect.any(Number)
        });
      });
    });

    it('should maintain performance with concurrent game sessions simulation', () => {
      const hooks = [];
      
      // Simulate multiple concurrent game sessions
      for (let i = 0; i < 10; i++) {
        const { result } = renderHook(() => useGameState());
        hooks.push(result);
      }
      
      const startTime = performance.now();
      
      // Start all games simultaneously
      hooks.forEach(hook => {
        act(() => {
          hook.current.startGame();
        });
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should handle concurrent starts
      
      // Verify all games started correctly
      hooks.forEach(hook => {
        expect(hook.current.gameState.isGameActive).toBe(true);
        expect(hook.current.gameState.currentImage).toBeTruthy();
      });
    });
  });

  describe('Randomization Quality vs Performance', () => {
    it('should provide good randomization without performance penalty', () => {
      const sequences: string[][] = [];
      const startTime = performance.now();
      
      // Generate 20 game sequences
      for (let i = 0; i < 20; i++) {
        const images = getRandomGameImages(10);
        sequences.push(images.map(img => img.answer));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Performance check
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      
      // Quality check - verify we get variation
      expect(sequences).toHaveLength(20);
      sequences.forEach(sequence => {
        expect(sequence).toHaveLength(10);
      });
      
      // Check that we're not getting identical sequences every time
      const uniqueFirstImages = new Set(sequences.map(seq => seq[0]));
      expect(uniqueFirstImages.size).toBeGreaterThan(1); // Should have some variation
    });
  });
});
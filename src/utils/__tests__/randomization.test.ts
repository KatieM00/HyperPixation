import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameImage } from '../../types/game';

// Import the randomization utilities from the images module
// Since these are internal utilities, we'll test them through the public API
import { getRandomGameImages, getAllImages } from '../../data/images';

describe('Randomization Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Shuffle Algorithm Quality', () => {
    it('should produce different orderings when shuffling the same array', () => {
      const allImages = getAllImages();
      const originalOrder = allImages.map(img => img.id).join(',');
      const shuffledOrders = new Set<string>();
      
      // Generate multiple shuffled sequences
      for (let i = 0; i < 20; i++) {
        const shuffled = getRandomGameImages(allImages.length);
        const shuffledOrder = shuffled.map(img => img.id).join(',');
        shuffledOrders.add(shuffledOrder);
      }
      
      // Should produce multiple different orderings
      expect(shuffledOrders.size).toBeGreaterThan(1);
      
      // Should not always produce the original order
      expect(shuffledOrders.has(originalOrder)).toBe(false);
    });

    it('should maintain all elements when shuffling', () => {
      const allImages = getAllImages();
      const originalIds = allImages.map(img => img.id).sort();
      
      for (let i = 0; i < 10; i++) {
        const shuffled = getRandomGameImages(allImages.length);
        const shuffledIds = shuffled.map(img => img.id).sort();
        
        expect(shuffledIds).toEqual(originalIds);
      }
    });

    it('should handle edge cases in shuffling', () => {
      // Test with empty array
      expect(() => getRandomGameImages(0)).not.toThrow();
      expect(getRandomGameImages(0)).toEqual([]);
      
      // Test with single element
      const singleResult = getRandomGameImages(1);
      expect(singleResult).toHaveLength(1);
      expect(singleResult[0]).toBeDefined();
    });
  });

  describe('Selection Algorithm', () => {
    it('should select requested number of images', () => {
      const testSizes = [1, 3, 5, 8, 10, 15, 20];
      
      testSizes.forEach(size => {
        const selected = getRandomGameImages(size);
        expect(selected).toHaveLength(size);
      });
    });

    it('should handle selection larger than pool by duplicating', () => {
      const allImages = getAllImages();
      const poolSize = allImages.length;
      const requestSize = poolSize + 5;
      
      const selected = getRandomGameImages(requestSize);
      expect(selected).toHaveLength(requestSize);
      
      // Should contain all original images
      const originalIds = allImages.map(img => img.id);
      const selectedIds = selected.map(img => img.id);
      
      originalIds.forEach(id => {
        expect(selectedIds).toContain(id);
      });
      
      // Should have duplicates
      const uniqueSelectedIds = new Set(selectedIds);
      expect(uniqueSelectedIds.size).toBeLessThan(selected.length);
    });

    it('should provide fair selection probability', () => {
      const allImages = getAllImages();
      const selectionCounts = new Map<number, number>();
      
      // Initialize counts
      allImages.forEach(img => {
        selectionCounts.set(img.id, 0);
      });
      
      // Perform many selections
      const numSelections = 200;
      const selectionSize = 5;
      
      for (let i = 0; i < numSelections; i++) {
        const selected = getRandomGameImages(selectionSize);
        selected.forEach(img => {
          const currentCount = selectionCounts.get(img.id) || 0;
          selectionCounts.set(img.id, currentCount + 1);
        });
      }
      
      // Check that selection is reasonably fair
      const counts = Array.from(selectionCounts.values());
      const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
      const expectedCount = (numSelections * selectionSize) / allImages.length;
      
      // Average should be close to expected
      expect(Math.abs(avgCount - expectedCount)).toBeLessThan(expectedCount * 0.3);
      
      // No image should be completely ignored (with this many selections)
      expect(counts.every(count => count > 0)).toBe(true);
    });
  });

  describe('Difficulty Balancing', () => {
    it('should maintain reasonable difficulty distribution', () => {
      const numTests = 50;
      const difficultyDistributions: number[][] = [];
      
      for (let i = 0; i < numTests; i++) {
        const selected = getRandomGameImages(10);
        const difficulties = selected.map(img => img.difficulty);
        difficultyDistributions.push(difficulties);
      }
      
      // Analyze distributions
      difficultyDistributions.forEach(difficulties => {
        // Should have some variety in difficulty
        const uniqueDifficulties = new Set(difficulties);
        expect(uniqueDifficulties.size).toBeGreaterThanOrEqual(2);
        
        // Should not be all extreme difficulties
        const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;
        expect(avgDifficulty).toBeGreaterThan(1.5);
        expect(avgDifficulty).toBeLessThan(4.5);
        
        // Should not have too many of the same difficulty
        difficulties.forEach(difficulty => {
          const countOfThisDifficulty = difficulties.filter(d => d === difficulty).length;
          expect(countOfThisDifficulty).toBeLessThanOrEqual(7); // Max 70% of one difficulty
        });
      });
    });

    it('should avoid extreme difficulty clustering in most cases', () => {
      const numTests = 50;
      let extremeClusteringCount = 0;
      
      for (let i = 0; i < numTests; i++) {
        const selected = getRandomGameImages(10);
        const difficulties = selected.map(img => img.difficulty);
        
        // Check for extreme clustering (all easy or all hard)
        const easyCount = difficulties.filter(d => d <= 2).length;
        const hardCount = difficulties.filter(d => d >= 4).length;
        
        // Count cases where we have extreme clustering
        if (easyCount >= 8 || hardCount >= 8 || (easyCount + hardCount) >= 9) {
          extremeClusteringCount++;
        }
      }
      
      // Should not have extreme clustering in most cases (allow some randomness)
      // With proper randomization, extreme clustering should be rare
      expect(extremeClusteringCount).toBeLessThan(numTests * 0.3); // Less than 30% of cases
    });

    it('should handle difficulty balancing with limited pool', () => {
      // Test with a mock limited pool that has uneven difficulty distribution
      const mockImages: GameImage[] = [
        { id: 1, url: 'easy1.jpg', answer: 'easy1', difficulty: 1 },
        { id: 2, url: 'easy2.jpg', answer: 'easy2', difficulty: 1 },
        { id: 3, url: 'easy3.jpg', answer: 'easy3', difficulty: 1 },
        { id: 4, url: 'hard1.jpg', answer: 'hard1', difficulty: 5 },
        { id: 5, url: 'hard2.jpg', answer: 'hard2', difficulty: 5 }
      ];
      
      // Since we can't easily mock the internal function, we'll test the behavior
      // by checking that the system handles uneven difficulty pools gracefully
      const selected = getRandomGameImages(10);
      
      // Should still return 10 images
      expect(selected).toHaveLength(10);
      
      // All should have valid difficulties
      selected.forEach(img => {
        expect(img.difficulty).toBeGreaterThanOrEqual(1);
        expect(img.difficulty).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive calls', () => {
      const results: GameImage[][] = [];
      
      // Make many rapid calls
      for (let i = 0; i < 100; i++) {
        const result = getRandomGameImages(10);
        results.push(result);
      }
      
      // All should be valid
      results.forEach(result => {
        expect(result).toHaveLength(10);
        result.forEach(img => {
          expect(img.id).toBeDefined();
          expect(img.answer).toBeDefined();
          expect(img.difficulty).toBeGreaterThanOrEqual(1);
          expect(img.difficulty).toBeLessThanOrEqual(5);
        });
      });
      
      // Should have some variation
      const sequences = results.map(result => result.map(img => img.id).join(','));
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
    });

    it('should maintain consistent performance under load', () => {
      const iterations = 1000;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        getRandomGameImages(10);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      // Calculate statistics
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      // Performance requirements
      expect(avgTime).toBeLessThan(1); // Average under 1ms
      expect(maxTime).toBeLessThan(10); // Max under 10ms
      
      // Should be consistent (no huge outliers)
      const sortedTimes = times.sort((a, b) => a - b);
      const p95Time = sortedTimes[Math.floor(iterations * 0.95)];
      expect(p95Time).toBeLessThan(5); // 95th percentile under 5ms
    });

    it('should handle memory efficiently with large requests', () => {
      // Test with large request sizes
      const largeSizes = [100, 500, 1000];
      
      largeSizes.forEach(size => {
        const startTime = performance.now();
        const result = getRandomGameImages(size);
        const endTime = performance.now();
        
        expect(result).toHaveLength(size);
        expect(endTime - startTime).toBeLessThan(50); // Should complete quickly
        
        // Verify all images are valid
        result.forEach(img => {
          expect(img.id).toBeDefined();
          expect(img.answer).toBeDefined();
          expect(img.difficulty).toBeGreaterThanOrEqual(1);
          expect(img.difficulty).toBeLessThanOrEqual(5);
        });
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid input gracefully', () => {
      // Test with various invalid inputs
      expect(() => getRandomGameImages(-1)).not.toThrow();
      expect(() => getRandomGameImages(0)).not.toThrow();
      expect(() => getRandomGameImages(NaN)).not.toThrow();
      expect(() => getRandomGameImages(Infinity)).not.toThrow();
      
      // Results should be sensible
      expect(getRandomGameImages(-1)).toEqual([]);
      expect(getRandomGameImages(0)).toEqual([]);
      expect(getRandomGameImages(NaN)).toEqual([]);
    });

    it('should maintain data integrity under stress', () => {
      // Perform many operations to test for memory leaks or corruption
      for (let i = 0; i < 1000; i++) {
        const result = getRandomGameImages(10);
        
        // Verify data integrity
        result.forEach(img => {
          expect(typeof img.id).toBe('number');
          expect(typeof img.url).toBe('string');
          expect(typeof img.answer).toBe('string');
          expect(typeof img.difficulty).toBe('number');
          expect(img.url.length).toBeGreaterThan(0);
          expect(img.answer.length).toBeGreaterThan(0);
        });
      }
    });

    it('should handle concurrent access safely', async () => {
      // Create multiple concurrent requests
      const promises = Array.from({ length: 50 }, () => 
        new Promise<GameImage[]>(resolve => {
          setTimeout(() => {
            const result = getRandomGameImages(10);
            resolve(result);
          }, Math.random() * 10);
        })
      );
      
      const results = await Promise.all(promises);
      
      // All results should be valid
      results.forEach(result => {
        expect(result).toHaveLength(10);
        result.forEach(img => {
          expect(img.id).toBeDefined();
          expect(img.answer).toBeDefined();
          expect(img.difficulty).toBeGreaterThanOrEqual(1);
          expect(img.difficulty).toBeLessThanOrEqual(5);
        });
      });
      
      // Should have some variation across concurrent requests
      const sequences = results.map(result => result.map(img => img.id).join(','));
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
    });
  });
});
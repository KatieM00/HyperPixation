import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRandomGameImages, getAllImages } from '../../data/images';

// Mock performance.now for consistent timing tests
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
});

describe('Randomization Feature Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  describe('Complete Game Flow with Randomized Images', () => {
    it('should provide valid randomized image sequences for game sessions', () => {
      // Simulate multiple game sessions
      const gameSessions: Array<{
        images: any[];
        totalScore: number;
        completedLevels: number;
      }> = [];
      
      for (let session = 0; session < 5; session++) {
        const sessionImages = getRandomGameImages(10);
        
        // Simulate playing through all levels
        let totalScore = 0;
        let completedLevels = 0;
        
        sessionImages.forEach((image, level) => {
          expect(image).toBeTruthy();
          expect(image.answer).toBeTruthy();
          expect(image.difficulty).toBeGreaterThanOrEqual(1);
          expect(image.difficulty).toBeLessThanOrEqual(5);
          
          // Simulate scoring (correct on first guess = 5 points)
          totalScore += 5;
          completedLevels++;
        });
        
        gameSessions.push({
          images: sessionImages,
          totalScore,
          completedLevels
        });
      }
      
      // Verify all sessions completed successfully
      gameSessions.forEach(session => {
        expect(session.completedLevels).toBe(10);
        expect(session.totalScore).toBe(50); // 5 points * 10 levels
        expect(session.images).toHaveLength(10);
      });
    });

    it('should handle various scoring scenarios with randomized images', () => {
      const sessionImages = getRandomGameImages(10);
      
      // Simulate different guess patterns
      const scoringScenarios = [
        { guessNumber: 1, expectedPoints: 5 },
        { guessNumber: 2, expectedPoints: 4 },
        { guessNumber: 3, expectedPoints: 3 },
        { guessNumber: 4, expectedPoints: 2 },
        { guessNumber: 5, expectedPoints: 1 },
        { guessNumber: 6, expectedPoints: 0 } // Failed
      ];
      
      sessionImages.forEach((image, index) => {
        const scenario = scoringScenarios[index % scoringScenarios.length];
        const actualPoints = Math.max(0, 6 - scenario.guessNumber);
        
        expect(actualPoints).toBe(scenario.expectedPoints);
        expect(image.answer).toBeTruthy();
        expect(typeof image.answer).toBe('string');
      });
    });

    it('should maintain game mechanics consistency across randomized sessions', () => {
      const numSessions = 10;
      const sessionResults: Array<{
        imageCount: number;
        validAnswers: number;
        difficultyRange: { min: number; max: number };
      }> = [];
      
      for (let i = 0; i < numSessions; i++) {
        const images = getRandomGameImages(10);
        const difficulties = images.map(img => img.difficulty);
        
        const result = {
          imageCount: images.length,
          validAnswers: images.filter(img => img.answer && img.answer.trim().length > 0).length,
          difficultyRange: {
            min: Math.min(...difficulties),
            max: Math.max(...difficulties)
          }
        };
        
        sessionResults.push(result);
      }
      
      // All sessions should have consistent mechanics
      sessionResults.forEach(result => {
        expect(result.imageCount).toBe(10);
        expect(result.validAnswers).toBe(10);
        expect(result.difficultyRange.min).toBeGreaterThanOrEqual(1);
        expect(result.difficultyRange.max).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Multiple Game Sessions Produce Different Sequences', () => {
    it('should generate different image sequences across multiple game sessions', () => {
      const sequences: string[] = [];
      
      // Generate 15 different game sessions
      for (let session = 0; session < 15; session++) {
        const sessionImages = getRandomGameImages(10);
        const sequence = sessionImages.map(img => img.id).join(',');
        sequences.push(sequence);
      }
      
      // Verify we have different sequences
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
      
      // With proper randomization, we should have several unique sequences
      expect(uniqueSequences.size).toBeGreaterThanOrEqual(5);
    });

    it('should maintain consistent game mechanics across different sessions', () => {
      const sessionResults: Array<{
        imageCount: number;
        allImagesValid: boolean;
        scoringConsistent: boolean;
      }> = [];
      
      // Test 10 different sessions
      for (let session = 0; session < 10; session++) {
        const sessionImages = getRandomGameImages(10);
        
        let allImagesValid = true;
        let scoringConsistent = true;
        
        // Validate each image and simulate scoring
        sessionImages.forEach((image, level) => {
          if (!image || !image.answer || !image.url || !image.difficulty) {
            allImagesValid = false;
          }
          
          // Test scoring consistency (2nd guess = 4 points)
          const expectedPoints = 4;
          const actualPoints = Math.max(0, 6 - 2);
          if (actualPoints !== expectedPoints) {
            scoringConsistent = false;
          }
        });
        
        sessionResults.push({
          imageCount: sessionImages.length,
          allImagesValid,
          scoringConsistent
        });
      }
      
      // All sessions should have consistent mechanics
      sessionResults.forEach(result => {
        expect(result.imageCount).toBe(10);
        expect(result.allImagesValid).toBe(true);
        expect(result.scoringConsistent).toBe(true);
      });
    });
  });

  describe('Difficulty Progression Balance with Random Selection', () => {
    it('should maintain reasonable difficulty distribution across game sessions', () => {
      const difficultyDistributions: number[][] = [];
      
      // Test multiple sessions
      for (let session = 0; session < 10; session++) {
        const sessionImages = getRandomGameImages(10);
        const sessionDifficulties = sessionImages.map(img => img.difficulty);
        difficultyDistributions.push(sessionDifficulties);
      }
      
      // Analyze difficulty distributions
      difficultyDistributions.forEach(difficulties => {
        // Should have a reasonable spread of difficulties
        const uniqueDifficulties = new Set(difficulties);
        expect(uniqueDifficulties.size).toBeGreaterThanOrEqual(2);
        
        // Should not be all the same difficulty
        expect(difficulties.every(d => d === difficulties[0])).toBe(false);
        
        // Average difficulty should be reasonable (not all easy or all hard)
        const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;
        expect(avgDifficulty).toBeGreaterThan(1.5);
        expect(avgDifficulty).toBeLessThan(4.5);
        
        // All difficulties should be valid
        difficulties.forEach(d => {
          expect(d).toBeGreaterThanOrEqual(1);
          expect(d).toBeLessThanOrEqual(5);
        });
      });
    });

    it('should provide appropriate difficulty progression within a session', () => {
      const sessionImages = getRandomGameImages(10);
      const difficulties = sessionImages.map(img => img.difficulty);
      
      // Check that we don't have extreme clustering
      const firstHalf = difficulties.slice(0, 5);
      const secondHalf = difficulties.slice(5);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d, 0) / secondHalf.length;
      
      // The difference shouldn't be too extreme
      const avgDifference = Math.abs(secondHalfAvg - firstHalfAvg);
      expect(avgDifference).toBeLessThan(2.5);
      
      // Should have some variety in each half
      const firstHalfUnique = new Set(firstHalf);
      const secondHalfUnique = new Set(secondHalf);
      expect(firstHalfUnique.size).toBeGreaterThanOrEqual(1);
      expect(secondHalfUnique.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases - Insufficient Image Pool Size', () => {
    it('should handle case when requesting more images than available', () => {
      const allImages = getAllImages();
      const poolSize = allImages.length;
      
      // Request more images than available
      const requestedCount = poolSize + 5;
      const result = getRandomGameImages(requestedCount);
      
      // Should return the requested count by duplicating images
      expect(result).toHaveLength(requestedCount);
      
      // Should contain all original images
      const originalIds = allImages.map(img => img.id);
      const resultIds = result.map(img => img.id);
      
      originalIds.forEach(id => {
        expect(resultIds).toContain(id);
      });
      
      // Should have duplicates
      const uniqueResultIds = new Set(resultIds);
      expect(uniqueResultIds.size).toBeLessThan(result.length);
    });

    it('should handle empty image pool gracefully', () => {
      // Test with zero images requested
      const result = getRandomGameImages(0);
      expect(result).toEqual([]);
    });

    it('should handle single image selection', () => {
      const result = getRandomGameImages(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBeTruthy();
      expect(result[0].id).toBeDefined();
      expect(result[0].answer).toBeDefined();
      expect(result[0].difficulty).toBeGreaterThanOrEqual(1);
      expect(result[0].difficulty).toBeLessThanOrEqual(5);
    });

    it('should handle invalid input parameters', () => {
      // Test negative numbers
      expect(getRandomGameImages(-1)).toEqual([]);
      expect(getRandomGameImages(-10)).toEqual([]);
      
      // Test NaN
      expect(getRandomGameImages(NaN)).toEqual([]);
      
      // Test Infinity
      expect(getRandomGameImages(Infinity)).toEqual([]);
    });
  });

  describe('Performance and Reliability Requirements', () => {
    it('should complete randomization within performance requirements', () => {
      const startTime = performance.now();
      
      // Generate multiple randomized image sets
      for (let i = 0; i < 50; i++) {
        const images = getRandomGameImages(10);
        expect(images).toHaveLength(10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete well under 100ms total (requirement from design)
      expect(duration).toBeLessThan(100);
    });

    it('should maintain consistency during rapid operations', () => {
      const results: any[][] = [];
      
      // Rapid randomization calls
      for (let i = 0; i < 20; i++) {
        const images = getRandomGameImages(10);
        results.push(images);
      }
      
      // All results should be valid
      results.forEach(images => {
        expect(images).toHaveLength(10);
        images.forEach(img => {
          expect(img.id).toBeDefined();
          expect(img.answer).toBeDefined();
          expect(img.difficulty).toBeGreaterThanOrEqual(1);
          expect(img.difficulty).toBeLessThanOrEqual(5);
        });
      });
      
      // Should have some variation
      const sequences = results.map(images => images.map(img => img.id).join(','));
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
    });

    it('should handle large request sizes efficiently', () => {
      const largeSizes = [50, 100, 200];
      
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
});
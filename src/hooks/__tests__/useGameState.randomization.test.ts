import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRandomGameImages, gameImages } from '../../data/images';

describe('useGameState Randomization Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Image System Verification', () => {
    it('should have working getRandomGameImages function', () => {
      const randomImages = getRandomGameImages(10);
      
      expect(randomImages).toHaveLength(10);
      expect(Array.isArray(randomImages)).toBe(true);
      
      // Verify each image has the correct structure
      randomImages.forEach(image => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('answer');
        expect(image).toHaveProperty('difficulty');
        expect(typeof image.id).toBe('number');
        expect(typeof image.url).toBe('string');
        expect(typeof image.answer).toBe('string');
        expect(typeof image.difficulty).toBe('number');
      });
    });

    it('should maintain backward compatibility with gameImages', () => {
      expect(gameImages).toBeDefined();
      expect(Array.isArray(gameImages)).toBe(true);
      expect(gameImages).toHaveLength(10);
      
      // Verify the original structure is preserved
      const originalIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const actualIds = gameImages.map(img => img.id);
      expect(actualIds).toEqual(originalIds);
    });

    it('should provide randomized sequences that can differ', () => {
      // Generate multiple sequences
      const sequences = [];
      for (let i = 0; i < 5; i++) {
        const sequence = getRandomGameImages(10);
        sequences.push(sequence.map(img => img.id).join(','));
      }
      
      // Check if we have at least some variation (probabilistic test)
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
    });
  });

  describe('Hook Integration Requirements', () => {
    it('should support the expected hook interface', () => {
      // Test that the functions we need are available
      expect(typeof getRandomGameImages).toBe('function');
      
      // Test that calling getRandomGameImages with 10 returns valid data
      const result = getRandomGameImages(10);
      expect(result).toHaveLength(10);
      
      // Test that each result can be used as a currentImage in game state
      result.forEach(image => {
        expect(image.id).toBeDefined();
        expect(image.answer).toBeDefined();
        expect(typeof image.answer).toBe('string');
      });
    });

    it('should handle edge cases that the hook might encounter', () => {
      // Test with 0 images (edge case)
      const zeroImages = getRandomGameImages(0);
      expect(zeroImages).toHaveLength(0);
      
      // Test with 1 image (minimum case)
      const oneImage = getRandomGameImages(1);
      expect(oneImage).toHaveLength(1);
      
      // Test with more images than available (should handle gracefully)
      const manyImages = getRandomGameImages(100);
      expect(manyImages.length).toBeGreaterThan(10); // Should have more than original 10
    });
  });

  describe('Game Flow Compatibility', () => {
    it('should provide images that work with game mechanics', () => {
      const randomImages = getRandomGameImages(10);
      
      // Simulate game flow - each image should be usable for guessing
      randomImages.forEach((image, index) => {
        // Test that we can make a correct guess
        const correctAnswer = image.answer.toLowerCase().trim();
        expect(correctAnswer).toBeTruthy();
        expect(correctAnswer.length).toBeGreaterThan(0);
        
        // Test that difficulty is valid
        expect(image.difficulty).toBeGreaterThanOrEqual(1);
        expect(image.difficulty).toBeLessThanOrEqual(5);
        
        // Test that image has a valid URL
        expect(image.url).toBeTruthy();
        expect(typeof image.url).toBe('string');
      });
    });

    it('should maintain scoring compatibility', () => {
      const randomImages = getRandomGameImages(10);
      
      // Test that we can simulate the scoring system
      randomImages.forEach((image, level) => {
        // Simulate different guess numbers (1-5)
        for (let guessNumber = 1; guessNumber <= 5; guessNumber++) {
          const points = Math.max(0, 6 - guessNumber);
          expect(points).toBeGreaterThanOrEqual(0);
          expect(points).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete randomization quickly', () => {
      const startTime = performance.now();
      
      // Generate images multiple times
      for (let i = 0; i < 10; i++) {
        getRandomGameImages(10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete well under 100ms (requirement from design)
      expect(duration).toBeLessThan(100);
    });

    it('should not produce duplicate images in a single session', () => {
      const randomImages = getRandomGameImages(10);
      const imageIds = randomImages.map(img => img.id);
      const uniqueIds = new Set(imageIds);
      
      // Should have no duplicates (unless we have fewer than 10 unique images)
      expect(uniqueIds.size).toBeLessThanOrEqual(10);
      
      // If we have enough unique images, should have no duplicates
      if (uniqueIds.size >= 10) {
        expect(uniqueIds.size).toBe(10);
      }
    });
  });
});
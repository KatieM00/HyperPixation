import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRandomGameImages, gameImages } from '../../data/images';

describe('Manual Integration Test for useGameState with Randomization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Image System Integration', () => {
    it('should have getRandomGameImages function that returns different images', () => {
      // Test that getRandomGameImages returns 10 images
      const randomImages1 = getRandomGameImages(10);
      const randomImages2 = getRandomGameImages(10);
      
      expect(randomImages1).toHaveLength(10);
      expect(randomImages2).toHaveLength(10);
      
      // Each image should have required properties
      randomImages1.forEach(image => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('answer');
        expect(image).toHaveProperty('difficulty');
      });
    });

    it('should maintain backward compatibility with gameImages', () => {
      expect(gameImages).toBeDefined();
      expect(Array.isArray(gameImages)).toBe(true);
      expect(gameImages).toHaveLength(10);
      
      // Verify structure matches expected format
      gameImages.forEach(image => {
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('answer');
        expect(image).toHaveProperty('difficulty');
      });
    });

    it('should have expanded image pool with more than 10 images', () => {
      const allImages = getRandomGameImages(50); // Try to get more than original 10
      
      // Should have more than the original 10 images available
      expect(allImages.length).toBeGreaterThan(10);
    });
  });

  describe('Randomization Quality', () => {
    it('should produce different sequences on multiple calls', () => {
      const sequence1 = getRandomGameImages(10);
      const sequence2 = getRandomGameImages(10);
      const sequence3 = getRandomGameImages(10);
      
      // Convert to strings for easy comparison
      const str1 = sequence1.map(img => img.id).join(',');
      const str2 = sequence2.map(img => img.id).join(',');
      const str3 = sequence3.map(img => img.id).join(',');
      
      // At least one sequence should be different (probabilistic test)
      const allSame = str1 === str2 && str2 === str3;
      expect(allSame).toBe(false);
    });

    it('should handle edge cases gracefully', () => {
      // Test with 0 images
      const zeroImages = getRandomGameImages(0);
      expect(zeroImages).toHaveLength(0);
      
      // Test with 1 image
      const oneImage = getRandomGameImages(1);
      expect(oneImage).toHaveLength(1);
    });
  });
});
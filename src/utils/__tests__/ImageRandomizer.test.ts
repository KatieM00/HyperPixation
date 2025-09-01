import { describe, it, expect, beforeEach } from 'vitest';
import { ImageRandomizer } from '../ImageRandomizer';
import { GameImage } from '../../types/game';

describe('ImageRandomizer', () => {
  let sampleImages: GameImage[];

  beforeEach(() => {
    sampleImages = [
      { id: 1, url: 'url1', answer: 'dog', difficulty: 1 },
      { id: 2, url: 'url2', answer: 'cat', difficulty: 1 },
      { id: 3, url: 'url3', answer: 'car', difficulty: 2 },
      { id: 4, url: 'url4', answer: 'coffee', difficulty: 2 },
      { id: 5, url: 'url5', answer: 'city', difficulty: 3 },
      { id: 6, url: 'url6', answer: 'mountain', difficulty: 3 },
      { id: 7, url: 'url7', answer: 'pizza', difficulty: 4 },
      { id: 8, url: 'url8', answer: 'sunset', difficulty: 4 },
      { id: 9, url: 'url9', answer: 'flower', difficulty: 5 },
      { id: 10, url: 'url10', answer: 'airplane', difficulty: 5 },
    ];
  });

  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = ImageRandomizer.shuffleArray(original);
      
      expect(shuffled).toHaveLength(original.length);
    });

    it('should contain all original elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = ImageRandomizer.shuffleArray(original);
      
      original.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not modify the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      ImageRandomizer.shuffleArray(original);
      
      expect(original).toEqual(originalCopy);
    });

    it('should handle empty array', () => {
      const result = ImageRandomizer.shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('should handle single element array', () => {
      const result = ImageRandomizer.shuffleArray([1]);
      expect(result).toEqual([1]);
    });

    it('should produce different results on multiple calls (probabilistic)', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = [];
      
      // Run shuffle multiple times
      for (let i = 0; i < 10; i++) {
        results.push(ImageRandomizer.shuffleArray(original).join(','));
      }
      
      // Should have at least some different results (very high probability)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('selectRandomImages', () => {
    it('should return the requested number of images', () => {
      const result = ImageRandomizer.selectRandomImages(sampleImages, 5);
      expect(result).toHaveLength(5);
    });

    it('should return all images when count equals pool size', () => {
      const result = ImageRandomizer.selectRandomImages(sampleImages, sampleImages.length);
      expect(result).toHaveLength(sampleImages.length);
    });

    it('should handle count greater than pool size by duplicating images', () => {
      const smallPool = sampleImages.slice(0, 3);
      const result = ImageRandomizer.selectRandomImages(smallPool, 5);
      
      expect(result).toHaveLength(5);
      // Should contain all original images
      smallPool.forEach(image => {
        expect(result.some(r => r.id === image.id)).toBe(true);
      });
    });

    it('should not return duplicate images when pool is sufficient', () => {
      const result = ImageRandomizer.selectRandomImages(sampleImages, 5);
      const ids = result.map(img => img.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should throw error for empty pool', () => {
      expect(() => {
        ImageRandomizer.selectRandomImages([], 5);
      }).toThrow('Image pool cannot be empty');
    });

    it('should throw error for count <= 0', () => {
      expect(() => {
        ImageRandomizer.selectRandomImages(sampleImages, 0);
      }).toThrow('Count must be greater than 0');

      expect(() => {
        ImageRandomizer.selectRandomImages(sampleImages, -1);
      }).toThrow('Count must be greater than 0');
    });

    it('should return different selections on multiple calls (probabilistic)', () => {
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        const selection = ImageRandomizer.selectRandomImages(sampleImages, 5);
        results.push(selection.map(img => img.id).sort().join(','));
      }
      
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('balanceDifficulty', () => {
    it('should return empty array for empty input', () => {
      const result = ImageRandomizer.balanceDifficulty([]);
      expect(result).toEqual([]);
    });

    it('should maintain all input images', () => {
      const result = ImageRandomizer.balanceDifficulty(sampleImages);
      
      expect(result).toHaveLength(sampleImages.length);
      sampleImages.forEach(image => {
        expect(result.some(r => r.id === image.id)).toBe(true);
      });
    });

    it('should order images by difficulty progression', () => {
      const result = ImageRandomizer.balanceDifficulty(sampleImages);
      
      // Check that difficulties are in non-decreasing order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].difficulty).toBeGreaterThanOrEqual(result[i - 1].difficulty);
      }
    });

    it('should distribute difficulty levels evenly', () => {
      const result = ImageRandomizer.balanceDifficulty(sampleImages);
      
      // Count images per difficulty level
      const difficultyCounts = new Map<number, number>();
      result.forEach(image => {
        const count = difficultyCounts.get(image.difficulty) || 0;
        difficultyCounts.set(image.difficulty, count + 1);
      });
      
      // Should have 2 images per difficulty level (5 levels, 10 images total)
      Array.from(difficultyCounts.values()).forEach(count => {
        expect(count).toBe(2);
      });
    });

    it('should handle uneven distribution gracefully', () => {
      // Create uneven distribution: 3 easy, 2 medium, 1 hard
      const unevenImages: GameImage[] = [
        { id: 1, url: 'url1', answer: 'easy1', difficulty: 1 },
        { id: 2, url: 'url2', answer: 'easy2', difficulty: 1 },
        { id: 3, url: 'url3', answer: 'easy3', difficulty: 1 },
        { id: 4, url: 'url4', answer: 'medium1', difficulty: 2 },
        { id: 5, url: 'url5', answer: 'medium2', difficulty: 2 },
        { id: 6, url: 'url6', answer: 'hard1', difficulty: 3 },
      ];
      
      const result = ImageRandomizer.balanceDifficulty(unevenImages);
      
      expect(result).toHaveLength(6);
      // Should still maintain difficulty progression
      for (let i = 1; i < result.length; i++) {
        expect(result[i].difficulty).toBeGreaterThanOrEqual(result[i - 1].difficulty);
      }
    });

    it('should handle single difficulty level', () => {
      const singleDifficulty: GameImage[] = [
        { id: 1, url: 'url1', answer: 'test1', difficulty: 2 },
        { id: 2, url: 'url2', answer: 'test2', difficulty: 2 },
        { id: 3, url: 'url3', answer: 'test3', difficulty: 2 },
      ];
      
      const result = ImageRandomizer.balanceDifficulty(singleDifficulty);
      
      expect(result).toHaveLength(3);
      result.forEach(image => {
        expect(image.difficulty).toBe(2);
      });
    });

    it('should randomize within difficulty groups', () => {
      // Create images with same difficulty to test randomization within groups
      const sameDifficultyImages: GameImage[] = [
        { id: 1, url: 'url1', answer: 'test1', difficulty: 1 },
        { id: 2, url: 'url2', answer: 'test2', difficulty: 1 },
        { id: 3, url: 'url3', answer: 'test3', difficulty: 1 },
        { id: 4, url: 'url4', answer: 'test4', difficulty: 2 },
        { id: 5, url: 'url5', answer: 'test5', difficulty: 2 },
        { id: 6, url: 'url6', answer: 'test6', difficulty: 2 },
      ];
      
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = ImageRandomizer.balanceDifficulty(sameDifficultyImages);
        results.push(result.map(img => img.id).join(','));
      }
      
      // Should produce different orders (probabilistic test)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('Integration tests', () => {
    it('should work with selectRandomImages and balanceDifficulty together', () => {
      const selected = ImageRandomizer.selectRandomImages(sampleImages, 6);
      const balanced = ImageRandomizer.balanceDifficulty(selected);
      
      expect(balanced).toHaveLength(6);
      
      // Should maintain difficulty progression
      for (let i = 1; i < balanced.length; i++) {
        expect(balanced[i].difficulty).toBeGreaterThanOrEqual(balanced[i - 1].difficulty);
      }
      
      // All images should be from the selected set
      balanced.forEach(image => {
        expect(selected.some(s => s.id === image.id)).toBe(true);
      });
    });

    it('should handle edge case with very small image pool', () => {
      const tinyPool: GameImage[] = [
        { id: 1, url: 'url1', answer: 'test', difficulty: 1 }
      ];
      
      const selected = ImageRandomizer.selectRandomImages(tinyPool, 3);
      const balanced = ImageRandomizer.balanceDifficulty(selected);
      
      expect(balanced).toHaveLength(3);
      balanced.forEach(image => {
        expect(image.id).toBe(1);
        expect(image.difficulty).toBe(1);
      });
    });
  });
});
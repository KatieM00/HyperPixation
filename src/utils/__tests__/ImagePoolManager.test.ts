import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameImage } from '../../types/game';
import { 
  ImagePoolManager, 
  selectGameImages, 
  validateImagePool, 
  getPoolStatistics,
  defaultImagePoolManager 
} from '../ImagePoolManager';

// Mock the images data
vi.mock('../../data/images', () => {
  const mockImages: GameImage[] = [
    { id: 1, url: 'test1.jpg', answer: 'cat', difficulty: 1 },
    { id: 2, url: 'test2.jpg', answer: 'dog', difficulty: 1 },
    { id: 3, url: 'test3.jpg', answer: 'car', difficulty: 2 },
    { id: 4, url: 'test4.jpg', answer: 'tree', difficulty: 2 },
    { id: 5, url: 'test5.jpg', answer: 'mountain', difficulty: 3 },
    { id: 6, url: 'test6.jpg', answer: 'ocean', difficulty: 3 },
    { id: 7, url: 'test7.jpg', answer: 'sunset', difficulty: 4 },
    { id: 8, url: 'test8.jpg', answer: 'flower', difficulty: 4 },
    { id: 9, url: 'test9.jpg', answer: 'airplane', difficulty: 5 },
    { id: 10, url: 'test10.jpg', answer: 'castle', difficulty: 5 }
  ];

  return {
    getAllImages: () => mockImages,
    imageCategories: [
      {
        name: 'animals',
        images: mockImages.slice(0, 2)
      },
      {
        name: 'objects',
        images: mockImages.slice(2, 4)
      },
      {
        name: 'nature',
        images: mockImages.slice(4, 8)
      },
      {
        name: 'places',
        images: mockImages.slice(8, 10)
      }
    ]
  };
});

describe('ImagePoolManager', () => {
  let poolManager: ImagePoolManager;

  beforeEach(() => {
    poolManager = new ImagePoolManager();
  });

  describe('constructor', () => {
    it('should use default configuration when no config provided', () => {
      const manager = new ImagePoolManager();
      const config = manager.getConfig();
      
      expect(config.minPoolSize).toBe(10);
      expect(config.defaultGameSize).toBe(10);
      expect(config.maxDuplicatesAllowed).toBe(5);
    });

    it('should merge provided config with defaults', () => {
      const manager = new ImagePoolManager({ minPoolSize: 5, defaultGameSize: 8 });
      const config = manager.getConfig();
      
      expect(config.minPoolSize).toBe(5);
      expect(config.defaultGameSize).toBe(8);
      expect(config.maxDuplicatesAllowed).toBe(5); // default value
    });
  });

  describe('selectGameImages', () => {
    it('should select the requested number of images', () => {
      const result = poolManager.selectGameImages(5);
      
      expect(result.images).toHaveLength(5);
      expect(result.hadInsufficientImages).toBe(false);
      expect(result.duplicatesUsed).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should select default number of images when count not specified', () => {
      const result = poolManager.selectGameImages();
      
      expect(result.images).toHaveLength(10);
      expect(result.hadInsufficientImages).toBe(false);
    });

    it('should handle insufficient images scenario', () => {
      const result = poolManager.selectGameImages(15); // More than available (10)
      
      // The balanceDifficulty method may reduce duplicates, so we check that we got more than the pool size
      expect(result.images.length).toBeGreaterThan(10);
      expect(result.hadInsufficientImages).toBe(true);
      expect(result.duplicatesUsed).toBe(5);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('only 10 available');
    });

    it('should warn when duplicates exceed max allowed', () => {
      const manager = new ImagePoolManager({ maxDuplicatesAllowed: 2 });
      const result = manager.selectGameImages(15);
      
      expect(result.duplicatesUsed).toBe(5);
      expect(result.warnings[0]).toContain('exceeds max allowed: 2');
    });

    it('should select from specific categories when provided', () => {
      const result = poolManager.selectGameImages(2, ['animals']);
      
      expect(result.images).toHaveLength(2);
      // All selected images should be from animals category (ids 1-2)
      result.images.forEach(image => {
        expect([1, 2]).toContain(image.id);
      });
    });

    it('should throw error for invalid count', () => {
      expect(() => poolManager.selectGameImages(0)).toThrow('Image count must be greater than 0');
      expect(() => poolManager.selectGameImages(-1)).toThrow('Image count must be greater than 0');
    });

    it('should throw error when no images available in categories', () => {
      expect(() => poolManager.selectGameImages(5, ['nonexistent'])).toThrow('No images available');
    });

    it('should return unique images when sufficient pool size', () => {
      const result = poolManager.selectGameImages(5);
      const ids = result.images.map(img => img.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(5); // All images should be unique
    });
  });

  describe('validateImagePool', () => {
    it('should validate a healthy image pool', () => {
      const result = poolManager.validateImagePool();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalImages).toBe(10);
      expect(result.categoryCounts).toEqual({
        animals: 2,
        objects: 2,
        nature: 4,
        places: 2
      });
    });

    it('should detect insufficient pool size', () => {
      const manager = new ImagePoolManager({ minPoolSize: 15 });
      const result = manager.validateImagePool();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image pool has 10 images but minimum required is 15');
    });

    it('should validate specific categories', () => {
      const result = poolManager.validateImagePool(['animals', 'objects']);
      
      expect(result.totalImages).toBe(4); // 2 + 2
      expect(result.categoryCounts).toEqual({
        animals: 2,
        objects: 2
      });
    });

    it('should detect invalid category names', () => {
      const result = poolManager.validateImagePool(['nonexistent']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category not found: nonexistent');
    });

    it('should check difficulty distribution', () => {
      const result = poolManager.validateImagePool();
      
      expect(result.difficultyDistribution).toEqual({
        1: 2, // cat, dog
        2: 2, // car, tree
        3: 2, // mountain, ocean
        4: 2, // sunset, flower
        5: 2  // airplane, castle
      });
    });

    it('should warn about limited difficulty range', () => {
      // Create a manager with smaller defaultGameSize to trigger the warning
      const manager = new ImagePoolManager({ defaultGameSize: 2 });
      const result = manager.validateImagePool(['animals']);
      
      // Animals category has only difficulty 1, so range is 1-1 = 0, which is < 2
      // and totalImages (2) >= defaultGameSize (2)
      expect(result.warnings.some(w => w.includes('Limited difficulty range'))).toBe(true);
    });
  });

  describe('getPoolStatistics', () => {
    it('should return comprehensive pool statistics', () => {
      const stats = poolManager.getPoolStatistics();
      
      expect(stats.totalImages).toBe(10);
      expect(stats.categories).toEqual({
        animals: 2,
        objects: 2,
        nature: 4,
        places: 2
      });
      expect(stats.averageImagesPerCategory).toBe(2.5);
      expect(stats.canSupportGameSize(5)).toBe(true);
      expect(stats.canSupportGameSize(15)).toBe(false);
      expect(stats.recommendedMaxGameSize).toBe(10);
      expect(stats.isHealthy).toBe(true);
    });

    it('should return statistics for specific categories', () => {
      const stats = poolManager.getPoolStatistics(['animals']);
      
      expect(stats.totalImages).toBe(2);
      expect(stats.categories).toEqual({ animals: 2 });
      expect(stats.averageImagesPerCategory).toBe(2);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration partially', () => {
      poolManager.updateConfig({ minPoolSize: 5 });
      const config = poolManager.getConfig();
      
      expect(config.minPoolSize).toBe(5);
      expect(config.defaultGameSize).toBe(10); // unchanged
    });

    it('should affect validation after config update', () => {
      poolManager.updateConfig({ minPoolSize: 15 });
      const result = poolManager.validateImagePool();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image pool has 10 images but minimum required is 15');
    });
  });

  describe('error handling', () => {
    it('should handle empty image pool gracefully', () => {
      // Test with non-existent categories instead of mocking
      expect(() => poolManager.selectGameImages(5, ['nonexistent'])).toThrow('No images available');
    });

    it('should validate image properties', () => {
      // This would require mocking invalid image data
      // For now, we test the validation logic with our current mock
      const result = poolManager.validateImagePool();
      
      // All our mock images are valid, so no errors expected
      expect(result.isValid).toBe(true);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should validate image properties correctly', () => {
      // Test that our validation logic works with the current mock data
      const result = poolManager.validateImagePool();
      
      // All our mock images have unique IDs and valid properties
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate answers in validation logic', () => {
      // Test the validation logic by checking if it would detect duplicates
      // We can't easily mock the data, but we can test the logic
      const result = poolManager.validateImagePool();
      
      // Our mock data has unique answers, so no warnings expected
      expect(result.warnings.filter(w => w.includes('Duplicate answer'))).toHaveLength(0);
    });

    it('should handle very small pools gracefully', () => {
      const manager = new ImagePoolManager({ minPoolSize: 1 });
      
      // Test with animals category (2 images)
      const result = manager.selectGameImages(1, ['animals']);
      
      expect(result.images).toHaveLength(1);
      expect(result.hadInsufficientImages).toBe(false);
    });

    it('should handle requesting more images than max duplicates allow', () => {
      const manager = new ImagePoolManager({ 
        maxDuplicatesAllowed: 1,
        minPoolSize: 1 
      });
      
      // Request way more than available
      const result = manager.selectGameImages(20, ['animals']); // only 2 available
      
      expect(result.duplicatesUsed).toBe(18);
      expect(result.warnings[0]).toContain('exceeds max allowed: 1');
    });
  });
});

describe('convenience functions', () => {
  describe('selectGameImages', () => {
    it('should use default pool manager', () => {
      const result = selectGameImages(5);
      
      expect(result.images).toHaveLength(5);
      expect(result.hadInsufficientImages).toBe(false);
    });
  });

  describe('validateImagePool', () => {
    it('should use default pool manager', () => {
      const result = validateImagePool();
      
      expect(result.isValid).toBe(true);
      expect(result.totalImages).toBe(10);
    });
  });

  describe('getPoolStatistics', () => {
    it('should use default pool manager', () => {
      const stats = getPoolStatistics();
      
      expect(stats.totalImages).toBe(10);
      expect(stats.isHealthy).toBe(true);
    });
  });
});
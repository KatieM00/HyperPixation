import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllImages, getRandomGameImages, gameImages, imageCategories } from '../images';

describe('Image Data Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have organized image categories', () => {
    expect(imageCategories).toBeDefined();
    expect(imageCategories.length).toBeGreaterThan(0);
    
    // Check that we have the expected categories
    const categoryNames = imageCategories.map(c => c.name);
    expect(categoryNames).toContain('animals');
    expect(categoryNames).toContain('objects');
    expect(categoryNames).toContain('nature');
  });

  it('should have expanded image pool with more than 10 images', () => {
    const allImages = getAllImages();
    expect(allImages.length).toBeGreaterThan(10);
    expect(allImages.length).toBeGreaterThanOrEqual(30); // Design requirement
  });

  it('should maintain backward compatibility with gameImages', () => {
    expect(gameImages).toBeDefined();
    expect(gameImages.length).toBe(10);
    expect(gameImages[0].answer).toBe('dog');
    expect(gameImages[1].answer).toBe('cat');
  });

  it('should have getAllImages function that returns all images', () => {
    const allImages = getAllImages();
    expect(Array.isArray(allImages)).toBe(true);
    
    // Verify it includes images from all categories
    const totalFromCategories = imageCategories.reduce((sum, cat) => sum + cat.images.length, 0);
    expect(allImages.length).toBe(totalFromCategories);
  });

  it('should have getRandomGameImages function', () => {
    const randomImages = getRandomGameImages(5);
    expect(Array.isArray(randomImages)).toBe(true);
    expect(randomImages.length).toBe(5);
    
    // Verify all returned images are valid GameImage objects
    randomImages.forEach(img => {
      expect(img).toHaveProperty('id');
      expect(img).toHaveProperty('url');
      expect(img).toHaveProperty('answer');
      expect(img).toHaveProperty('difficulty');
    });
  });

  it('should handle edge case when requesting more images than available', () => {
    const allImages = getAllImages();
    const requestedCount = allImages.length + 10;
    const randomImages = getRandomGameImages(requestedCount);
    
    // New behavior: function should return the requested count by duplicating images
    expect(randomImages.length).toBe(requestedCount);
    
    // Verify that all original images are included
    const originalIds = allImages.map(img => img.id);
    const returnedIds = randomImages.map(img => img.id);
    originalIds.forEach(id => {
      expect(returnedIds).toContain(id);
    });
  });

  it('should have proper difficulty distribution', () => {
    const allImages = getAllImages();
    const difficulties = allImages.map(img => img.difficulty);
    
    // Should have images across different difficulty levels
    const uniqueDifficulties = [...new Set(difficulties)];
    expect(uniqueDifficulties.length).toBeGreaterThan(1);
    expect(Math.min(...difficulties)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...difficulties)).toBeLessThanOrEqual(5);
  });

  it('should have unique image IDs', () => {
    const allImages = getAllImages();
    const ids = allImages.map(img => img.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(uniqueIds.length).toBe(allImages.length);
  });

  it('should include original images in the expanded pool', () => {
    const allImages = getAllImages();
    const originalAnswers = gameImages.map(img => img.answer);
    
    originalAnswers.forEach(answer => {
      const found = allImages.some(img => img.answer === answer);
      expect(found).toBe(true);
    });
  });
});

describe('Randomization Feature Comprehensive Tests', () => {
  describe('Multiple Session Randomization', () => {
    it('should produce different sequences across multiple calls', () => {
      const sequences: string[] = [];
      const numTests = 20;
      
      for (let i = 0; i < numTests; i++) {
        const randomImages = getRandomGameImages(10);
        const sequence = randomImages.map(img => img.id).join(',');
        sequences.push(sequence);
      }
      
      // Should have multiple unique sequences
      const uniqueSequences = new Set(sequences);
      expect(uniqueSequences.size).toBeGreaterThan(1);
      
      // With good randomization, should have significant variation
      expect(uniqueSequences.size).toBeGreaterThanOrEqual(Math.min(5, numTests / 4));
    });

    it('should maintain consistent image quality across randomized selections', () => {
      for (let session = 0; session < 10; session++) {
        const randomImages = getRandomGameImages(10);
        
        randomImages.forEach((image, index) => {
          // Each image should be valid
          expect(image.id).toBeDefined();
          expect(typeof image.id).toBe('number');
          expect(image.url).toBeDefined();
          expect(typeof image.url).toBe('string');
          expect(image.url.length).toBeGreaterThan(0);
          expect(image.answer).toBeDefined();
          expect(typeof image.answer).toBe('string');
          expect(image.answer.trim().length).toBeGreaterThan(0);
          expect(image.difficulty).toBeDefined();
          expect(typeof image.difficulty).toBe('number');
          expect(image.difficulty).toBeGreaterThanOrEqual(1);
          expect(image.difficulty).toBeLessThanOrEqual(5);
        });
      }
    });

    it('should provide good difficulty distribution across sessions', () => {
      const sessionDifficulties: number[][] = [];
      
      // Generate multiple sessions
      for (let session = 0; session < 10; session++) {
        const randomImages = getRandomGameImages(10);
        const difficulties = randomImages.map(img => img.difficulty);
        sessionDifficulties.push(difficulties);
      }
      
      // Analyze each session
      sessionDifficulties.forEach((difficulties, sessionIndex) => {
        // Should have reasonable difficulty spread
        const uniqueDifficulties = new Set(difficulties);
        expect(uniqueDifficulties.size).toBeGreaterThanOrEqual(2);
        
        // Average difficulty should be reasonable
        const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;
        expect(avgDifficulty).toBeGreaterThan(1);
        expect(avgDifficulty).toBeLessThan(5);
        
        // Should not be all the same difficulty
        expect(difficulties.every(d => d === difficulties[0])).toBe(false);
      });
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle requesting zero images', () => {
      const result = getRandomGameImages(0);
      expect(result).toEqual([]);
    });

    it('should handle requesting negative number of images', () => {
      const result = getRandomGameImages(-5);
      expect(result).toEqual([]);
    });

    it('should handle requesting exactly the pool size', () => {
      const allImages = getAllImages();
      const result = getRandomGameImages(allImages.length);
      
      expect(result).toHaveLength(allImages.length);
      
      // Should contain all images from the pool
      const allIds = allImages.map(img => img.id).sort();
      const resultIds = result.map(img => img.id).sort();
      expect(resultIds).toEqual(allIds);
    });

    it('should handle requesting more images than pool size by duplicating', () => {
      const allImages = getAllImages();
      const requestCount = allImages.length + 10;
      const result = getRandomGameImages(requestCount);
      
      expect(result).toHaveLength(requestCount);
      
      // Should contain all original images
      const originalIds = allImages.map(img => img.id);
      const resultIds = result.map(img => img.id);
      
      originalIds.forEach(id => {
        expect(resultIds).toContain(id);
      });
      
      // Should have some duplicates
      const uniqueResultIds = new Set(resultIds);
      expect(uniqueResultIds.size).toBeLessThan(result.length);
    });

    it('should handle very large requests efficiently', () => {
      const startTime = performance.now();
      
      const result = getRandomGameImages(1000);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // Should complete quickly
      
      // All images should be valid
      result.forEach(image => {
        expect(image.id).toBeDefined();
        expect(image.answer).toBeDefined();
        expect(image.difficulty).toBeGreaterThanOrEqual(1);
        expect(image.difficulty).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Randomization Quality', () => {
    it('should not produce the same sequence repeatedly', () => {
      const sequences = new Set<string>();
      const attempts = 50;
      
      for (let i = 0; i < attempts; i++) {
        const randomImages = getRandomGameImages(10);
        const sequence = randomImages.map(img => img.id).join(',');
        sequences.add(sequence);
      }
      
      // Should have good variety (at least 25% unique sequences)
      expect(sequences.size).toBeGreaterThanOrEqual(attempts * 0.25);
    });

    it('should distribute images fairly across multiple selections', () => {
      const allImages = getAllImages();
      const imageUsageCount = new Map<number, number>();
      
      // Initialize usage counts
      allImages.forEach(img => {
        imageUsageCount.set(img.id, 0);
      });
      
      // Generate many selections
      const numSelections = 100;
      for (let i = 0; i < numSelections; i++) {
        const randomImages = getRandomGameImages(10);
        randomImages.forEach(img => {
          const currentCount = imageUsageCount.get(img.id) || 0;
          imageUsageCount.set(img.id, currentCount + 1);
        });
      }
      
      // Check distribution fairness
      const usageCounts = Array.from(imageUsageCount.values());
      const avgUsage = usageCounts.reduce((sum, count) => sum + count, 0) / usageCounts.length;
      const expectedUsage = (numSelections * 10) / allImages.length;
      
      // Average usage should be close to expected
      expect(Math.abs(avgUsage - expectedUsage)).toBeLessThan(expectedUsage * 0.5);
      
      // No image should be completely unused (with this many selections)
      expect(usageCounts.every(count => count > 0)).toBe(true);
    });

    it('should maintain randomness with different request sizes', () => {
      const requestSizes = [1, 3, 5, 8, 10, 15, 20];
      
      requestSizes.forEach(size => {
        const sequences = new Set<string>();
        
        for (let i = 0; i < 10; i++) {
          const randomImages = getRandomGameImages(size);
          expect(randomImages).toHaveLength(size);
          
          const sequence = randomImages.map(img => img.id).join(',');
          sequences.add(sequence);
        }
        
        // Should have some variety even with smaller request sizes
        if (size >= 3) {
          expect(sequences.size).toBeGreaterThan(1);
        }
      });
    });
  });

  describe('Performance Requirements', () => {
    it('should complete randomization within time limits', () => {
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        getRandomGameImages(10);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      // Should average well under 1ms per call (requirement: under 100ms total)
      expect(avgTime).toBeLessThan(1);
    });

    it('should handle concurrent randomization requests', () => {
      const promises: Promise<any>[] = [];
      
      // Create multiple concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise(resolve => {
            const result = getRandomGameImages(10);
            resolve(result);
          })
        );
      }
      
      // All should complete successfully
      return Promise.all(promises).then(results => {
        results.forEach(result => {
          expect(result).toHaveLength(10);
          expect(Array.isArray(result)).toBe(true);
        });
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain original gameImages functionality', () => {
      // Original gameImages should still work exactly as before
      expect(gameImages).toBeDefined();
      expect(gameImages).toHaveLength(10);
      
      // Should have the original sequence
      expect(gameImages[0].answer).toBe('dog');
      expect(gameImages[1].answer).toBe('cat');
      expect(gameImages[2].answer).toBe('car');
      
      // All original properties should be intact
      gameImages.forEach((image, index) => {
        expect(image.id).toBe(index + 1);
        expect(image.url).toBeDefined();
        expect(image.answer).toBeDefined();
        expect(image.difficulty).toBeDefined();
      });
    });

    it('should include all original images in the expanded pool', () => {
      const allImages = getAllImages();
      const originalAnswers = gameImages.map(img => img.answer);
      
      // Every original image should be findable in the expanded pool
      originalAnswers.forEach(originalAnswer => {
        const found = allImages.some(img => img.answer === originalAnswer);
        expect(found).toBe(true);
      });
    });

    it('should preserve original image properties in expanded pool', () => {
      const allImages = getAllImages();
      
      gameImages.forEach(originalImage => {
        const foundImage = allImages.find(img => 
          img.answer === originalImage.answer && img.id === originalImage.id
        );
        expect(foundImage).toBeDefined();
        
        if (foundImage) {
          expect(foundImage.id).toBe(originalImage.id);
          expect(foundImage.url).toBe(originalImage.url);
          expect(foundImage.difficulty).toBe(originalImage.difficulty);
        }
      });
    });
  });
});
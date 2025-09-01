import { describe, it, expect } from 'vitest';
import { getAllImages, getRandomGameImages, gameImages, imageCategories } from '../images';

describe('Image Data Structure', () => {
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
    
    expect(randomImages.length).toBeLessThanOrEqual(allImages.length);
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
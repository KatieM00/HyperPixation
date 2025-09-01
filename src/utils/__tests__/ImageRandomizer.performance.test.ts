import { describe, it, expect } from 'vitest';
import { ImageRandomizer } from '../ImageRandomizer';
import { GameImage } from '../../types/game';

describe('ImageRandomizer Performance Tests', () => {
  it('should complete randomization within 100ms for typical game loads', () => {
    // Create a larger pool to simulate real-world usage
    const largePool: GameImage[] = [];
    for (let i = 1; i <= 100; i++) {
      largePool.push({
        id: i,
        url: `url${i}`,
        answer: `answer${i}`,
        difficulty: (i % 5) + 1
      });
    }

    const startTime = performance.now();
    
    // Perform typical game operations
    const selected = ImageRandomizer.selectRandomImages(largePool, 10);
    const balanced = ImageRandomizer.balanceDifficulty(selected);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(100); // Should complete within 100ms
    expect(balanced).toHaveLength(10);
  });

  it('should handle multiple rapid randomizations efficiently', () => {
    const pool: GameImage[] = [];
    for (let i = 1; i <= 50; i++) {
      pool.push({
        id: i,
        url: `url${i}`,
        answer: `answer${i}`,
        difficulty: (i % 5) + 1
      });
    }

    const startTime = performance.now();
    
    // Simulate multiple players getting different randomizations
    for (let i = 0; i < 10; i++) {
      const selected = ImageRandomizer.selectRandomImages(pool, 10);
      ImageRandomizer.balanceDifficulty(selected);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 10 randomizations should still be very fast
    expect(duration).toBeLessThan(50);
  });
});
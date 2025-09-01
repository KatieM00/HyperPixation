import { GameImage } from '../types/game';

/**
 * Utility class for randomizing and managing game images
 */
export class ImageRandomizer {
  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param array - Array to shuffle
   * @returns New shuffled array
   */
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Selects random images from a pool without duplicates
   * @param pool - Array of available images
   * @param count - Number of images to select
   * @returns Array of randomly selected images
   */
  static selectRandomImages(pool: GameImage[], count: number): GameImage[] {
    if (pool.length === 0) {
      throw new Error('Image pool cannot be empty');
    }

    if (count <= 0) {
      throw new Error('Count must be greater than 0');
    }

    // If we need more images than available, use all available and duplicate if necessary
    if (count > pool.length) {
      const result: GameImage[] = [...pool];
      const remaining = count - pool.length;
      
      // Fill remaining slots by cycling through the pool
      for (let i = 0; i < remaining; i++) {
        result.push(pool[i % pool.length]);
      }
      
      return this.shuffleArray(result);
    }

    // Select random images without duplicates
    const shuffled = this.shuffleArray(pool);
    return shuffled.slice(0, count);
  }

  /**
   * Balances difficulty distribution across selected images
   * Ensures good mix of difficulty levels throughout the game
   * @param images - Array of images to balance
   * @returns Array with balanced difficulty distribution
   */
  static balanceDifficulty(images: GameImage[]): GameImage[] {
    if (images.length === 0) {
      return images;
    }

    // Group images by difficulty level
    const difficultyGroups = new Map<number, GameImage[]>();
    images.forEach(image => {
      const difficulty = image.difficulty;
      if (!difficultyGroups.has(difficulty)) {
        difficultyGroups.set(difficulty, []);
      }
      difficultyGroups.get(difficulty)!.push(image);
    });

    // Sort difficulty levels
    const sortedDifficulties = Array.from(difficultyGroups.keys()).sort((a, b) => a - b);
    
    // Distribute images to create balanced progression
    const balanced: GameImage[] = [];
    const totalImages = images.length;
    
    // Calculate how many images per difficulty level for even distribution
    const imagesPerDifficulty = Math.floor(totalImages / sortedDifficulties.length);
    const remainder = totalImages % sortedDifficulties.length;
    
    // Distribute images from each difficulty level
    for (let i = 0; i < sortedDifficulties.length; i++) {
      const difficulty = sortedDifficulties[i];
      const group = difficultyGroups.get(difficulty)!;
      const shuffledGroup = this.shuffleArray(group);
      
      // Take base amount plus one extra for first 'remainder' difficulties
      const takeCount = imagesPerDifficulty + (i < remainder ? 1 : 0);
      const selected = shuffledGroup.slice(0, Math.min(takeCount, shuffledGroup.length));
      
      balanced.push(...selected);
    }

    // If we still need more images (edge case), fill from remaining
    while (balanced.length < totalImages) {
      const remaining = images.filter(img => !balanced.some(b => b.id === img.id));
      if (remaining.length === 0) break;
      balanced.push(remaining[0]);
    }

    // Sort by difficulty to create progression, then add some randomness within difficulty groups
    return this.createProgressiveOrder(balanced);
  }

  /**
   * Creates a progressive difficulty order with some randomness within groups
   * @param images - Images to order
   * @returns Progressively ordered images
   */
  private static createProgressiveOrder(images: GameImage[]): GameImage[] {
    // Group by difficulty
    const groups = new Map<number, GameImage[]>();
    images.forEach(image => {
      if (!groups.has(image.difficulty)) {
        groups.set(image.difficulty, []);
      }
      groups.get(image.difficulty)!.push(image);
    });

    // Sort difficulties and shuffle within each group
    const result: GameImage[] = [];
    const sortedDifficulties = Array.from(groups.keys()).sort((a, b) => a - b);
    
    sortedDifficulties.forEach(difficulty => {
      const group = groups.get(difficulty)!;
      const shuffledGroup = this.shuffleArray(group);
      result.push(...shuffledGroup);
    });

    return result;
  }
}
import { GameImage } from '../types/game';
import { ImageCategory, getAllImages, imageCategories } from '../data/images';
import { ImageRandomizer } from './ImageRandomizer';

/**
 * Configuration for image pool management
 */
export interface ImagePoolConfig {
  minPoolSize: number;
  defaultGameSize: number;
  maxDuplicatesAllowed: number;
}

/**
 * Result of image pool validation
 */
export interface ImagePoolValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalImages: number;
  categoryCounts: Record<string, number>;
  difficultyDistribution: Record<number, number>;
}

/**
 * Result of image selection operation
 */
export interface ImageSelectionResult {
  images: GameImage[];
  hadInsufficientImages: boolean;
  duplicatesUsed: number;
  warnings: string[];
}

/**
 * Manages image pool operations including selection, validation, and error handling
 */
export class ImagePoolManager {
  private static readonly DEFAULT_CONFIG: ImagePoolConfig = {
    minPoolSize: 10,
    defaultGameSize: 10,
    maxDuplicatesAllowed: 5
  };

  private config: ImagePoolConfig;

  constructor(config: Partial<ImagePoolConfig> = {}) {
    this.config = { ...ImagePoolManager.DEFAULT_CONFIG, ...config };
  }

  /**
   * Selects images for a game session with comprehensive error handling
   * @param count - Number of images to select
   * @param categories - Optional array of category names to select from
   * @returns ImageSelectionResult with selected images and metadata
   */
  selectGameImages(count: number = this.config.defaultGameSize, categories?: string[]): ImageSelectionResult {
    const result: ImageSelectionResult = {
      images: [],
      hadInsufficientImages: false,
      duplicatesUsed: 0,
      warnings: []
    };

    // Validate input
    if (count <= 0) {
      throw new Error('Image count must be greater than 0');
    }

    // Get available images
    const availableImages = this.getAvailableImages(categories);
    
    if (availableImages.length === 0) {
      throw new Error('No images available in the specified categories');
    }

    // Handle insufficient images scenario
    if (availableImages.length < count) {
      result.hadInsufficientImages = true;
      result.duplicatesUsed = count - availableImages.length;
      
      if (result.duplicatesUsed > this.config.maxDuplicatesAllowed) {
        result.warnings.push(
          `Requested ${count} images but only ${availableImages.length} available. ` +
          `Using ${result.duplicatesUsed} duplicates (exceeds max allowed: ${this.config.maxDuplicatesAllowed})`
        );
      } else {
        result.warnings.push(
          `Requested ${count} images but only ${availableImages.length} available. ` +
          `Using ${result.duplicatesUsed} duplicates.`
        );
      }
    }

    // Select images using ImageRandomizer
    try {
      result.images = ImageRandomizer.selectRandomImages(availableImages, count);
      
      // Apply difficulty balancing
      result.images = ImageRandomizer.balanceDifficulty(result.images);
      
    } catch (error) {
      throw new Error(`Failed to select images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validates the integrity of the image pool
   * @param categories - Optional array of category names to validate
   * @returns ImagePoolValidationResult with validation details
   */
  validateImagePool(categories?: string[]): ImagePoolValidationResult {
    const result: ImagePoolValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      totalImages: 0,
      categoryCounts: {},
      difficultyDistribution: {}
    };

    try {
      // Get images to validate
      const imagesToValidate = categories ? 
        this.getImagesByCategories(categories) : 
        getAllImages();

      result.totalImages = imagesToValidate.length;

      // Check minimum pool size
      if (result.totalImages < this.config.minPoolSize) {
        result.isValid = false;
        result.errors.push(
          `Image pool has ${result.totalImages} images but minimum required is ${this.config.minPoolSize}`
        );
      }

      // Validate individual images
      const seenIds = new Set<number>();
      const seenAnswers = new Set<string>();

      for (const image of imagesToValidate) {
        // Check for duplicate IDs
        if (seenIds.has(image.id)) {
          result.isValid = false;
          result.errors.push(`Duplicate image ID found: ${image.id}`);
        }
        seenIds.add(image.id);

        // Check for duplicate answers (warning only)
        if (seenAnswers.has(image.answer.toLowerCase())) {
          result.warnings.push(`Duplicate answer found: "${image.answer}"`);
        }
        seenAnswers.add(image.answer.toLowerCase());

        // Validate image properties
        if (!image.url || typeof image.url !== 'string') {
          result.isValid = false;
          result.errors.push(`Invalid URL for image ID ${image.id}`);
        }

        if (!image.answer || typeof image.answer !== 'string' || image.answer.trim().length === 0) {
          result.isValid = false;
          result.errors.push(`Invalid answer for image ID ${image.id}`);
        }

        if (typeof image.difficulty !== 'number' || image.difficulty < 1 || image.difficulty > 5) {
          result.isValid = false;
          result.errors.push(`Invalid difficulty for image ID ${image.id}: must be between 1 and 5`);
        }

        // Count difficulty distribution
        const difficulty = image.difficulty;
        result.difficultyDistribution[difficulty] = (result.difficultyDistribution[difficulty] || 0) + 1;
      }

      // Count images per category
      const categoriesToCheck = categories || imageCategories.map(cat => cat.name);
      for (const categoryName of categoriesToCheck) {
        const category = imageCategories.find(cat => cat.name === categoryName);
        if (category) {
          result.categoryCounts[categoryName] = category.images.length;
        } else {
          result.errors.push(`Category not found: ${categoryName}`);
          result.isValid = false;
        }
      }

      // Check difficulty distribution balance
      const difficultyLevels = Object.keys(result.difficultyDistribution).map(Number);
      if (difficultyLevels.length > 0) {
        const minDifficulty = Math.min(...difficultyLevels);
        const maxDifficulty = Math.max(...difficultyLevels);
        
        // Warn if difficulty range is too narrow
        if (maxDifficulty - minDifficulty < 2 && result.totalImages >= this.config.defaultGameSize) {
          result.warnings.push(
            `Limited difficulty range (${minDifficulty}-${maxDifficulty}). ` +
            'Consider adding images with varied difficulty levels.'
          );
        }

        // Warn if any difficulty level is severely underrepresented
        const avgImagesPerDifficulty = result.totalImages / difficultyLevels.length;
        for (const [difficulty, count] of Object.entries(result.difficultyDistribution)) {
          if (count < avgImagesPerDifficulty * 0.3) {
            result.warnings.push(
              `Difficulty level ${difficulty} has only ${count} images, ` +
              `which may cause poor distribution in games.`
            );
          }
        }
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Gets available images from specified categories or all categories
   * @param categories - Optional array of category names
   * @returns Array of available GameImage objects
   */
  private getAvailableImages(categories?: string[]): GameImage[] {
    if (!categories || categories.length === 0) {
      return getAllImages();
    }

    return this.getImagesByCategories(categories);
  }

  /**
   * Gets images from specific categories
   * @param categoryNames - Array of category names
   * @returns Array of GameImage objects from specified categories
   */
  private getImagesByCategories(categoryNames: string[]): GameImage[] {
    const images: GameImage[] = [];
    
    for (const categoryName of categoryNames) {
      const category = imageCategories.find(cat => cat.name === categoryName);
      if (category) {
        images.push(...category.images);
      }
    }

    return images;
  }

  /**
   * Gets statistics about the image pool
   * @param categories - Optional array of category names
   * @returns Object with pool statistics
   */
  getPoolStatistics(categories?: string[]) {
    const images = this.getAvailableImages(categories);
    const validation = this.validateImagePool(categories);

    return {
      totalImages: images.length,
      categories: validation.categoryCounts,
      difficultyDistribution: validation.difficultyDistribution,
      averageImagesPerCategory: Object.keys(validation.categoryCounts).length > 0 ? 
        images.length / Object.keys(validation.categoryCounts).length : 0,
      canSupportGameSize: (gameSize: number) => images.length >= gameSize,
      recommendedMaxGameSize: images.length,
      isHealthy: validation.isValid && validation.errors.length === 0
    };
  }

  /**
   * Updates the configuration for this pool manager
   * @param newConfig - Partial configuration to update
   */
  updateConfig(newConfig: Partial<ImagePoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration
   * @returns Current ImagePoolConfig
   */
  getConfig(): ImagePoolConfig {
    return { ...this.config };
  }
}

// Export a default instance for convenience
export const defaultImagePoolManager = new ImagePoolManager();

/**
 * Convenience function for selecting game images with default configuration
 * @param count - Number of images to select
 * @param categories - Optional array of category names
 * @returns ImageSelectionResult
 */
export function selectGameImages(count?: number, categories?: string[]): ImageSelectionResult {
  return defaultImagePoolManager.selectGameImages(count, categories);
}

/**
 * Convenience function for validating image pool with default configuration
 * @param categories - Optional array of category names
 * @returns ImagePoolValidationResult
 */
export function validateImagePool(categories?: string[]): ImagePoolValidationResult {
  return defaultImagePoolManager.validateImagePool(categories);
}

/**
 * Convenience function for getting pool statistics
 * @param categories - Optional array of category names
 * @returns Pool statistics object
 */
export function getPoolStatistics(categories?: string[]) {
  return defaultImagePoolManager.getPoolStatistics(categories);
}
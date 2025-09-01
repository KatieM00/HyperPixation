# Design Document

## Overview

This design implements image randomization for the HyperPixation game while preserving the existing architecture. The solution extends the current image system with a larger image pool and adds randomization logic to the game state management, ensuring each game session presents a unique sequence of images.

## Architecture

The randomization feature integrates into the existing React/TypeScript architecture without modifying component interfaces:

- **Preserve Current Structure**: All existing components (`GameScreen`, `PixelatedImage`, etc.) remain unchanged
- **Extend Image System**: Expand `src/data/images.ts` with additional images and add randomization utilities
- **Enhance Game State**: Add randomization logic to `useGameState` hook without changing the external API
- **Maintain Game Flow**: Keep the same 10-level progression with identical scoring and mechanics

## Components and Interfaces

### Image Data Structure (Extended)

```typescript
// Existing GameImage interface remains unchanged
export interface GameImage {
  id: number;
  url: string;
  answer: string;
  difficulty: number;
}

// New: Extended image pool with categories
export interface ImageCategory {
  name: string;
  images: GameImage[];
}

// New: Image pool structure
export interface ImagePool {
  categories: ImageCategory[];
  getAllImages(): GameImage[];
  getRandomSelection(count: number): GameImage[];
}
```

### Randomization Service

```typescript
// New utility for image randomization
export class ImageRandomizer {
  static shuffleArray<T>(array: T[]): T[];
  static selectRandomImages(pool: GameImage[], count: number): GameImage[];
  static balanceDifficulty(images: GameImage[]): GameImage[];
}
```

### Enhanced Game State (Internal Changes Only)

The `useGameState` hook will be enhanced internally while maintaining the same external interface:

- Add `selectedImages` to internal state (not exposed)
- Modify `startGame()` to randomize image selection
- Keep all existing return values and functions unchanged

## Data Models

### Expanded Image Directory

Create organized image categories in `src/data/images.ts`:

```typescript
export const imageCategories: ImageCategory[] = [
  {
    name: "animals",
    images: [
      { id: 1, url: "...", answer: "dog", difficulty: 1 },
      { id: 2, url: "...", answer: "cat", difficulty: 1 },
      // ... more animal images
    ]
  },
  {
    name: "objects",
    images: [
      { id: 11, url: "...", answer: "car", difficulty: 2 },
      { id: 12, url: "...", answer: "coffee", difficulty: 2 },
      // ... more object images
    ]
  },
  {
    name: "nature",
    images: [
      { id: 21, url: "...", answer: "mountain", difficulty: 3 },
      { id: 22, url: "...", answer: "sunset", difficulty: 4 },
      // ... more nature images
    ]
  }
];

// Maintain backward compatibility
export const gameImages: GameImage[] = getAllImages();
```

### Image Pool Management

```typescript
// New: Image pool with 30+ images across categories
const IMAGE_POOL_SIZE = 30; // Minimum pool size
const GAME_IMAGES_COUNT = 10; // Images per game session

export function getAllImages(): GameImage[] {
  return imageCategories.flatMap(category => category.images);
}

export function getRandomGameImages(): GameImage[] {
  const allImages = getAllImages();
  return ImageRandomizer.selectRandomImages(allImages, GAME_IMAGES_COUNT);
}
```

## Error Handling

### Insufficient Images
- **Scenario**: Pool has fewer than 10 images
- **Solution**: Use all available images and log warning
- **Fallback**: Duplicate images if necessary to reach 10

### Image Loading Failures
- **Scenario**: Random image fails to load
- **Solution**: Maintain existing error handling in `PixelatedImage` component
- **Fallback**: Skip to next image or use placeholder

### Randomization Errors
- **Scenario**: Randomization function fails
- **Solution**: Fall back to original sequential order
- **Logging**: Log error for debugging

## Testing Strategy

### Unit Tests
- Test `ImageRandomizer` utility functions
- Test image pool management functions
- Test randomization with various pool sizes
- Test difficulty balancing algorithm

### Integration Tests
- Test game state with randomized images
- Test complete game flow with random selection
- Test multiple game sessions produce different sequences

### Manual Testing
- Play multiple game sessions to verify randomization
- Test with different image pool sizes
- Verify all existing game mechanics work unchanged

## Implementation Approach

### Phase 1: Expand Image Pool
1. Add more images to existing categories
2. Create new image categories
3. Maintain existing `gameImages` export for compatibility

### Phase 2: Add Randomization Logic
1. Create `ImageRandomizer` utility class
2. Add image pool management functions
3. Implement difficulty balancing

### Phase 3: Integrate with Game State
1. Modify `useGameState` to use randomized images
2. Ensure external interface remains unchanged
3. Test integration with existing components

### Phase 4: Testing and Validation
1. Run comprehensive tests
2. Verify no breaking changes to existing functionality
3. Test randomization quality and performance
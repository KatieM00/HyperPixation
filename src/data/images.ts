import { GameImage } from '../types/game';

// Image category interface for organized structure
export interface ImageCategory {
  name: string;
  images: GameImage[];
}

// Organized image categories with expanded pool
export const imageCategories: ImageCategory[] = [
  {
    name: "animals",
    images: [
      {
        id: 1,
        url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
        answer: 'dog',
        difficulty: 1
      },
      {
        id: 2,
        url: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
        answer: 'cat',
        difficulty: 1
      },
      {
        id: 11,
        url: 'https://images.pexels.com/photos/326012/pexels-photo-326012.jpeg',
        answer: 'bird',
        difficulty: 1
      },
      {
        id: 12,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'fish',
        difficulty: 1
      },
      {
        id: 13,
        url: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg',
        answer: 'horse',
        difficulty: 2
      },
      {
        id: 14,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'rabbit',
        difficulty: 2
      },
      {
        id: 15,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'elephant',
        difficulty: 3
      },
      {
        id: 16,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'lion',
        difficulty: 3
      },
      {
        id: 17,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'butterfly',
        difficulty: 4
      },
      {
        id: 18,
        url: 'https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg',
        answer: 'penguin',
        difficulty: 4
      }
    ]
  },
  {
    name: "objects",
    images: [
      {
        id: 3,
        url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
        answer: 'car',
        difficulty: 2
      },
      {
        id: 4,
        url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        answer: 'coffee',
        difficulty: 2
      },
      {
        id: 10,
        url: 'https://images.pexels.com/photos/395196/pexels-photo-395196.jpeg',
        answer: 'airplane',
        difficulty: 5
      },
      {
        id: 19,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'laptop',
        difficulty: 4
      },
      {
        id: 20,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'book',
        difficulty: 1
      },
      {
        id: 21,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'phone',
        difficulty: 2
      },
      {
        id: 22,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'bicycle',
        difficulty: 3
      },
      {
        id: 23,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'guitar',
        difficulty: 3
      },
      {
        id: 24,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'camera',
        difficulty: 4
      },
      {
        id: 25,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'watch',
        difficulty: 5
      }
    ]
  },
  {
    name: "nature",
    images: [
      {
        id: 6,
        url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
        answer: 'mountain',
        difficulty: 3
      },
      {
        id: 8,
        url: 'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg',
        answer: 'sunset',
        difficulty: 4
      },
      {
        id: 9,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'flower',
        difficulty: 5
      },
      {
        id: 26,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'tree',
        difficulty: 1
      },
      {
        id: 27,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'ocean',
        difficulty: 2
      },
      {
        id: 28,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'forest',
        difficulty: 3
      },
      {
        id: 29,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'waterfall',
        difficulty: 4
      },
      {
        id: 30,
        url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
        answer: 'rainbow',
        difficulty: 5
      }
    ]
  },
  {
    name: "food",
    images: [
      {
        id: 7,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'pizza',
        difficulty: 4
      },
      {
        id: 31,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'apple',
        difficulty: 1
      },
      {
        id: 32,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'bread',
        difficulty: 2
      },
      {
        id: 33,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'cake',
        difficulty: 3
      },
      {
        id: 34,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'burger',
        difficulty: 3
      },
      {
        id: 35,
        url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
        answer: 'sushi',
        difficulty: 5
      }
    ]
  },
  {
    name: "places",
    images: [
      {
        id: 5,
        url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
        answer: 'city',
        difficulty: 3
      },
      {
        id: 36,
        url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
        answer: 'beach',
        difficulty: 2
      },
      {
        id: 37,
        url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
        answer: 'bridge',
        difficulty: 3
      },
      {
        id: 38,
        url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
        answer: 'castle',
        difficulty: 4
      },
      {
        id: 39,
        url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
        answer: 'lighthouse',
        difficulty: 5
      }
    ]
  }
];

/**
 * Get all images from all categories
 * @returns Array of all GameImage objects
 */
export function getAllImages(): GameImage[] {
  return imageCategories.flatMap(category => category.images);
}

/**
 * Get a random selection of images for a game session
 * Uses proper randomization with fallback for compatibility
 * @param count Number of images to select (default: 10)
 * @returns Array of randomly selected GameImage objects
 */
export function getRandomGameImages(count: number = 10): GameImage[] {
  // Handle invalid inputs
  if (count <= 0 || !Number.isFinite(count)) {
    return [];
  }

  const allImages = getAllImages();

  // Handle empty pool
  if (allImages.length === 0) {
    return [];
  }

  // Use Fisher-Yates shuffle algorithm for proper randomization
  const shuffled = [...allImages];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Handle case where more images are requested than available
  if (count > shuffled.length) {
    const result = [...shuffled];
    const remaining = count - shuffled.length;

    // Fill remaining slots by cycling through the pool
    for (let i = 0; i < remaining; i++) {
      result.push(shuffled[i % shuffled.length]);
    }

    return result;
  }

  return shuffled.slice(0, count);
}

// Maintain backward compatibility with existing gameImages export
// This preserves the original 10 images in their original order
export const gameImages: GameImage[] = [
  {
    id: 1,
    url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
    answer: 'dog',
    difficulty: 1
  },
  {
    id: 2,
    url: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg',
    answer: 'cat',
    difficulty: 1
  },
  {
    id: 3,
    url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    answer: 'car',
    difficulty: 2
  },
  {
    id: 4,
    url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    answer: 'coffee',
    difficulty: 2
  },
  {
    id: 5,
    url: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg',
    answer: 'city',
    difficulty: 3
  },
  {
    id: 6,
    url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    answer: 'mountain',
    difficulty: 3
  },
  {
    id: 7,
    url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    answer: 'pizza',
    difficulty: 4
  },
  {
    id: 8,
    url: 'https://images.pexels.com/photos/1851415/pexels-photo-1851415.jpeg',
    answer: 'sunset',
    difficulty: 4
  },
  {
    id: 9,
    url: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg',
    answer: 'flower',
    difficulty: 5
  },
  {
    id: 10,
    url: 'https://images.pexels.com/photos/395196/pexels-photo-395196.jpeg',
    answer: 'airplane',
    difficulty: 5
  }
];
// Quick test to verify image data structure
import { getAllImages, getRandomGameImages, gameImages, imageCategories } from './src/data/images.ts';

console.log('=== Image Pool Verification ===');
console.log('Total images in pool:', getAllImages().length);
console.log('Original gameImages length:', gameImages.length);
console.log('Categories:', imageCategories.map(c => `${c.name} (${c.images.length} images)`));

console.log('\n=== Sample Random Selection ===');
const randomSelection = getRandomGameImages(5);
console.log('Random selection (5):', randomSelection.map(img => `${img.answer} (diff: ${img.difficulty})`));

console.log('\n=== Difficulty Distribution ===');
const allImages = getAllImages();
const difficultyCount = {};
allImages.forEach(img => {
  difficultyCount[img.difficulty] = (difficultyCount[img.difficulty] || 0) + 1;
});
console.log('Difficulty distribution:', difficultyCount);

console.log('\n=== Backward Compatibility Check ===');
console.log('Original gameImages still available:', gameImages.length === 10);
console.log('First image still dog:', gameImages[0].answer === 'dog');
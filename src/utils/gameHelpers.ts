export const calculateScore = (guessNumber: number): number => {
  return Math.max(0, 6 - guessNumber);
};

export const getMaxPossibleScore = (): number => {
  return 50; // 10 levels × 5 points max per level
};

export const formatTime = (seconds: number): string => {
  return `${seconds}s`;
};

export const getEncouragingMessage = (score: number, level: number): string => {
  const messages = [
    "Great guess!",
    "You're on fire!",
    "Excellent work!",
    "Keep it up!",
    "Amazing!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const generateHint = (answer: string, revealedLetters: number[] = []): number[] => {
  // Remove spaces and convert to lowercase for processing
  const cleanAnswer = answer.toLowerCase().replace(/\s+/g, '');
  
  // If no letters revealed yet, reveal 2-3 letters depending on word length
  if (revealedLetters.length === 0) {
    const numToReveal = cleanAnswer.length <= 4 ? 1 : cleanAnswer.length <= 8 ? 2 : 3;
    const positions: number[] = [];
    
    // Get unique letter positions (avoid revealing the same letter multiple times)
    const availablePositions = Array.from({ length: answer.length }, (_, i) => i)
      .filter(i => answer[i] !== ' '); // Don't reveal spaces
    
    while (positions.length < numToReveal && availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const position = availablePositions[randomIndex];
      
      // Check if this letter is already revealed
      const letter = answer[position].toLowerCase();
      const alreadyRevealed = positions.some(pos => answer[pos].toLowerCase() === letter);
      
      if (!alreadyRevealed) {
        positions.push(position);
      }
      
      availablePositions.splice(randomIndex, 1);
    }
    
    return positions.sort((a, b) => a - b);
  }
  
  return revealedLetters;
};

export const getHintDisplay = (answer: string, revealedLetters: number[]): string => {
  return answer
    .split('')
    .map((char, index) => {
      if (char === ' ') return ' ';
      return revealedLetters.includes(index) ? char : '_';
    })
    .join('');
};
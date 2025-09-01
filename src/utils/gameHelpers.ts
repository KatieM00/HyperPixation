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
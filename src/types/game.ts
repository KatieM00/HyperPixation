export interface GameImage {
  id: number;
  url: string;
  answer: string;
  difficulty: number;
}

export interface GameState {
  currentLevel: number;
  currentGuess: number;
  score: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  timeRemaining: number;
  showTimer: boolean;
  currentImage: GameImage | null;
  guessHistory: string[];
  levelResults: LevelResult[];
  showUnblurred: boolean;
}

export interface LevelResult {
  level: number;
  correct: boolean;
  guessNumber: number;
  pointsEarned: number;
}

export type GameScreen = 'start' | 'playing' | 'end';
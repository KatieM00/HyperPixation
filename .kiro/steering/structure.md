# Project Structure

## Root Level
- `src/` - Main application source code
- `index.html` - Entry HTML file with "HyperPixation" title
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript project references

## Source Organization (`src/`)

### Core Application
- `main.tsx` - React app entry point with StrictMode
- `App.tsx` - Main app component with screen routing logic
- `index.css` - Global styles and Tailwind imports

### Components (`src/components/`)
- `StartScreen.tsx` - Game start screen
- `GameScreen.tsx` - Main gameplay interface
- `EndScreen.tsx` - Game completion screen
- `PixelatedImage.tsx` - Image pixelation component
- `ProgressBar.tsx` - Progress visualization

### Game Logic (`src/hooks/`)
- `useGameState.ts` - Main game state management hook
- `__tests__/` - Hook-specific tests

### Data Layer (`src/data/`)
- `images.ts` - Game image data and randomization logic
- `pexels_images_150.csv` - Source image data
- `__tests__/` - Data layer tests

### Utilities (`src/utils/`)
- `gameHelpers.ts` - Game utility functions
- `index.ts` - Utility exports
- `__tests__/` - Utility tests

### Types (`src/types/`)
- `game.ts` - TypeScript interfaces for game state and data

## Architecture Patterns

### State Management
- Custom hooks for game logic (`useGameState`)
- React state for UI components
- No external state management library

### Component Structure
- Functional components with TypeScript
- Props interfaces defined inline or imported from types
- Screen-based component organization

### Testing Strategy
- Co-located test files in `__tests__` directories
- Integration tests for game flow
- Unit tests for utilities and data functions
- Performance and randomization validation tests

## Naming Conventions
- PascalCase for components and types
- camelCase for functions and variables
- kebab-case for CSS classes (Tailwind utilities)
- Descriptive file names matching component/function names
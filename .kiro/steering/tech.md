# Technology Stack

## Core Technologies
- **React 18.3.1** - UI framework with hooks and functional components
- **TypeScript 5.5.3** - Type safety and development experience
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework

## Testing & Quality
- **Vitest 3.2.4** - Unit and integration testing
- **@testing-library/react 16.3.0** - React component testing utilities
- **ESLint 9.9.1** - Code linting with TypeScript support
- **jsdom 26.1.0** - DOM environment for testing

## UI Libraries
- **lucide-react 0.344.0** - Icon library for UI elements

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## Configuration Notes
- Vite config excludes lucide-react from optimization
- Global test environment with jsdom
- PostCSS with Autoprefixer for CSS processing
- TypeScript project references for app and node configs
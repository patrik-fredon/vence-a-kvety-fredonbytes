# Suggested Commands

## Development Commands
```bash
npm run dev              # Start development server with hot reload
npm run build           # Build optimized production bundle
npm run start           # Start production server
npm run clean           # Clean build artifacts and cache
```

## Code Quality Commands
```bash
npm run lint            # Run Biome linting checks
npm run lint:fix        # Fix auto-fixable linting issues
npm run format          # Format code with Biome
npm run type-check      # Run TypeScript type checking
npm run test:all        # Run all tests and quality checks (recommended before commits)
```

## Testing Commands
```bash
npm run test            # Run unit tests with Jest
npm run test:watch      # Run tests in watch mode (for development)
npm run test:coverage   # Generate test coverage report
npm run test:e2e        # Run end-to-end tests with Playwright
npm run test:e2e:ui     # Run E2E tests with Playwright UI
```

## Performance & Analysis Commands
```bash
npm run analyze         # Analyze bundle size with Next.js analyzer
npm run analyze:bundle  # Detailed bundle analysis
npm run benchmark       # Run performance benchmarks
npm run test:bundle-regression  # Check for bundle size regressions
npm run optimize:exports        # Optimize barrel exports for tree-shaking
```

## Database & Deployment Commands
```bash
npm run db:migrate      # Run database migrations
npm run db:seed:funeral # Seed funeral-specific sample data
npm run deploy          # Deploy to production
npm run deploy:preview  # Deploy preview environment
npm run deploy:verify   # Verify deployment configuration
```

## Internationalization Commands
```bash
npm run i18n:validate   # Validate translation files
npm run i18n:template   # Generate translation templates
```

## System Commands (Linux)
```bash
ls -la                  # List files with details
find . -name "*.tsx"    # Find TypeScript React files
grep -r "searchterm"    # Search in files recursively
git status              # Check git status
git add .               # Stage all changes
git commit -m "message" # Commit changes
```

## Most Important Commands for Daily Development
1. `npm run dev` - Start development
2. `npm run test:all` - Run all quality checks before commits
3. `npm run lint:fix` - Fix code style issues
4. `npm run type-check` - Verify TypeScript types
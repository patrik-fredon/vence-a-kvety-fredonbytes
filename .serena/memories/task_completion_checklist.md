# Task Completion Checklist

## When a Task is Completed, ALWAYS Run:

### 1. Code Quality Checks (MANDATORY)
```bash
npm run type-check      # Verify TypeScript types
npm run lint            # Check for linting issues
npm run lint:fix        # Fix auto-fixable issues
npm run format          # Format code consistently
```

### 2. Testing (REQUIRED)
```bash
npm run test            # Run unit tests
npm run test:coverage   # Check test coverage (70% minimum)
```

### 3. Build Verification (CRITICAL)
```bash
npm run build           # Ensure production build works
```

### 4. Accessibility Validation (MANDATORY for this project)
- Automated: jest-axe tests included in unit tests
- Manual: Check keyboard navigation and screen reader compatibility
- WCAG 2.1 AA compliance is required (elderly users)

### 5. Internationalization Check (REQUIRED)
```bash
npm run i18n:validate   # Validate translation files
```
- Verify both Czech and English translations work
- Test language switching functionality
- Check currency and date formatting

### 6. Performance Check (RECOMMENDED)
```bash
npm run analyze:bundle  # Check bundle size
npm run benchmark       # Performance benchmarks
```

### 7. E2E Testing (for major features)
```bash
npm run test:e2e        # Run end-to-end tests
```

## Special Considerations for Funeral Context

### Content Review (CRITICAL)
- Verify all user-facing text is respectful and empathetic
- Check color palette matches funeral-appropriate design (muted tones)
- Ensure no casual or celebratory language is used
- Validate error messages are compassionate

### Accessibility Extra Checks (MANDATORY)
- Test with screen readers (elderly users)
- Verify keyboard navigation works completely
- Check high contrast mode compatibility
- Test font scaling up to 200%

### Security & GDPR (REQUIRED)
- Verify CSRF protection is in place
- Check rate limiting on API endpoints
- Validate input sanitization
- Ensure GDPR compliance for data handling

## Git Workflow
```bash
git add .
git commit -m "descriptive message"
git push
```

## Quality Gates
- All tests must pass
- TypeScript must compile without errors
- Biome linting must pass
- Build must succeed
- Accessibility tests must pass
- Translation validation must pass
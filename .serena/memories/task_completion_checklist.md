# Task Completion Checklist

## Before Completing Any Task
1. **Code Quality Checks**
   - Run `npm run lint` to check for linting issues
   - Run `npm run lint:fix` to auto-fix issues
   - Run `npm run type-check` to verify TypeScript types
   - Run `npm run format` to ensure consistent formatting

2. **Testing**
   - Run `npm run test` to ensure all tests pass
   - Add new tests if implementing new functionality
   - Verify accessibility compliance with existing tests

3. **Build Verification**
   - Run `npm run build` to ensure production build works
   - Check for any build warnings or errors

4. **Performance Checks**
   - Verify no unnecessary re-renders
   - Check bundle size impact if significant changes
   - Ensure proper image optimization

5. **Accessibility Verification**
   - Test keyboard navigation
   - Verify screen reader compatibility
   - Check color contrast ratios
   - Ensure proper ARIA labels

6. **Responsive Design**
   - Test on mobile, tablet, and desktop breakpoints
   - Verify touch interactions on mobile devices
   - Check layout consistency across screen sizes

7. **Internationalization**
   - Test with both Czech and English locales
   - Verify proper text rendering and layout
   - Check currency and date formatting

## Documentation Updates
- Update component documentation if interfaces change
- Add JSDoc comments for new functions
- Update README if new features are added

## Git Workflow
- Create descriptive commit messages
- Ensure all changes are properly staged
- Consider creating feature branch for larger changes
# SignUpForm Biome Linting Fixes - January 10, 2025

## Summary
Fixed all Biome linting and TypeScript errors in `src/components/auth/SignUpForm.tsx` following a recent edit that changed object property access from dot notation to bracket notation.

## Issues Fixed

### 1. `noExplicitAny` Errors (18 instances)
**Problem**: Code was using `(formData as any)` type assertions throughout the component.

**Root Cause**: The formData state was properly typed, but the code was unnecessarily casting it to `any`.

**Solution**: Removed all `as any` casts and used direct property access on the typed `formData` object.

```typescript
// Before
if (!(formData as any).email) {
  errors['email'] = "E-mail je povinný";
}

// After
if (!formData.email) {
  errors.email = "E-mail je povinný";
}
```

### 2. `useLiteralKeys` Errors (13 instances)
**Problem**: Using bracket notation (`errors['email']`) instead of dot notation (`errors.email`).

**Solution**: Changed all bracket notation to dot notation for object property access.

```typescript
// Before
errors['email'] = "E-mail je povinný";
validationErrors['name'] || ""

// After
errors.email = "E-mail je povinný";
validationErrors.name || ""
```

### 3. `useUniqueElementIds` Errors (5 instances)
**Problem**: Using static string IDs for form inputs, which could cause duplicate IDs if the component is rendered multiple times.

**Solution**: Used React's `useId()` hook to generate unique IDs.

```typescript
// Added at component level
const formId = useId();

// Changed all Input components
<Input id={`${formId}-name`} ... />
<Input id={`${formId}-email`} ... />
<Input id={`${formId}-phone`} ... />
<Input id={`${formId}-password`} ... />
<Input id={`${formId}-confirmPassword`} ... />
```

### 4. `noSvgWithoutTitle` Error (1 instance)
**Problem**: SVG element lacked accessibility attributes.

**Solution**: Added `role="img"`, `aria-label`, and `<title>` element for screen readers.

```typescript
// Before
<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">

// After
<svg
  className="h-5 w-5 text-red-400"
  viewBox="0 0 20 20"
  fill="currentColor"
  role="img"
  aria-label="Error icon"
>
  <title>Error</title>
```

### 5. TypeScript TS4111 Errors (10 instances)
**Problem**: Using `Record<string, string>` created an index signature that required bracket notation access due to `exactOptionalPropertyTypes` TypeScript setting.

**Solution**: Defined explicit interfaces instead of using `Record` type.

```typescript
// Added interfaces
interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

// Changed state type
const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

// Fixed dynamic key access in handleChange
const fieldName = e.target.name as keyof ValidationErrors;
if (validationErrors[fieldName]) {
  setValidationErrors((prev) => ({
    ...prev,
    [fieldName]: undefined,
  }));
}
```

## Verification

### Biome Linting
```bash
npm run lint -- src/components/auth/SignUpForm.tsx
# Result: Checked 1 file in 4ms. No fixes applied.
```

### TypeScript Type Checking
```bash
npm run type-check 2>&1 | grep "SignUpForm"
# Result: No TypeScript errors in SignUpForm
```

## Key Takeaways

1. **Avoid `as any` casts**: They disable type checking and trigger linting errors. Use proper typing instead.

2. **Use dot notation for known properties**: Bracket notation should only be used for dynamic keys or when required by TypeScript.

3. **Use `useId()` for form IDs**: Prevents duplicate ID issues when components are reused.

4. **Accessibility matters**: Always add proper ARIA attributes and titles to SVG elements.

5. **Prefer explicit interfaces over `Record` types**: When using strict TypeScript settings like `exactOptionalPropertyTypes`, explicit interfaces provide better type safety and avoid index signature issues.

6. **Type dynamic keys properly**: When accessing object properties dynamically, cast the key to the appropriate type (`as keyof InterfaceName`).

## Files Modified
- `src/components/auth/SignUpForm.tsx`

## Related Patterns
This fix follows the same pattern used in other auth components and should be applied consistently across:
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/components/auth/UserProfile.tsx`
- Any other forms with validation errors

# Ribbon Configurator Dropdown Refactor

**Date:** 2025-10-09
**Component:** `src/components/product/RibbonConfigurator.tsx`

## Changes Made

Refactored the RibbonConfigurator component to improve UX by converting ribbon text selection from radio buttons to a dropdown menu.

### 1. Text Selection - Dropdown Implementation

**Before:** Radio button grid for text options
**After:** Styled dropdown (select element)

```typescript
<select
  id={`${textOption.id}-select`}
  value={getCurrentCustomization(textOption.id)?.choiceIds[0] || ""}
  onChange={(e) => handleChoiceSelection(textOption.id, e.target.value, textOption)}
  className={cn(
    "w-full p-3 border rounded-lg transition-colors",
    "border-amber-300 bg-amber-100 text-teal-800",
    "hover:border-teal-800 hover:shadow-sm",
    "focus:ring-2 focus:ring-teal-800 focus:border-teal-800 focus:outline-none"
  )}
>
  <option value="" disabled>
    {locale === "cs" ? "Vyberte text stuhy..." : "Select ribbon text..."}
  </option>
  {(textOption.choices || []).map((choice) => (
    <option key={choice.id} value={choice.id}>
      {choice.label[locale as keyof typeof choice.label]}
      {choice.priceModifier !== 0 && ` (${formatPriceModifier(choice.priceModifier)})`}
    </option>
  ))}
</select>
```

### 2. Custom Text Input - Conditional Display

**Updated:** `renderCustomTextInput` function signature
- Changed from `(option, choice)` to `(option)` only
- Now determines which choice is selected internally
- Only displays when selected choice has `allowCustomInput: true`

```typescript
const renderCustomTextInput = useCallback(
  (option: CustomizationOption) => {
    const currentCustomization = getCurrentCustomization(option.id);
    const selectedChoiceId = currentCustomization?.choiceIds[0];
    const selectedChoice = option.choices?.find((c) => c.id === selectedChoiceId);
    const value = currentCustomization?.customValue || "";

    // Only show if a choice with allowCustomInput is selected
    if (!selectedChoice?.allowCustomInput) {
      return null;
    }
    // ... rest of implementation
  }
);
```

### 3. Choice Selection Logic Enhancement

Updated `handleChoiceSelection` to clear custom value when switching from custom to predefined option:

```typescript
// Clear custom value when selecting predefined option (not custom)
const selectedChoice = option.choices?.find((c) => c.id === choiceId);
if (!selectedChoice?.allowCustomInput && existing.customValue) {
  delete existing.customValue;
}
```

### 4. Color Selection - Unchanged

Color selection remains as radio buttons (single-select) as it works well for visual color choices.

## Benefits

1. **Cleaner UI:** Dropdown takes less vertical space than radio button list
2. **Better UX:** Standard dropdown pattern for text selection
3. **Conditional Input:** Custom text input only appears when "Custom" is selected
4. **Consistent Styling:** Dropdown matches project's teal/amber color scheme
5. **Accessibility:** Proper ARIA attributes and labels maintained

## Styling

- Background: `bg-amber-100`
- Border: `border-amber-300` (hover: `border-teal-800`)
- Text: `text-teal-800`
- Focus ring: `focus:ring-teal-800`
- Transitions for smooth interactions

## Validation

- TypeScript diagnostics: Clean (no errors)
- All functionality preserved
- Accessibility attributes maintained

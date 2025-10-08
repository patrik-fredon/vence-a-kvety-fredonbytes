# List View 50/50 Layout with Quick View Button - October 8, 2025

## Summary
Redesigned ProductCard list view to have a 50/50 split layout with image on left half and content (name, price, quick view button, stock status) on right half.

## Changes Made

### ProductCard.tsx

#### 1. Card Height (getCardStyles)
**Before:** `h-48 sm:h-56`
**After:** `h-56 sm:h-64 md:h-72`
- Increased height for better visual balance
- Responsive heights for different screen sizes

#### 2. Image Container (getImageContainerStyles)
**Before:** `w-32 sm:w-40 md:w-48` (fixed widths)
**After:** `w-1/2` (50% width)
- Image now takes exactly half the card width
- Removed rounded-l-lg (handled by parent)
- Maintains full height

#### 3. Content Container (getContentStyles)
**Before:** `flex-1 min-w-0 p-4`
**After:** `w-1/2 p-4 sm:p-6`
- Content now takes exactly half the card width
- Increased padding on larger screens
- Maintains flex column layout

#### 4. Product Name Styling
**Before:** `text-sm sm:text-base mb-1 truncate`
**After:** `text-base sm:text-lg md:text-xl mb-2 line-clamp-2`
- Larger, more prominent text
- Shows up to 2 lines instead of truncating to 1
- Better readability

#### 5. Price Styling
**Before:** `text-sm sm:text-base mb-2`
**After:** `text-lg sm:text-xl mb-3`
- Larger price display
- Increased bottom margin for spacing

#### 6. Quick View Button Integration
**Before:** Small icon-only button in price section
**After:** Full button with icon and text in action section
- Moved from renderPrice to renderActionButton
- Shows icon + "Quick View" text
- Placed next to Add to Cart/Customize button
- Uses flex-1 to share space equally with primary action

#### 7. Action Button Layout
**Before:** Single button, no container styling
**After:** `flex gap-2` container with two buttons
- Quick View and primary action side by side
- Equal width distribution
- Consistent gap spacing

#### 8. List View Rendering
**Before:** Image wrapped in Link, separate from content
**After:** Image and content as sibling divs, no Link wrapper
- Cleaner 50/50 split structure
- Image div takes left half
- Content div takes right half
- Removed unnecessary Link wrapper from image

## Layout Structure

### List View Card Structure
```
┌─────────────────────────────────────────┐
│  Image (50%)  │  Content (50%)          │
│               │  ┌──────────────────┐   │
│               │  │ Product Name     │   │
│               │  │ (2 lines max)    │   │
│               │  └──────────────────┘   │
│               │                          │
│               │  Price: $XX.XX           │
│               │                          │
│               │  ● In Stock              │
│               │                          │
│               │  ┌────────┬──────────┐  │
│               │  │Add Cart│Quick View│  │
│               │  └────────┴──────────┘  │
└─────────────────────────────────────────┘
```

## Responsive Behavior

### Mobile (< 640px)
- Card height: 224px (h-56)
- Name: text-base
- Price: text-lg
- Padding: p-4

### Tablet (640px - 768px)
- Card height: 256px (h-64)
- Name: text-lg
- Price: text-xl
- Padding: p-6

### Desktop (≥ 768px)
- Card height: 288px (h-72)
- Name: text-xl
- Price: text-xl
- Padding: p-6

## Grid Layout (2 columns on md+)
With the 50/50 card layout and 2-column grid:
- Each card is self-contained
- Image and content are balanced
- Quick view is easily accessible
- Better use of horizontal space

## Benefits
1. **Visual Balance**: 50/50 split creates harmonious layout
2. **Better Readability**: Larger text for name and price
3. **Improved UX**: Quick view button is prominent and labeled
4. **Responsive**: Adapts to different screen sizes
5. **Consistent**: Matches design system colors and spacing
6. **Accessible**: Clear button labels and proper ARIA attributes

## Testing Recommendations
1. Test on mobile (< 640px) - verify single column grid
2. Test on tablet/desktop (≥ 768px) - verify 2-column grid
3. Check image aspect ratio and cropping
4. Verify button interactions (Add to Cart, Quick View)
5. Test with long product names (should clamp to 2 lines)
6. Verify hover states on both buttons
7. Check accessibility with keyboard navigation

## Files Modified
- src/components/product/ProductCard.tsx

## Related Memories
- list_view_2_column_responsive_layout_2025_10_08
- lazy_product_quick_view_implementation_2025_10_08

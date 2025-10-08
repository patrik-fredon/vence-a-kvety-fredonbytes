# Product Card Image Debugging - Investigation 2025-10-08

## Issue Description
Product images from Supabase database are not displaying in ProductCard component on the `/products` page, despite:
- Images being loaded correctly in ProductReferencesSection (home page)
- Valid image URLs in the database
- Images array present in product data

## Console Log Analysis
From the provided console log:
```javascript
{
  id: '606a6b5c-f3c1-4286-991b-c79403f617f5',
  nameCs: 'Plné srdce',
  nameEn: 'Full heart',
  slug: 'full-hearth-wreath',
  images: [Array],  // ← Images exist but not showing
  // ... other fields
}
```

## Comparison: ProductReferencesSection vs ProductCard

### ProductReferencesSection (WORKING)
**File:** `src/components/layout/ProductReferencesSection.tsx`

**Image Handling:**
```tsx
// Transform function extracts primary image
const transformProductToReference = (product: Product, locale: string) => {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  
  return {
    image: primaryImage ? {
      src: primaryImage.url,  // ← Direct URL access
      alt: primaryImage.alt,
      width: primaryImage.width || 400,
      height: primaryImage.height || 400,
    } : fallbackImage,
  };
};

// Renders with Next.js Image directly
<Image
  src={currentImageSrc}  // ← Direct src prop
  alt={product.image.alt}
  width={product.image.width || 400}
  height={product.image.height || 400}
/>
```

### ProductCard (NOT WORKING)
**File:** `src/components/product/ProductCard.tsx`

**Image Handling:**
```tsx
// Gets primary image from product
const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

// Creates display object
const displayPrimaryImage = primaryImage || {
  url: resolvedPrimaryImage.url,
  alt: resolvedPrimaryImage.alt,
  isPrimary: resolvedPrimaryImage.isPrimary,
  id: "fallback",
  sortOrder: 0,
};

// Renders through ProductImageHover wrapper
<ProductImageHover
  primaryImage={displayPrimaryImage}  // ← Passes full image object
  secondaryImage={secondaryImage}
  productName={product.name[locale]}
  locale={locale}
  fill
  sizes="..."
/>
```

## Key Differences

### 1. Image Component Chain
- **ProductReferencesSection**: `Product → Image (direct)`
- **ProductCard**: `Product → ProductImageHover → ProductImage`

### 2. Image Data Structure
- **ProductReferencesSection**: Transforms to `{ src, alt, width, height }`
- **ProductCard**: Passes full `ProductImage` type with `{ url, alt, isPrimary, id, sortOrder }`

### 3. Rendering Approach
- **ProductReferencesSection**: Direct Next.js Image with `src` prop
- **ProductCard**: ProductImage component expects `image.url` property

## Potential Issues

### Issue 1: Z-Index Stacking (FIXED)
- **Status**: ✅ RESOLVED
- **Fix**: Adjusted z-index values (Image: z-10, Overlays: z-20, Info: z-30)
- **Result**: Images should now be visible if data is correct

### Issue 2: Image Data Structure (INVESTIGATING)
- **Status**: 🔍 INVESTIGATING
- **Hypothesis**: The `primaryImage` object might not have the correct structure expected by ProductImage component
- **Action**: Added debug logging to inspect actual image data

## Debug Logging Added

**Location:** `src/components/product/ProductCard.tsx` (after line 52)

```tsx
// Debug logging to check image data
useEffect(() => {
  console.log("ProductCard Debug:", {
    productId: product.id,
    productName: product.name,
    hasImages: !!product.images,
    imagesLength: product.images?.length,
    primaryImage: primaryImage ? {
      id: primaryImage.id,
      url: primaryImage.url,
      isPrimary: primaryImage.isPrimary,
    } : null,
    secondaryImage: secondaryImage ? {
      id: secondaryImage.id,
      url: secondaryImage.url,
      isPrimary: secondaryImage.isPrimary,
    } : null,
    displayPrimaryImage: displayPrimaryImage ? {
      url: displayPrimaryImage.url,
      isPrimary: displayPrimaryImage.isPrimary,
    } : null,
  });
}, [product.id]);
```

## Testing Instructions

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Navigate to Products Page
- Czech: http://localhost:3000/cs/products
- English: http://localhost:3000/en/products

### Step 3: Open Browser DevTools
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for "ProductCard Debug:" logs

### Step 4: Analyze Debug Output
Check the console logs for each product card:

**Expected Output (if data is correct):**
```javascript
ProductCard Debug: {
  productId: "606a6b5c-f3c1-4286-991b-c79403f617f5",
  productName: { cs: "Plné srdce", en: "Full heart" },
  hasImages: true,
  imagesLength: 2,  // or however many images
  primaryImage: {
    id: "some-uuid",
    url: "https://supabase-url/storage/...",  // ← Should be valid URL
    isPrimary: true
  },
  secondaryImage: {
    id: "some-uuid",
    url: "https://supabase-url/storage/...",
    isPrimary: false
  },
  displayPrimaryImage: {
    url: "https://supabase-url/storage/...",  // ← Should match primaryImage.url
    isPrimary: true
  }
}
```

**Problem Indicators:**
- `hasImages: false` → No images in product data
- `imagesLength: 0` → Empty images array
- `primaryImage: null` → No primary image found
- `url: undefined` or `url: null` → Image URL missing
- `url: "..."` but image still not visible → Check network tab for 404/403 errors

### Step 5: Check Network Tab
1. Go to Network tab in DevTools
2. Filter by "Img" or "Media"
3. Look for failed image requests (red status codes)
4. Check if image URLs are being requested
5. Verify response status (should be 200 OK)

### Step 6: Inspect Element
1. Right-click on a product card
2. Select "Inspect" or "Inspect Element"
3. Look for the `<img>` tag inside the card
4. Check if `src` attribute has a valid URL
5. Verify the image is not hidden by CSS (check computed styles)

## Possible Solutions

### Solution 1: If primaryImage.url is undefined
The image object structure might be different than expected. Check the actual database schema.

### Solution 2: If images array is empty
The product data might not be including images in the query. Check the API endpoint or database query.

### Solution 3: If URL is valid but image doesn't load
- Check Supabase storage permissions
- Verify CORS settings
- Check if URLs are publicly accessible
- Verify image files exist in storage

### Solution 4: If images load in ProductReferencesSection but not ProductCard
The ProductImage component might need adjustment to handle the image prop structure.

## Next Steps

1. **Run the debug logging** and share the console output
2. **Check the Network tab** for any failed image requests
3. **Inspect the DOM** to see if `<img>` tags have valid `src` attributes
4. **Compare** the working ProductReferencesSection with ProductCard behavior

Once we have the debug output, we can identify the exact issue and implement the appropriate fix.

## Related Files
- `src/components/product/ProductCard.tsx` - Main component (modified with debug logging)
- `src/components/product/ProductImageHover.tsx` - Image hover wrapper
- `src/components/product/ProductImage.tsx` - Base image component
- `src/components/layout/ProductReferencesSection.tsx` - Working reference implementation
- `src/lib/utils/product-image-utils.ts` - Image utility functions

## Status
🔍 **INVESTIGATING** - Debug logging added, awaiting test results to identify root cause.

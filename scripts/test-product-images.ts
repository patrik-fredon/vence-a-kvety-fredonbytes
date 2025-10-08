/**
 * Script to test product image rendering
 * 
 * This script:
 * 1. Fetches products from the database
 * 2. Transforms them using the same logic as the products page
 * 3. Checks if images are properly loaded
 * 4. Validates image URLs
 * 
 * Run with: npx tsx scripts/test-product-images.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import the transform function (simplified version for testing)
function transformProductRow(row: any) {
  // Parse images - handle both array and JSON string formats
  let images: any[] = [];
  try {
    if (Array.isArray(row.images)) {
      images = row.images;
    } else if (typeof row.images === 'string') {
      const parsed = JSON.parse(row.images);
      images = Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Failed to parse product images:', error);
    images = [];
  }

  return {
    id: row.id,
    name: {
      cs: row.name_cs,
      en: row.name_en
    },
    slug: row.slug,
    images,
    // ... other fields would be here
  };
}

async function testProductImages() {
  console.log('🧪 Testing product image rendering...\n');

  try {
    // Fetch products from database (same query as products page)
    const { data: productsData, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    if (!productsData || productsData.length === 0) {
      console.log('⚠️  No products found');
      return;
    }

    console.log('=== RAW SUPABASE DATA DEBUG ===');
    console.log('Raw products count:', productsData.length);
    
    if (productsData.length > 0) {
      const firstRaw = productsData[0];
      console.log('First raw product images column:', {
        images: firstRaw.images,
        imagesType: typeof firstRaw.images,
        isArray: Array.isArray(firstRaw.images),
        isNull: firstRaw.images === null,
        isUndefined: firstRaw.images === undefined
      });
    }
    console.log('=== RAW SUPABASE DATA DEBUG END ===\n');

    // Transform products
    const products = productsData.map((row) => {
      return transformProductRow(row);
    });

    console.log('=== PRODUCT IMAGE DEBUG START ===');
    console.log('Total products fetched:', products.length);
    
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product details:', {
        id: firstProduct?.id,
        name: firstProduct?.name,
        slug: firstProduct?.slug,
        imagesArray: firstProduct?.images,
        imagesLength: firstProduct?.images?.length,
        imagesType: typeof firstProduct?.images,
        isArray: Array.isArray(firstProduct?.images)
      });
      
      // Log each image in the array
      if (firstProduct?.images && Array.isArray(firstProduct.images)) {
        console.log('Images in first product:');
        firstProduct.images.forEach((img: any, idx: number) => {
          console.log(`  Image ${idx}:`, {
            url: img?.url,
            isPrimary: img?.isPrimary,
            alt: img?.alt,
            urlValid: img?.url ? (img.url.startsWith('http') || img.url.startsWith('/')) : false
          });
        });
      } else {
        console.log('No images array found or images is not an array');
      }
    }
    
    console.log('=== PRODUCT IMAGE DEBUG END ===\n');

    // Test image selection logic
    console.log('=== IMAGE SELECTION LOGIC TEST ===');
    
    for (const product of products.slice(0, 3)) {
      console.log(`\nProduct: ${product.name.cs || product.name.en}`);
      
      if (!product.images || product.images.length === 0) {
        console.log('  ❌ No images - will show placeholder');
        continue;
      }

      // Find primary image
      const primaryImage = product.images.find((img: any) => img.isPrimary === true);
      
      if (primaryImage) {
        console.log('  ✅ Primary image found:', primaryImage.url);
      } else {
        console.log('  ⚠️  No primary image - using first image:', product.images[0]?.url);
      }

      // Check for secondary image (for hover effect)
      const secondaryImage = product.images.find((img: any) => img.isPrimary === false);
      if (secondaryImage) {
        console.log('  ✅ Secondary image found:', secondaryImage.url);
      } else {
        console.log('  ℹ️  No secondary image - hover effect will use same image');
      }
    }

    console.log('\n=== IMAGE SELECTION LOGIC TEST END ===\n');

    // Summary
    const productsWithImages = products.filter(p => p.images && p.images.length > 0).length;
    const productsWithoutImages = products.length - productsWithImages;
    const productsWithPrimary = products.filter(p => 
      p.images && p.images.some((img: any) => img.isPrimary === true)
    ).length;

    console.log('=== SUMMARY ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${productsWithoutImages}`);
    console.log(`Products with primary image: ${productsWithPrimary}`);

    if (productsWithImages === products.length) {
      console.log('\n✅ SUCCESS: All products have images!');
    } else {
      console.log(`\n⚠️  WARNING: ${productsWithoutImages} products have no images`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testProductImages()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

/**
 * Script to verify product images in the database
 *
 * This script checks:
 * 1. If products have images in the JSONB column
 * 2. If images have required fields (url, isPrimary, alt)
 * 3. If image URLs are valid and accessible
 *
 * Run with: npx tsx scripts/verify-product-images.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
config();

// Get environment variables
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

async function verifyProductImages() {
  console.log('🔍 Verifying product images in database...\n');

  try {
    // Query all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name_cs, name_en, slug, images, active')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying products:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No active products found in database');
      return;
    }

    console.log(`✅ Found ${products.length} active products\n`);

    // Statistics
    let productsWithImages = 0;
    let productsWithoutImages = 0;
    let productsWithPrimaryImage = 0;
    let totalImages = 0;
    let invalidImages = 0;

    // Check each product
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name_cs || product.name_en} ---`);
      console.log(`ID: ${product.id}`);
      console.log(`Slug: ${product.slug}`);
      console.log(`Images column type: ${typeof product.images}`);
      console.log(`Images column value:`, product.images);

      // Parse images
      let images: ProductImage[] = [];

      try {
        if (Array.isArray(product.images)) {
          images = product.images;
        } else if (typeof product.images === 'string') {
          const parsed = JSON.parse(product.images);
          images = Array.isArray(parsed) ? parsed : [];
        } else if (product.images === null || product.images === undefined) {
          console.log('⚠️  Images column is NULL or undefined');
        }
      } catch (error) {
        console.error('❌ Failed to parse images:', error);
        invalidImages++;
      }

      if (images.length > 0) {
        productsWithImages++;
        totalImages += images.length;
        console.log(`✅ Has ${images.length} image(s)`);

        // Check for primary image
        const hasPrimary = images.some(img => img.isPrimary === true);
        if (hasPrimary) {
          productsWithPrimaryImage++;
          console.log('✅ Has primary image');
        } else {
          console.log('⚠️  No primary image (will use first image)');
        }

        // Validate each image
        images.forEach((img, imgIndex) => {
          console.log(`\n  Image ${imgIndex + 1}:`);
          console.log(`    URL: ${img.url || 'MISSING'}`);
          console.log(`    Alt: ${img.alt || 'MISSING'}`);
          console.log(`    isPrimary: ${img.isPrimary || false}`);
          console.log(`    sortOrder: ${img.sortOrder || 'N/A'}`);

          // Validate required fields
          const hasUrl = !!img.url;
          const urlValid = img.url ? (img.url.startsWith('http') || img.url.startsWith('/')) : false;

          if (!hasUrl) {
            console.log('    ❌ Missing URL');
            invalidImages++;
          } else if (!urlValid) {
            console.log('    ⚠️  URL format may be invalid');
          } else {
            console.log('    ✅ URL looks valid');
          }
        });
      } else {
        productsWithoutImages++;
        console.log('❌ No images found');
      }
    });

    // Print summary
    console.log('\n\n=== SUMMARY ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${productsWithoutImages}`);
    console.log(`Products with primary image: ${productsWithPrimaryImage}`);
    console.log(`Total images: ${totalImages}`);
    console.log(`Invalid/problematic images: ${invalidImages}`);

    if (productsWithoutImages > 0) {
      console.log('\n⚠️  WARNING: Some products have no images. They will display placeholder images.');
    }

    if (invalidImages > 0) {
      console.log('\n❌ ERROR: Some images have invalid data. Please fix the database.');
    }

    if (productsWithImages > 0 && invalidImages === 0) {
      console.log('\n✅ SUCCESS: Database has valid image data!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the verification
verifyProductImages()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });

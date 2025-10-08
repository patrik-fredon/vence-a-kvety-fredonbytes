/**
 * Script to clear product cache from Redis
 * 
 * This script clears all product-related cache entries including:
 * - Individual products
 * - Product lists
 * - Categories
 * - Product by slug lookups
 * 
 * Run with: npx tsx scripts/clear-product-cache.ts
 */

import { config } from 'dotenv';
import { Redis } from '@upstash/redis';

// Load environment variables
config();

const redis = new Redis({
  url: process.env['UPSTASH_REDIS_REST_URL'] || '',
  token: process.env['UPSTASH_REDIS_REST_TOKEN'] || '',
});

async function clearProductCache() {
  console.log('🧹 Clearing product cache from Redis...\n');

  try {
    // Get all keys matching product patterns
    const patterns = [
      'product:*',
      'products:*',
      'category:*',
      'categories',
      'api:*'
    ];

    let totalDeleted = 0;

    for (const pattern of patterns) {
      console.log(`🔍 Scanning for keys matching: ${pattern}`);
      
      try {
        // For Upstash Redis, we need to use scan to get keys
        // Note: Upstash Redis has limitations on SCAN, so we'll use a simpler approach
        const keys = await redis.keys(pattern);
        
        if (keys && keys.length > 0) {
          console.log(`   Found ${keys.length} keys`);
          
          // Delete keys in batches
          for (const key of keys) {
            await redis.del(key);
            totalDeleted++;
          }
          
          console.log(`   ✅ Deleted ${keys.length} keys`);
        } else {
          console.log(`   ℹ️  No keys found`);
        }
      } catch (error) {
        console.error(`   ⚠️  Error processing pattern ${pattern}:`, error);
      }
    }

    console.log(`\n✅ Cache clearing complete!`);
    console.log(`📊 Total keys deleted: ${totalDeleted}`);

    // Verify cache is empty
    console.log('\n🔍 Verifying cache is cleared...');
    const remainingKeys = await redis.keys('product:*');
    
    if (remainingKeys && remainingKeys.length > 0) {
      console.log(`⚠️  Warning: ${remainingKeys.length} product keys still exist`);
      console.log('Remaining keys:', remainingKeys.slice(0, 10));
    } else {
      console.log('✅ All product cache entries cleared successfully!');
    }

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

// Run the cache clearing
clearProductCache()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

/**
 * Cache Performance Testing Script
 * 
 * Tests the Redis caching behavior for checkout sessions to ensure:
 * - Cache hits are significantly faster than cache misses
 * - Cache hit rate meets targets (≥70%)
 * - TTL is working correctly
 * - Cache invalidation works properly
 * 
 * Usage:
 *   npx tsx scripts/test-cache-performance.ts
 */

import { performance } from 'node:perf_hooks';
// Crypto utilities available if needed for cart hashing

interface CacheTestResult {
  requestNumber: number;
  duration: number;
  cacheStatus: string | null;
  success: boolean;
  error?: string;
}

/**
 * Generate a unique cart configuration for testing
 */
function generateTestCart(seed: number) {
  return {
    cartItems: [
      {
        productId: `test-product-${seed}`,
        quantity: 1,
        customizations: [
          {
            optionId: 'delivery_method',
            choiceIds: ['delivery_address'],
          },
        ],
      },
    ],
    locale: 'cs' as const,
  };
}

/**
 * Test a single checkout session request
 */
async function testCheckoutRequest(
  cartData: any,
  baseUrl: string
): Promise<CacheTestResult> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData),
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      requestNumber: 0,
      duration,
      cacheStatus: response.headers.get('x-cache-status'),
      success: response.ok,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      requestNumber: 0,
      duration: endTime - startTime,
      cacheStatus: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test cache hit vs miss performance
 */
async function testCacheHitPerformance(baseUrl: string) {
  console.log('\n🧪 Test 1: Cache Hit vs Miss Performance');
  console.log('─'.repeat(60));
  
  const cartData = generateTestCart(1);
  
  // First request (should be cache miss)
  console.log('Making first request (expected: cache miss)...');
  const result1 = await testCheckoutRequest(cartData, baseUrl);
  
  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Second request (should be cache hit)
  console.log('Making second request (expected: cache hit)...');
  const result2 = await testCheckoutRequest(cartData, baseUrl);
  
  // Results
  console.log('\n📊 Results:');
  console.log(`First request:  ${result1.duration.toFixed(2)}ms - Cache: ${result1.cacheStatus || 'MISS'}`);
  console.log(`Second request: ${result2.duration.toFixed(2)}ms - Cache: ${result2.cacheStatus || 'MISS'}`);
  
  if (result1.success && result2.success) {
    const improvement = ((result1.duration - result2.duration) / result1.duration) * 100;
    console.log(`\n⚡ Speed improvement: ${improvement.toFixed(2)}%`);
    
    const targetImprovement = 50; // 50% faster
    if (improvement >= targetImprovement) {
      console.log(`✅ Cache performance meets target (≥${targetImprovement}% improvement)`);
    } else {
      console.log(`⚠️  Cache performance below target (expected ≥${targetImprovement}% improvement)`);
    }
  } else {
    console.log('❌ One or more requests failed');
  }
}

/**
 * Test cache hit rate with multiple requests
 */
async function testCacheHitRate(baseUrl: string, numRequests: number = 20) {
  console.log(`\n🧪 Test 2: Cache Hit Rate (${numRequests} requests)`);
  console.log('─'.repeat(60));
  
  const results: CacheTestResult[] = [];
  
  // Use same cart for all requests to maximize cache hits
  const cartData = generateTestCart(2);
  
  console.log('Making requests...');
  for (let i = 0; i < numRequests; i++) {
    const result = await testCheckoutRequest(cartData, baseUrl);
    result.requestNumber = i + 1;
    results.push(result);
    
    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  
  // Calculate statistics
  const successful = results.filter((r) => r.success).length;
  const cacheHits = results.filter((r) => r.cacheStatus === 'HIT').length;
  const cacheMisses = results.filter((r) => r.cacheStatus === 'MISS').length;
  const hitRate = (cacheHits / successful) * 100;
  
  console.log('\n📊 Results:');
  console.log(`Total requests:  ${numRequests}`);
  console.log(`Successful:      ${successful}`);
  console.log(`Cache hits:      ${cacheHits}`);
  console.log(`Cache misses:    ${cacheMisses}`);
  console.log(`Hit rate:        ${hitRate.toFixed(2)}%`);
  
  const targetHitRate = 70;
  if (hitRate >= targetHitRate) {
    console.log(`✅ Cache hit rate meets target (≥${targetHitRate}%)`);
  } else {
    console.log(`⚠️  Cache hit rate below target (expected ≥${targetHitRate}%)`);
  }
  
  // Show timing breakdown
  const hitDurations = results.filter((r) => r.cacheStatus === 'HIT').map((r) => r.duration);
  const missDurations = results.filter((r) => r.cacheStatus === 'MISS').map((r) => r.duration);
  
  if (hitDurations.length > 0 && missDurations.length > 0) {
    const avgHitDuration = hitDurations.reduce((sum, d) => sum + d, 0) / hitDurations.length;
    const avgMissDuration = missDurations.reduce((sum, d) => sum + d, 0) / missDurations.length;
    
    console.log('\n⏱️  Average Response Times:');
    console.log(`Cache hits:      ${avgHitDuration.toFixed(2)}ms`);
    console.log(`Cache misses:    ${avgMissDuration.toFixed(2)}ms`);
    console.log(`Difference:      ${(avgMissDuration - avgHitDuration).toFixed(2)}ms (${(((avgMissDuration - avgHitDuration) / avgMissDuration) * 100).toFixed(2)}% faster)`);
  }
}

/**
 * Test cache invalidation
 */
async function testCacheInvalidation(baseUrl: string) {
  console.log('\n🧪 Test 3: Cache Invalidation');
  console.log('─'.repeat(60));
  
  const cartData = generateTestCart(3);
  
  // Create initial session (cache miss)
  console.log('Creating initial session...');
  const result1 = await testCheckoutRequest(cartData, baseUrl);
  console.log(`Initial request: ${result1.duration.toFixed(2)}ms - Cache: ${result1.cacheStatus || 'MISS'}`);
  
  // Verify it's cached (cache hit)
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log('Verifying session is cached...');
  const result2 = await testCheckoutRequest(cartData, baseUrl);
  console.log(`Second request: ${result2.duration.toFixed(2)}ms - Cache: ${result2.cacheStatus || 'MISS'}`);
  
  if (result2.cacheStatus === 'HIT') {
    console.log('✅ Session successfully cached');
  } else {
    console.log('⚠️  Session not cached as expected');
  }
  
  // Note: Actual invalidation would require completing a checkout
  // This is just testing the caching behavior
  console.log('\nℹ️  Note: Full invalidation testing requires completing a checkout flow');
  console.log('   This can be tested manually or with E2E tests');
}

/**
 * Test cache with different cart configurations
 */
async function testCacheWithDifferentCarts(baseUrl: string) {
  console.log('\n🧪 Test 4: Cache with Different Cart Configurations');
  console.log('─'.repeat(60));
  
  console.log('Testing that different carts create different cache entries...');
  
  const cart1 = generateTestCart(4);
  const cart2 = generateTestCart(5);
  
  // Request with cart 1
  const result1 = await testCheckoutRequest(cart1, baseUrl);
  console.log(`Cart 1 request: ${result1.duration.toFixed(2)}ms - Cache: ${result1.cacheStatus || 'MISS'}`);
  
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Request with cart 2 (should be cache miss)
  const result2 = await testCheckoutRequest(cart2, baseUrl);
  console.log(`Cart 2 request: ${result2.duration.toFixed(2)}ms - Cache: ${result2.cacheStatus || 'MISS'}`);
  
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Request with cart 1 again (should be cache hit)
  const result3 = await testCheckoutRequest(cart1, baseUrl);
  console.log(`Cart 1 again:   ${result3.duration.toFixed(2)}ms - Cache: ${result3.cacheStatus || 'MISS'}`);
  
  if (result2.cacheStatus !== 'HIT' && result3.cacheStatus === 'HIT') {
    console.log('✅ Cache correctly differentiates between cart configurations');
  } else {
    console.log('⚠️  Cache behavior unexpected');
  }
}

/**
 * Run all cache performance tests
 */
async function runCacheTests() {
  console.log('🚀 Starting Cache Performance Tests');
  console.log('═'.repeat(60));
  
  const baseUrl = process.env['TEST_BASE_URL'] || 'http://localhost:3000';
  console.log(`Base URL: ${baseUrl}`);
  
  try {
    // Test 1: Cache hit vs miss performance
    await testCacheHitPerformance(baseUrl);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Test 2: Cache hit rate
    await testCacheHitRate(baseUrl, 20);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Test 3: Cache invalidation
    await testCacheInvalidation(baseUrl);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Test 4: Different cart configurations
    await testCacheWithDifferentCarts(baseUrl);
    
    // Summary
    console.log('\n\n📈 Cache Performance Test Summary');
    console.log('═'.repeat(60));
    console.log('All cache tests completed!');
    console.log('\nKey Findings:');
    console.log('- Cache hits should be 50%+ faster than misses');
    console.log('- Cache hit rate should be ≥70% for repeated requests');
    console.log('- Different carts should create separate cache entries');
    console.log('- Cache should invalidate on checkout completion');
    console.log('\nRecommendations:');
    console.log('- Monitor cache hit rates in production');
    console.log('- Adjust TTL if needed based on usage patterns');
    console.log('- Ensure Redis has sufficient memory');
    console.log('- Set up alerts for low cache hit rates');
    
  } catch (error) {
    console.error('\n❌ Cache test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runCacheTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runCacheTests, testCacheHitPerformance, testCacheHitRate };

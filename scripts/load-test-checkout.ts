/**
 * Load Testing Script for Checkout Session Creation
 * 
 * Tests the performance and reliability of the checkout session creation
 * endpoint under various load conditions.
 * 
 * Usage:
 *   npx tsx scripts/load-test-checkout.ts
 */

import { performance } from 'node:perf_hooks';

// LoadTestResult interface for individual request results
// (used internally by testCheckoutSessionCreation)

interface LoadTestSummary {
  totalRequests: number;
  totalTime: number;
  successful: number;
  failed: number;
  cacheHits: number;
  averageDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  minDuration: number;
  maxDuration: number;
}

/**
 * Test checkout session creation with concurrent requests
 */
async function testCheckoutSessionCreation(
  concurrentRequests: number,
  baseUrl: string = 'http://localhost:3000'
): Promise<LoadTestSummary> {
  console.log(`\n🧪 Testing with ${concurrentRequests} concurrent requests...`);
  
  const startTime = performance.now();
  
  const promises = Array.from({ length: concurrentRequests }, async () => {
    const requestStart = performance.now();
    
    try {
      const response = await fetch(`${baseUrl}/api/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: [
            {
              productId: 'test-product-1',
              quantity: 1,
              customizations: [
                {
                  optionId: 'delivery_method',
                  choiceIds: ['delivery_address'],
                },
              ],
            },
          ],
          locale: 'cs',
        }),
      });
      
      const requestEnd = performance.now();
      const duration = requestEnd - requestStart;
      
      return {
        success: response.ok,
        status: response.status,
        duration,
        cached: response.headers.get('x-cache-status') === 'HIT',
      };
    } catch (error) {
      const requestEnd = performance.now();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: requestEnd - requestStart,
      };
    }
  });
  
  const results = await Promise.all(promises);
  const endTime = performance.now();
  
  // Calculate statistics
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const cacheHits = results.filter((r) => r.cached).length;
  
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  
  const summary: LoadTestSummary = {
    totalRequests: concurrentRequests,
    totalTime: endTime - startTime,
    successful,
    failed,
    cacheHits,
    averageDuration: totalDuration / concurrentRequests,
    p50Duration: durations[Math.floor(durations.length * 0.5)] || 0,
    p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
    p99Duration: durations[Math.floor(durations.length * 0.99)] || 0,
    minDuration: durations[0] || 0,
    maxDuration: durations[durations.length - 1] || 0,
  };
  
  return summary;
}

/**
 * Print load test summary
 */
function printSummary(summary: LoadTestSummary) {
  console.log('\n📊 Load Test Results:');
  console.log('─'.repeat(60));
  console.log(`Total Requests:      ${summary.totalRequests}`);
  console.log(`Total Time:          ${summary.totalTime.toFixed(2)}ms`);
  console.log(`Successful:          ${summary.successful} (${((summary.successful / summary.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Failed:              ${summary.failed} (${((summary.failed / summary.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Cache Hits:          ${summary.cacheHits} (${((summary.cacheHits / summary.totalRequests) * 100).toFixed(2)}%)`);
  console.log('\n⏱️  Response Times:');
  console.log(`Average:             ${summary.averageDuration.toFixed(2)}ms`);
  console.log(`Min:                 ${summary.minDuration.toFixed(2)}ms`);
  console.log(`Max:                 ${summary.maxDuration.toFixed(2)}ms`);
  console.log(`P50 (Median):        ${summary.p50Duration.toFixed(2)}ms`);
  console.log(`P95:                 ${summary.p95Duration.toFixed(2)}ms`);
  console.log(`P99:                 ${summary.p99Duration.toFixed(2)}ms`);
  console.log('─'.repeat(60));
  
  // Performance targets
  const successRateTarget = 95;
  const p95Target = 2000; // 2 seconds
  
  console.log('\n🎯 Performance Targets:');
  const successRate = (summary.successful / summary.totalRequests) * 100;
  const successRateMet = successRate >= successRateTarget;
  console.log(`Success Rate:        ${successRate.toFixed(2)}% ${successRateMet ? '✅' : '❌'} (target: ≥${successRateTarget}%)`);
  
  const p95Met = summary.p95Duration <= p95Target;
  console.log(`P95 Response Time:   ${summary.p95Duration.toFixed(2)}ms ${p95Met ? '✅' : '❌'} (target: ≤${p95Target}ms)`);
  
  if (successRateMet && p95Met) {
    console.log('\n✅ All performance targets met!');
  } else {
    console.log('\n⚠️  Some performance targets not met. Review results above.');
  }
}

/**
 * Run comprehensive load tests
 */
async function runLoadTests() {
  console.log('🚀 Starting Checkout Session Load Tests');
  console.log('═'.repeat(60));
  
  const baseUrl = process.env['TEST_BASE_URL'] || 'http://localhost:3000';
  console.log(`Base URL: ${baseUrl}`);
  
  try {
    // Test 1: Light load (10 concurrent requests)
    console.log('\n📝 Test 1: Light Load (10 concurrent requests)');
    const test1 = await testCheckoutSessionCreation(10, baseUrl);
    printSummary(test1);
    
    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Test 2: Medium load (50 concurrent requests)
    console.log('\n📝 Test 2: Medium Load (50 concurrent requests)');
    const test2 = await testCheckoutSessionCreation(50, baseUrl);
    printSummary(test2);
    
    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Test 3: Heavy load (100 concurrent requests)
    console.log('\n📝 Test 3: Heavy Load (100 concurrent requests)');
    const test3 = await testCheckoutSessionCreation(100, baseUrl);
    printSummary(test3);
    
    // Overall summary
    console.log('\n\n📈 Overall Summary');
    console.log('═'.repeat(60));
    console.log('All load tests completed successfully!');
    console.log('\nRecommendations:');
    console.log('- Monitor cache hit rates in production');
    console.log('- Set up alerts for P95 response times > 2s');
    console.log('- Configure auto-scaling based on load patterns');
    console.log('- Review failed requests if any occurred');
    
  } catch (error) {
    console.error('\n❌ Load test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runLoadTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { testCheckoutSessionCreation, runLoadTests };

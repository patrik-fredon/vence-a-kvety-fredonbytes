/**
 * Stripe Integration Verification Script
 *
 * Verifies that:
 * - Stripe API keys are configured correctly
 * - Products have stripe_product_id and stripe_price_id
 * - Stripe products and prices exist and are active
 * - Test mode is properly configured
 *
 * Usage:
 *   npx tsx scripts/verify-stripe-integration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Product interface for database queries
// (defined inline where needed to avoid unused type warning)

interface VerificationResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Verify environment variables
 */
function verifyEnvironmentVariables(): VerificationResult {
  console.log('\n🔍 Verifying Environment Variables...');

  const required = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];
  const testMode = {
    secretKey: false,
    publishableKey: false,
  };

  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      // Check if in test mode
      if (key === 'STRIPE_SECRET_KEY' && value.startsWith('sk_test_')) {
        testMode.secretKey = true;
      }
      if (key === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && value.startsWith('pk_test_')) {
        testMode.publishableKey = true;
      }
    }
  }

  if (missing.length > 0) {
    return {
      success: false,
      message: `Missing required environment variables: ${missing.join(', ')}`,
    };
  }

  if (!testMode.secretKey || !testMode.publishableKey) {
    console.log('⚠️  Warning: Not all Stripe keys are in test mode');
    console.log(`   Secret key test mode: ${testMode.secretKey}`);
    console.log(`   Publishable key test mode: ${testMode.publishableKey}`);
  } else {
    console.log('✅ All Stripe keys are in test mode');
  }

  return {
    success: true,
    message: 'All required environment variables are set',
    details: { testMode },
  };
}

/**
 * Verify products in database have Stripe IDs
 */
async function verifyProductStripeIds(): Promise<VerificationResult> {
  console.log('\n🔍 Verifying Products Have Stripe IDs...');

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      message: 'Supabase credentials not configured',
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name_cs, name_en, stripe_product_id, stripe_price_id')
      .order('name_cs');

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message}`,
      };
    }

    if (!products || products.length === 0) {
      return {
        success: false,
        message: 'No products found in database',
      };
    }

    const productsWithoutStripeIds = products.filter(
      (p) => !p.stripe_product_id || !p.stripe_price_id
    );

    console.log(`Total products: ${products.length}`);
    console.log(`Products with Stripe IDs: ${products.length - productsWithoutStripeIds.length}`);
    console.log(`Products without Stripe IDs: ${productsWithoutStripeIds.length}`);

    if (productsWithoutStripeIds.length > 0) {
      console.log('\n⚠️  Products missing Stripe IDs:');
      for (const product of productsWithoutStripeIds) {
        console.log(`   - ${product.name_cs} (ID: ${product.id})`);
        console.log(`     Missing: ${!product.stripe_product_id ? 'product_id ' : ''}${!product.stripe_price_id ? 'price_id' : ''}`);
      }

      return {
        success: false,
        message: `${productsWithoutStripeIds.length} products missing Stripe IDs`,
        details: { productsWithoutStripeIds },
      };
    }

    console.log('✅ All products have Stripe IDs');

    return {
      success: true,
      message: 'All products have Stripe IDs configured',
      details: { totalProducts: products.length },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error querying database: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify Stripe products exist and are active
 */
async function verifyStripeProducts(): Promise<VerificationResult> {
  console.log('\n🔍 Verifying Stripe Products...');

  const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];

  if (!stripeSecretKey) {
    return {
      success: false,
      message: 'STRIPE_SECRET_KEY not configured',
    };
  }

  try {
    // Dynamic import of Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });

    // Get products from database
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        message: 'Supabase credentials not configured',
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name_cs, name_en, stripe_product_id, stripe_price_id')
      .not('stripe_product_id', 'is', null)
      .not('stripe_price_id', 'is', null);

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message}`,
      };
    }

    if (!products || products.length === 0) {
      return {
        success: false,
        message: 'No products with Stripe IDs found',
      };
    }

    console.log(`Checking ${products.length} products in Stripe...`);

    const issues: string[] = [];

    for (const product of products) {
      try {
        // Verify product exists
        const stripeProduct = await stripe.products.retrieve(product.stripe_product_id!);

        if (!stripeProduct.active) {
          issues.push(`Product "${product.name_cs}" is inactive in Stripe`);
        }

        // Verify price exists
        const stripePrice = await stripe.prices.retrieve(product.stripe_price_id!);

        if (!stripePrice.active) {
          issues.push(`Price for "${product.name_cs}" is inactive in Stripe`);
        }

        console.log(`✅ ${product.name_cs}: Product and price verified`);
      } catch (error) {
        if (error instanceof Error) {
          issues.push(`Product "${product.name_cs}": ${error.message}`);
        }
      }
    }

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      for (const issue of issues) {
        console.log(`   - ${issue}`);
      }

      return {
        success: false,
        message: `${issues.length} issues found with Stripe products`,
        details: { issues },
      };
    }

    console.log('\n✅ All Stripe products and prices are active');

    return {
      success: true,
      message: 'All Stripe products verified',
      details: { verifiedProducts: products.length },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error verifying Stripe products: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test Stripe API connection
 */
async function testStripeConnection(): Promise<VerificationResult> {
  console.log('\n🔍 Testing Stripe API Connection...');

  const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];

  if (!stripeSecretKey) {
    return {
      success: false,
      message: 'STRIPE_SECRET_KEY not configured',
    };
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });

    // Try to list products (limit 1 to minimize API usage)
    const products = await stripe.products.list({ limit: 1 });

    console.log('✅ Successfully connected to Stripe API');
    console.log(`   Account has ${products.has_more ? 'more than 1' : products.data.length} product(s)`);

    return {
      success: true,
      message: 'Stripe API connection successful',
    };
  } catch (error) {
    return {
      success: false,
      message: `Stripe API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Run all verification checks
 */
async function runVerification() {
  console.log('🚀 Starting Stripe Integration Verification');
  console.log('═'.repeat(60));

  const results: VerificationResult[] = [];

  // Check 1: Environment variables
  const envResult = verifyEnvironmentVariables();
  results.push(envResult);

  if (!envResult.success) {
    console.log('\n❌ Environment variables check failed. Cannot proceed with other checks.');
    printSummary(results);
    process.exit(1);
  }

  // Check 2: Stripe API connection
  const connectionResult = await testStripeConnection();
  results.push(connectionResult);

  if (!connectionResult.success) {
    console.log('\n❌ Stripe API connection failed. Cannot proceed with other checks.');
    printSummary(results);
    process.exit(1);
  }

  // Check 3: Product Stripe IDs
  const productIdsResult = await verifyProductStripeIds();
  results.push(productIdsResult);

  // Check 4: Stripe products
  const stripeProductsResult = await verifyStripeProducts();
  results.push(stripeProductsResult);

  // Print summary
  printSummary(results);

  // Exit with appropriate code
  const allPassed = results.every((r) => r.success);
  if (allPassed) {
    console.log('\n✅ All verification checks passed!');
    console.log('\nYou can now proceed with:');
    console.log('- Testing checkout flow in test mode');
    console.log('- Running load tests');
    console.log('- Deploying to production');
    process.exit(0);
  } else {
    console.log('\n❌ Some verification checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

/**
 * Print verification summary
 */
function printSummary(results: VerificationResult[]) {
  console.log('\n\n📊 Verification Summary');
  console.log('═'.repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Total checks: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);

  if (failed > 0) {
    console.log('\nFailed checks:');
    for (const result of results.filter((r) => !r.success)) {
      console.log(`   ❌ ${result.message}`);
    }
  }
}

// Run verification if executed directly
if (require.main === module) {
  runVerification().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runVerification, verifyEnvironmentVariables, verifyProductStripeIds };

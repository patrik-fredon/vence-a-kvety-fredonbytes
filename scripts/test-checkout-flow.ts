/**
 * Comprehensive Checkout Flow Test Script
 * 
 * Tests the complete checkout procedure including:
 * - Cart data operations (add, update, retrieve)
 * - Stripe checkout session creation
 * - Order creation in Supabase
 * - Payment completion handling
 * - Error scenarios and edge cases
 * 
 * Usage:
 *   npx tsx scripts/test-checkout-flow.ts
 *   npx tsx scripts/test-checkout-flow.ts --test=cart
 *   npx tsx scripts/test-checkout-flow.ts --test=stripe
 *   npx tsx scripts/test-checkout-flow.ts --test=order
 *   npx tsx scripts/test-checkout-flow.ts --test=all
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Load environment variables
config();

// Test configuration
const TEST_CONFIG = {
  baseUrl: (process.env['NEXT_PUBLIC_BASE_URL'] || 'http://localhost:3000').split(',')[0],
  supabaseUrl: process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  supabaseKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  stripeSecretKey: process.env['STRIPE_SECRET_KEY']!,
  stripePublishableKey: process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']!,
};

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const testResults: TestResult[] = [];

// Utility functions
function logSection(title: string) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60) + '\n');
}

function logTest(name: string) {
  console.log(`🧪 Testing: ${name}`);
}

function logSuccess(message: string) {
  console.log(`✅ ${message}`);
}

function logError(message: string) {
  console.log(`❌ ${message}`);
}

function logInfo(message: string) {
  console.log(`ℹ️  ${message}`);
}

async function recordTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  logTest(name);

  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.push({ name, passed: true, duration });
    logSuccess(`Passed (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    testResults.push({ name, passed: false, duration, error: errorMessage });
    logError(`Failed: ${errorMessage}`);
  }
}

// ============================================
// CART TESTS
// ============================================

async function testCartOperations() {
  logSection('CART OPERATIONS TESTS');

  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

  // Test 1: Fetch products for testing
  await recordTest('Fetch available products', async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name_cs, base_price, stripe_product_id, stripe_price_id')
      .eq('active', true)
      .limit(3);

    if (error) throw new Error(`Failed to fetch products: ${error.message}`);
    if (!products || products.length === 0) {
      throw new Error('No active products found');
    }

    logInfo(`Found ${products.length} products for testing`);
    (global as any).testProducts = products;
  });

  // Test 2: Create cart item
  await recordTest('Create cart item', async () => {
    const products = (global as any).testProducts;
    if (!products || products.length === 0) {
      throw new Error('No products available for testing');
    }

    const testProduct = products[0];
    const sessionId = `test-session-${Date.now()}`;

    const cartItem = {
      session_id: sessionId,
      product_id: testProduct.id,
      quantity: 1,
      customizations: [
        {
          optionId: 'size',
          value: 'medium',
          label: 'Velikost',
          price: 0,
        },
        {
          optionId: 'delivery_method',
          value: 'standard',
          label: 'Způsob doručení',
          price: 0,
        },
      ],
      unit_price: testProduct['base_price'],
      total_price: testProduct['base_price'],
    };

    const { data, error } = await supabase
      .from('cart_items')
      .insert(cartItem)
      .select()
      .single();

    if (error) throw new Error(`Failed to create cart item: ${error.message}`);
    if (!data) throw new Error('No data returned from cart item creation');

    logInfo(`Created cart item with ID: ${data.id}`);
    (global as any).testCartItem = data;
    (global as any).testSessionId = sessionId;
  });

  // Test 3: Retrieve cart items
  await recordTest('Retrieve cart items', async () => {
    const sessionId = (global as any).testSessionId;
    if (!sessionId) throw new Error('No test session ID available');

    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);

    if (error) throw new Error(`Failed to retrieve cart items: ${error.message}`);
    if (!items || items.length === 0) {
      throw new Error('No cart items found');
    }

    logInfo(`Retrieved ${items.length} cart item(s)`);
  });

  // Test 4: Update cart item quantity
  await recordTest('Update cart item quantity', async () => {
    const cartItem = (global as any).testCartItem;
    if (!cartItem) throw new Error('No test cart item available');

    const newQuantity = 2;
    const newTotalPrice = cartItem.unit_price * newQuantity;

    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: newQuantity,
        total_price: newTotalPrice,
      })
      .eq('id', cartItem.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update cart item: ${error.message}`);
    if (data.quantity !== newQuantity) {
      throw new Error(`Quantity not updated correctly: expected ${newQuantity}, got ${data.quantity}`);
    }

    logInfo(`Updated quantity to ${newQuantity}`);
  });

  // Test 5: Validate customizations structure
  await recordTest('Validate customizations structure', async () => {
    const cartItem = (global as any).testCartItem;
    if (!cartItem) throw new Error('No test cart item available');

    const { data, error } = await supabase
      .from('cart_items')
      .select('customizations')
      .eq('id', cartItem.id)
      .single();

    if (error) throw new Error(`Failed to fetch customizations: ${error.message}`);

    const customizations = data.customizations;
    if (!Array.isArray(customizations)) {
      throw new Error('Customizations is not an array');
    }

    // Check required fields
    for (const custom of customizations) {
      if (!custom.optionId || !custom.value || !custom.label) {
        throw new Error(`Invalid customization structure: ${JSON.stringify(custom)}`);
      }
    }

    // Check for delivery method
    const hasDeliveryMethod = customizations.some(
      (c: any) => c.optionId === 'delivery_method'
    );
    if (!hasDeliveryMethod) {
      throw new Error('Missing required delivery_method customization');
    }

    logInfo('Customizations structure is valid');
  });
}

// ============================================
// STRIPE TESTS
// ============================================

async function testStripeIntegration() {
  logSection('STRIPE INTEGRATION TESTS');

  const stripe = new Stripe(TEST_CONFIG.stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
  });

  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

  // Fetch products if not already available
  if (!(global as any).testProducts) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name_cs, base_price, stripe_product_id, stripe_price_id')
      .eq('active', true)
      .limit(3);
    (global as any).testProducts = products;
  }

  // Test 1: Verify Stripe connection
  await recordTest('Verify Stripe API connection', async () => {
    const account = await stripe.accounts.retrieve();
    logInfo(`Connected to Stripe account: ${account.id}`);
  });

  // Test 2: Verify products have Stripe IDs
  await recordTest('Verify products have Stripe IDs', async () => {
    const products = (global as any).testProducts;
    if (!products || products.length === 0) {
      throw new Error('No products available for testing');
    }

    for (const product of products) {
      if (!product.stripe_product_id || !product.stripe_price_id) {
        throw new Error(`Product ${product['name_cs']} missing Stripe IDs`);
      }
    }

    logInfo('All test products have Stripe IDs');
  });

  // Test 3: Create checkout session
  await recordTest('Create Stripe checkout session', async () => {
    const products = (global as any).testProducts;
    if (!products || products.length === 0) {
      throw new Error('No products available for testing');
    }

    const testProduct = products[0];

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [
        {
          price: testProduct.stripe_price_id,
          quantity: 1,
        },
      ],
      return_url: `${TEST_CONFIG.baseUrl}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        test: 'true',
        product_id: testProduct.id,
      },
    });

    if (!session.client_secret) {
      throw new Error('No client secret returned');
    }

    logInfo(`Created session: ${session.id}`);
    logInfo(`Client secret: ${session.client_secret.substring(0, 20)}...`);
    (global as any).testStripeSession = session;
  });

  // Test 4: Retrieve checkout session
  await recordTest('Retrieve Stripe checkout session', async () => {
    const session = (global as any).testStripeSession;
    if (!session) throw new Error('No test session available');

    const retrieved = await stripe.checkout.sessions.retrieve(session.id);

    if (retrieved.id !== session.id) {
      throw new Error('Retrieved session ID does not match');
    }

    logInfo(`Retrieved session status: ${retrieved['status']}`);
  });

  // Test 5: Expire checkout session
  await recordTest('Expire Stripe checkout session', async () => {
    const session = (global as any).testStripeSession;
    if (!session) throw new Error('No test session available');

    const expired = await stripe.checkout.sessions.expire(session.id);

    if (expired['status'] !== 'expired') {
      throw new Error(`Expected status 'expired', got '${expired['status']}'`);
    }

    logInfo('Session expired successfully');
  });

  // Test 6: Test with multiple line items
  await recordTest('Create session with multiple line items', async () => {
    const products = (global as any).testProducts;
    if (!products || products.length < 2) {
      throw new Error('Need at least 2 products for this test');
    }

    const lineItems = products.slice(0, 2).map((product: any) => ({
      price: product.stripe_price_id,
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: lineItems,
      return_url: `${TEST_CONFIG.baseUrl}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        test: 'true',
        item_count: lineItems.length.toString(),
      },
    });

    if (!session.client_secret) {
      throw new Error('No client secret returned');
    }

    logInfo(`Created multi-item session: ${session.id}`);

    // Clean up
    await stripe.checkout.sessions.expire(session.id);
  });
}

// ============================================
// ORDER TESTS
// ============================================

async function testOrderOperations() {
  logSection('ORDER OPERATIONS TESTS');

  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

  // Fetch products if not already available
  if (!(global as any).testProducts) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name_cs, base_price, stripe_product_id, stripe_price_id')
      .eq('active', true)
      .limit(3);
    (global as any).testProducts = products;
  }

  // Create session ID if not available
  if (!(global as any).testSessionId) {
    (global as any).testSessionId = `test-session-${Date.now()}`;
  }

  // Test 1: Create order
  await recordTest('Create order in Supabase', async () => {
    const products = (global as any).testProducts;
    const sessionId = (global as any).testSessionId;

    if (!products || !sessionId) {
      throw new Error('Missing test data');
    }

    const testProduct = products[0];
    const orderNumber = `TEST-${Date.now()}`;

    const orderData = {
      order_number: orderNumber,
      status: 'pending',
      customer_info: {
        email: 'test@example.com',
        name: 'Test Customer',
        phone: '+420123456789',
      },
      delivery_info: {
        address: {
          street: 'Test Street 123',
          city: 'Prague',
          postalCode: '11000',
          country: 'CZ',
        },
        method: 'standard',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      payment_info: {
        method: 'stripe',
        status: 'pending',
      },
      items: [
        {
          product_id: testProduct.id,
          quantity: 1,
          unit_price: testProduct['base_price'],
          total_price: testProduct['base_price'],
        },
      ],
      subtotal: testProduct['base_price'],
      delivery_cost: 0,
      total_amount: testProduct['base_price'],
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    if (!order) throw new Error('No order data returned');

    logInfo(`Created order: ${order.order_number}`);
    (global as any).testOrder = order;
  });

  // Test 2: Create order items
  await recordTest('Create order items', async () => {
    const order = (global as any).testOrder;
    const products = (global as any).testProducts;

    if (!order || !products) {
      throw new Error('Missing test data');
    }

    const testProduct = products[0];

    const orderItemData = {
      order_id: order.id,
      product_id: testProduct.id,
      quantity: 1,
      unit_price: testProduct['base_price'],
      total_price: testProduct['base_price'],
      customizations: [
        {
          optionId: 'size',
          value: 'medium',
          label: 'Velikost',
          price: 0,
        },
      ],
    };

    const { data: orderItem, error } = await supabase
      .from('order_items')
      .insert(orderItemData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create order item: ${error.message}`);
    if (!orderItem) throw new Error('No order item data returned');

    logInfo(`Created order item with ID: ${orderItem.id}`);
  });

  // Test 3: Update order status
  await recordTest('Update order status', async () => {
    const order = (global as any).testOrder;
    if (!order) throw new Error('No test order available');

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_info: {
          method: 'stripe',
          status: 'paid',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);
    if (data['status'] !== 'confirmed') {
      throw new Error(`Status not updated: expected 'confirmed', got '${data['status']}'`);
    }

    logInfo('Order status updated to confirmed');
  });

  // Test 4: Retrieve order with items
  await recordTest('Retrieve order with items', async () => {
    const order = (global as any).testOrder;
    if (!order) throw new Error('No test order available');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', order.id)
      .single();

    if (error) throw new Error(`Failed to retrieve order: ${error.message}`);
    if (!data.order_items || data.order_items.length === 0) {
      throw new Error('No order items found');
    }

    logInfo(`Retrieved order with ${data.order_items.length} item(s)`);
  });

  // Test 5: Create order history entry
  await recordTest('Create order history entry', async () => {
    const order = (global as any).testOrder;
    if (!order) throw new Error('No test order available');

    const historyData = {
      order_id: order.id,
      status: 'confirmed',
      notes: 'Test order confirmed',
      metadata: {
        test: true,
        automated: true,
      },
    };

    const { data, error } = await supabase
      .from('order_history')
      .insert(historyData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create history entry: ${error.message}`);

    logInfo(`Created history entry with ID: ${data.id}`);
  });
}

// ============================================
// INTEGRATION TESTS
// ============================================

async function testFullCheckoutFlow() {
  logSection('FULL CHECKOUT FLOW INTEGRATION TEST');

  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);
  const stripe = new Stripe(TEST_CONFIG.stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
  });

  await recordTest('Complete checkout flow simulation', async () => {
    // Step 1: Get product
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .limit(1)
      .single();

    if (!products) throw new Error('No products available');

    logInfo('Step 1: Product selected');

    // Step 2: Add to cart
    const sessionId = `integration-test-${Date.now()}`;
    const { data: cartItem } = await supabase
      .from('cart_items')
      .insert({
        session_id: sessionId,
        product_id: products.id,
        quantity: 1,
        customizations: [
          { optionId: 'size', value: 'medium', label: 'Velikost', price: 0 },
          { optionId: 'delivery_method', value: 'standard', label: 'Doručení', price: 0 },
        ],
        unit_price: products['base_price'],
        total_price: products['base_price'],
      })
      .select()
      .single();

    if (!cartItem) throw new Error('Failed to create cart item');

    logInfo('Step 2: Added to cart');

    // Step 3: Create Stripe session
    const stripeSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [
        {
          price: products.stripe_price_id!,
          quantity: 1,
        },
      ],
      return_url: `${TEST_CONFIG.baseUrl}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        session_id: sessionId,
        product_id: products.id,
      },
    });

    if (!stripeSession.client_secret) {
      throw new Error('No client secret returned');
    }

    logInfo('Step 3: Stripe session created');

    // Step 4: Create order
    const { data: order } = await supabase
      .from('orders')
      .insert({
        order_number: `INT-TEST-${Date.now()}`,
        status: 'pending',
        customer_info: {
          email: 'integration@test.com',
          name: 'Integration Test',
          phone: '+420123456789',
        },
        delivery_info: {
          address: {
            street: 'Test St 1',
            city: 'Prague',
            postalCode: '11000',
          },
          method: 'standard',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        payment_info: {
          method: 'stripe',
          status: 'pending',
          stripe_session_id: stripeSession.id,
        },
        items: [
          {
            product_id: products.id,
            quantity: 1,
            unit_price: products['base_price'],
            total_price: products['base_price'],
          },
        ],
        subtotal: products['base_price'],
        delivery_cost: 0,
        total_amount: products['base_price'],
      })
      .select()
      .single();

    if (!order) throw new Error('Failed to create order');

    logInfo('Step 4: Order created');

    // Step 5: Create order item
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: products.id,
      quantity: 1,
      unit_price: products['base_price'],
      total_price: products['base_price'],
      customizations: cartItem.customizations,
    });

    logInfo('Step 5: Order items created');

    // Step 6: Simulate payment completion
    await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_info: {
          method: 'stripe',
          status: 'paid',
        },
      })
      .eq('id', order.id);

    logInfo('Step 6: Payment completed');

    // Step 7: Clean up cart
    await supabase.from('cart_items').delete().eq('id', cartItem.id);

    logInfo('Step 7: Cart cleaned up');

    // Step 8: Expire Stripe session
    await stripe.checkout.sessions.expire(stripeSession.id);

    logInfo('Step 8: Stripe session expired');

    logInfo('✨ Full checkout flow completed successfully');

    // Store for cleanup
    (global as any).integrationTestOrder = order;
  });
}

// ============================================
// CLEANUP
// ============================================

async function cleanup() {
  logSection('CLEANUP');

  const supabase = createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseKey);

  logInfo('Cleaning up test data...');

  try {
    // Clean up cart items
    const sessionId = (global as any).testSessionId;
    if (sessionId) {
      await supabase.from('cart_items').delete().eq('session_id', sessionId);
      logInfo('Cleaned up cart items');
    }

    // Clean up test orders
    const testOrder = (global as any).testOrder;
    if (testOrder) {
      await supabase.from('order_items').delete().eq('order_id', testOrder.id);
      await supabase.from('order_history').delete().eq('order_id', testOrder.id);
      await supabase.from('orders').delete().eq('id', testOrder.id);
      logInfo('Cleaned up test order');
    }

    // Clean up integration test order
    const integrationOrder = (global as any).integrationTestOrder;
    if (integrationOrder) {
      await supabase.from('order_items').delete().eq('order_id', integrationOrder.id);
      await supabase.from('order_history').delete().eq('order_id', integrationOrder.id);
      await supabase.from('orders').delete().eq('id', integrationOrder.id);
      logInfo('Cleaned up integration test order');
    }

    logSuccess('Cleanup completed');
  } catch (error) {
    logError(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================
// SUMMARY
// ============================================

function printSummary() {
  logSection('TEST SUMMARY');

  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => r.passed === false).length;
  const total = testResults.length;
  const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Total duration: ${totalDuration}ms`);
  console.log(`Average duration: ${Math.round(totalDuration / total)}ms`);

  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    testResults
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r['name']}`);
        console.log(`     Error: ${r.error}`);
      });
  }

  console.log('\n' + (failed === 0 ? '✅ All tests passed!' : '❌ Some tests failed'));
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🚀 Starting Checkout Flow Tests');
  console.log('═'.repeat(60));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const testArg = args.find((arg) => arg.startsWith('--test='));
  const testType = testArg ? testArg.split('=')[1] : 'all';

  try {
    // Verify environment variables
    if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    if (!TEST_CONFIG.stripeSecretKey) {
      throw new Error('Missing Stripe secret key');
    }

    // Run tests based on argument
    if (testType === 'cart' || testType === 'all') {
      await testCartOperations();
    }

    if (testType === 'stripe' || testType === 'all') {
      await testStripeIntegration();
    }

    if (testType === 'order' || testType === 'all') {
      await testOrderOperations();
    }

    if (testType === 'integration' || testType === 'all') {
      await testFullCheckoutFlow();
    }

    // Cleanup
    await cleanup();

    // Print summary
    printSummary();

    // Exit with appropriate code
    const failed = testResults.filter((r) => !r.passed).length;
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { testCartOperations, testStripeIntegration, testOrderOperations, testFullCheckoutFlow };

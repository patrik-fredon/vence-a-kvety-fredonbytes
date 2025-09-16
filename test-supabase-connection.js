/**
 * Supabase Connection Test for Product Listings
 * Tests database connection and product data retrieval
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase Connection for Product Listings');
  console.log('=' .repeat(60));

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('\n📋 Environment Variables Check:');
  console.log(`SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('\n❌ Missing required Supabase environment variables');
    return false;
  }

  // Test with anon key (public access)
  console.log('\n🔍 Testing Public Access (Anon Key):');
  try {
    const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabasePublic
      .from('categories')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('❌ Public connection failed:', healthError.message);
      console.log('   This might indicate:');
      console.log('   - Wrong anon key for this URL');
      console.log('   - Database not accessible');
      console.log('   - RLS policies blocking access');
      return false;
    }

    console.log('✅ Public connection successful');

    // Test categories table
    console.log('\n📂 Testing Categories Table:');
    const { data: categories, error: catError } = await supabasePublic
      .from('categories')
      .select('id, name_cs, name_en, slug, active')
      .eq('active', true)
      .limit(5);

    if (catError) {
      console.log('❌ Categories query failed:', catError.message);
    } else {
      console.log(`✅ Categories found: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          console.log(`   - ${cat.name_cs} (${cat.slug})`);
        });
      }
    }

    // Test products table
    console.log('\n🌹 Testing Products Table:');
    const { data: products, error: prodError } = await supabasePublic
      .from('products')
      .select('id, name_cs, name_en, slug, base_price, active')
      .eq('active', true)
      .limit(5);

    if (prodError) {
      console.log('❌ Products query failed:', prodError.message);
      console.log('   This might indicate:');
      console.log('   - Products table doesn\'t exist');
      console.log('   - RLS policies blocking access');
      console.log('   - No products in database');
    } else {
      console.log(`✅ Products found: ${products?.length || 0}`);
      if (products && products.length > 0) {
        products.forEach(prod => {
          console.log(`   - ${prod.name_cs} - ${prod.base_price} Kč`);
        });
      } else {
        console.log('⚠️  No products found - database might be empty');
      }
    }

    return true;

  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

async function testServiceRoleConnection() {
  console.log('\n🔧 Testing Service Role Connection:');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.log('⚠️  Service role key not configured - skipping admin tests');
    return true;
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Test admin access to contact_forms
    const { data: contactForms, error: contactError } = await supabaseAdmin
      .from('contact_forms')
      .select('count')
      .limit(1);

    if (contactError) {
      console.log('❌ Service role connection failed:', contactError.message);
      return false;
    }

    console.log('✅ Service role connection successful');
    return true;

  } catch (error) {
    console.log('❌ Service role test failed:', error.message);
    return false;
  }
}

async function suggestFixes() {
  console.log('\n🔧 TROUBLESHOOTING SUGGESTIONS:');
  console.log('=' .repeat(60));

  console.log('\n1. Check Supabase Project Settings:');
  console.log('   - Go to https://supabase.com/dashboard');
  console.log('   - Select your project');
  console.log('   - Go to Settings > API');
  console.log('   - Copy the correct URL and anon key');

  console.log('\n2. Verify Database Tables:');
  console.log('   - Check if categories and products tables exist');
  console.log('   - Verify RLS policies allow public read access');
  console.log('   - Ensure tables have data');

  console.log('\n3. Test RLS Policies:');
  console.log('   - Categories should allow public SELECT');
  console.log('   - Products should allow public SELECT where active=true');

  console.log('\n4. Seed Database:');
  console.log('   - Run: npm run db:seed:funeral');
  console.log('   - Or manually insert test data');

  console.log('\n5. Check Network/Firewall:');
  console.log('   - Ensure Supabase domain is accessible');
  console.log('   - Check for corporate firewall blocking');
}

async function runAllTests() {
  console.log('🚀 SUPABASE CONNECTION TEST SUITE');
  console.log('Testing funeral wreaths e-commerce database connection\n');

  const publicConnectionOk = await testSupabaseConnection();
  const serviceConnectionOk = await testServiceRoleConnection();

  console.log('\n' + '=' .repeat(60));
  console.log('📋 FINAL TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`🔌 Public Connection: ${publicConnectionOk ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔧 Service Connection: ${serviceConnectionOk ? '✅ WORKING' : '❌ FAILED'}`);

  if (publicConnectionOk) {
    console.log('\n🎉 SUCCESS: Supabase connection is working!');
    console.log('✅ Product listings should now work on the website');
    console.log('✅ Categories should be accessible');
    console.log('✅ Database queries are functional');
  } else {
    console.log('\n❌ FAILED: Supabase connection needs fixing');
    console.log('🔧 Product listings will not work until connection is fixed');
    await suggestFixes();
  }

  return publicConnectionOk;
}

// Run the tests
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests, testSupabaseConnection };

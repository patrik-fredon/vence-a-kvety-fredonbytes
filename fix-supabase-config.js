/**
 * Supabase Configuration Fixer
 * Helps identify and fix Supabase connection issues
 */

const jwt = require("jsonwebtoken");

function decodeSupabaseKey(key) {
  try {
    const decoded = jwt.decode(key);
    return decoded;
  } catch (error) {
    return null;
  }
}

function analyzeSupabaseConfig() {
  console.log("🔍 SUPABASE CONFIGURATION ANALYSIS");
  console.log("=".repeat(50));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Extract project ID from URL
  const urlMatch = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  const urlProjectId = urlMatch ? urlMatch[1] : null;

  console.log(`\n📍 URL Project ID: ${urlProjectId}`);

  // Decode anon key
  const anonDecoded = decodeSupabaseKey(anonKey);
  console.log(`\n🔑 Anon Key Analysis:`);
  if (anonDecoded) {
    console.log(`   Project Ref: ${anonDecoded.ref}`);
    console.log(`   Role: ${anonDecoded.role}`);
    console.log(`   Issued: ${new Date(anonDecoded.iat * 1000).toISOString()}`);
    console.log(`   Expires: ${new Date(anonDecoded.exp * 1000).toISOString()}`);
  } else {
    console.log("   ❌ Invalid or malformed key");
  }

  // Decode service key
  const serviceDecoded = decodeSupabaseKey(serviceKey);
  console.log(`\n🔧 Service Key Analysis:`);
  if (serviceDecoded) {
    console.log(`   Project Ref: ${serviceDecoded.ref}`);
    console.log(`   Role: ${serviceDecoded.role}`);
    console.log(`   Issued: ${new Date(serviceDecoded.iat * 1000).toISOString()}`);
    console.log(`   Expires: ${new Date(serviceDecoded.exp * 1000).toISOString()}`);
  } else {
    console.log("   ❌ Invalid or malformed key");
  }

  // Check for mismatches
  console.log(`\n🔍 MISMATCH ANALYSIS:`);
  const anonProjectId = anonDecoded?.ref;
  const serviceProjectId = serviceDecoded?.ref;

  if (urlProjectId !== anonProjectId) {
    console.log(`❌ URL/Anon Key Mismatch:`);
    console.log(`   URL Project: ${urlProjectId}`);
    console.log(`   Anon Key Project: ${anonProjectId}`);
  } else {
    console.log(`✅ URL and Anon Key match`);
  }

  if (urlProjectId !== serviceProjectId) {
    console.log(`❌ URL/Service Key Mismatch:`);
    console.log(`   URL Project: ${urlProjectId}`);
    console.log(`   Service Key Project: ${serviceProjectId}`);
  } else {
    console.log(`✅ URL and Service Key match`);
  }

  if (anonProjectId !== serviceProjectId) {
    console.log(`❌ Keys don't match each other:`);
    console.log(`   Anon Key Project: ${anonProjectId}`);
    console.log(`   Service Key Project: ${serviceProjectId}`);
  } else {
    console.log(`✅ Both keys are for the same project`);
  }

  return {
    urlProjectId,
    anonProjectId,
    serviceProjectId,
    hasMatches: urlProjectId === anonProjectId && urlProjectId === serviceProjectId,
  };
}

function generateCorrectConfig() {
  console.log(`\n🔧 SOLUTION OPTIONS:`);
  console.log("=".repeat(50));

  const analysis = analyzeSupabaseConfig();

  if (!analysis.hasMatches) {
    console.log(`\n📋 OPTION 1: Get correct keys for current URL`);
    console.log(`   1. Go to https://supabase.com/dashboard`);
    console.log(`   2. Find project: ${analysis.urlProjectId}`);
    console.log(`   3. Go to Settings > API`);
    console.log(`   4. Copy the anon and service_role keys`);
    console.log(`   5. Update your .env file`);

    console.log(`\n📋 OPTION 2: Use correct URL for current keys`);
    if (analysis.anonProjectId) {
      console.log(`   Update URL to: https://${analysis.anonProjectId}.supabase.co`);
    }

    console.log(`\n📋 OPTION 3: Create new project`);
    console.log(`   1. Go to https://supabase.com/dashboard`);
    console.log(`   2. Create new project`);
    console.log(`   3. Get URL and keys from Settings > API`);
    console.log(`   4. Update your .env file`);
  }

  console.log(`\n🎯 RECOMMENDED ACTION:`);
  console.log(`   Use OPTION 1 - Get correct keys for: ${analysis.urlProjectId}`);
  console.log(`   This ensures you're using the intended Supabase project.`);
}

// Run analysis
require("dotenv").config();
analyzeSupabaseConfig();
generateCorrectConfig();

console.log(`\n📝 NEXT STEPS:`);
console.log(`1. Fix the Supabase configuration using one of the options above`);
console.log(`2. Run: node test-supabase-connection.js`);
console.log(`3. If connection works, run: npm run db:seed:funeral`);
console.log(`4. Test product listings on the website`);

module.exports = { analyzeSupabaseConfig };

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("🔗 Testing database connection...");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProduct() {
  try {
    console.log("\n🔍 Testing product query for hearth-for-urn-wreath...");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", "hearth-for-urn-wreath")
      .eq("active", true)
      .single();

    if (error) {
      console.error("❌ Error:", error.message);
      console.error("Details:", error);
      return;
    }

    if (!data) {
      console.log("❌ No product found");
      return;
    }

    console.log("✅ Product found!");
    console.log("ID:", data.id);
    console.log("Name CS:", data.name_cs);
    console.log("Name EN:", data.name_en);
    console.log("Slug:", data.slug);
    console.log("Active:", data.active);
    console.log("Featured:", data.featured);
  } catch (err) {
    console.error("💥 Unexpected error:", err);
  }
}

async function listAllProducts() {
  try {
    console.log("\n📋 Listing all products...");

    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name_cs, name_en, active")
      .eq("active", true);

    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }

    console.log(`✅ Found ${data.length} products:`);
    data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.slug} - ${product.name_cs} / ${product.name_en}`);
    });
  } catch (err) {
    console.error("💥 Unexpected error:", err);
  }
}

async function main() {
  await testProduct();
  await listAllProducts();
  process.exit(0);
}

main();

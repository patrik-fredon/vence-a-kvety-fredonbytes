#!/usr/bin/env node

/**
 * Production Data Seeding Script
 * Seeds essential data for production environment
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Production seed data
const CATEGORIES = [
  {
    name_cs: 'Pohřební věnce',
    name_en: 'Funeral Wreaths',
    slug: 'funeral-wreaths',
    description_cs: 'Tradiční pohřební věnce pro důstojné rozloučení',
    description_en: 'Traditional funeral wreaths for dignified farewell',
    sort_order: 1,
    active: true
  },
  {
    name_cs: 'Smuteční kytice',
    name_en: 'Mourning Bouquets',
    slug: 'mourning-bouquets',
    description_cs: 'Elegantní smuteční kytice a aranžmá',
    description_en: 'Elegant mourning bouquets and arrangements',
    sort_order: 2,
    active: true
  },
  {
    name_cs: 'Květinové podušky',
    name_en: 'Flower Cushions',
    slug: 'flower-cushions',
    description_cs: 'Květinové podušky a speciální tvary',
    description_en: 'Flower cushions and special shapes',
    sort_order: 3,
    active: true
  }
];

const SAMPLE_PRODUCTS = [
  {
    name_cs: 'Klasický pohřební věnec',
    name_en: 'Classic Funeral Wreath',
    description_cs: 'Tradiční pohřební věnec z čerstvých květin',
    description_en: 'Traditional funeral wreath made from fresh flowers',
    slug: 'classic-funeral-wreath',
    base_price: 1500.00,
    customization_options: [
      {
        type: 'size',
        name: { cs: 'Velikost', en: 'Size' },
        required: true,
        options: [
          { value: 'small', label: { cs: 'Malý (40cm)', en: 'Small (40cm)' }, priceModifier: 0 },
          { value: 'medium', label: { cs: 'Střední (50cm)', en: 'Medium (50cm)' }, priceModifier: 300 },
          { value: 'large', label: { cs: 'Velký (60cm)', en: 'Large (60cm)' }, priceModifier: 600 }
        ]
      },
      {
        type: 'ribbon',
        name: { cs: 'Stuha', en: 'Ribbon' },
        required: false,
        options: [
          { value: 'white', label: { cs: 'Bílá', en: 'White' }, priceModifier: 0 },
          { value: 'black', label: { cs: 'Černá', en: 'Black' }, priceModifier: 0 },
          { value: 'gold', label: { cs: 'Zlatá', en: 'Gold' }, priceModifier: 50 }
        ]
      }
    ],
    availability: { inStock: true, estimatedDays: 1 },
    active: true,
    featured: true
  }
];

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  for (const category of CATEGORIES) {
    const { error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to seed category ${category.slug}:`, error);
      throw error;
    }

    console.log(`✅ Seeded category: ${category.slug}`);
  }
}

async function seedProducts() {
  console.log('🌱 Seeding products...');

  // Get category IDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.slug] = cat.id;
    return acc;
  }, {});

  for (const product of SAMPLE_PRODUCTS) {
    const productData = {
      ...product,
      category_id: categoryMap['funeral-wreaths']
    };

    const { error } = await supabase
      .from('products')
      .upsert(productData, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to seed product ${product.slug}:`, error);
      throw error;
    }

    console.log(`✅ Seeded product: ${product.slug}`);
  }
}

async function createAdminUser() {
  console.log('👤 Creating admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pohrebni-vence.cz';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      name: 'System Administrator'
    }
  });

  if (error && error.message !== 'User already registered') {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }

  console.log(`✅ Admin user ready: ${adminEmail}`);
}

async function setupRLS() {
  console.log('🔒 Setting up Row Level Security...');

  const policies = [
    // Categories - public read, admin write
    `
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
    CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
    `,
    `
    DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;
    CREATE POLICY "Categories are editable by admins" ON categories FOR ALL USING (
      auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );
    `,
    // Products - public read, admin write
    `
    DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
    CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (active = true);
    `,
    `
    DROP POLICY IF EXISTS "Products are editable by admins" ON products;
    CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
      auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );
    `,
    // Orders - users can view their own, admins can view all
    `
    DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
    CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (
      auth.uid() = user_id OR auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
    );
    `,
    // Cart items - users can manage their own
    `
    DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;
    CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (
      auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
    );
    `
  ];

  for (const policy of policies) {
    const { error } = await supabase.rpc('exec_sql', { sql: policy });
    if (error) {
      console.warn('⚠️  Policy setup warning:', error.message);
    }
  }

  console.log('✅ RLS policies configured');
}

async function seedProduction() {
  try {
    console.log('🚀 Starting production data seeding...');

    await seedCategories();
    await seedProducts();
    await createAdminUser();
    await setupRLS();

    console.log('✅ Production seeding completed successfully!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
if (require.main === module) {
  seedProduction();
}

module.exports = { seedProduction };

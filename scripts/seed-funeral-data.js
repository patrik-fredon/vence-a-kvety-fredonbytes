/**
 * Database seeding script for funeral wreaths e-commerce platform
 * Seeds the database with realistic funeral wreaths themed data
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Seed data
const categories = [
  {
    id: 'cat-wreaths-classic',
    name_cs: 'Klasické věnce',
    name_en: 'Classic Wreaths',
    slug: 'klasicke-vence',
    description_cs: 'Tradiční pohřební věnce v klasickém stylu s důstojným vzhledem',
    description_en: 'Traditional funeral wreaths in classic style with dignified appearance',
    image_url: '/images/categories/classic-wreaths.jpg',
    parent_id: null,
    sort_order: 1,
    active: true,
  },
  {
    id: 'cat-wreaths-modern',
    name_cs: 'Moderní věnce',
    name_en: 'Modern Wreaths',
    slug: 'moderni-vence',
    description_cs: 'Současné pohřební věnce s moderním designem a netradiční kompozicí',
    description_en: 'Contemporary funeral wreaths with modern design and unconventional composition',
    image_url: '/images/categories/modern-wreaths.jpg',
    parent_id: null,
    sort_order: 2,
    active: true,
  },
  {
    id: 'cat-wreaths-heart',
    name_cs: 'Srdcové věnce',
    name_en: 'Heart Wreaths',
    slug: 'srdcove-vence',
    description_cs: 'Pohřební věnce ve tvaru srdce jako symbol lásky a vzpomínek',
    description_en: 'Heart-shaped funeral wreaths as a symbol of love and memories',
    image_url: '/images/categories/heart-wreaths.jpg',
    parent_id: null,
    sort_order: 3,
    active: true,
  },
  {
    id: 'cat-wreaths-cross',
    name_cs: 'Křížové věnce',
    name_en: 'Cross Wreaths',
    slug: 'krizove-vence',
    description_cs: 'Pohřební věnce ve tvaru kříže pro křesťanské pohřby',
    description_en: 'Cross-shaped funeral wreaths for Christian funerals',
    image_url: '/images/categories/cross-wreaths.jpg',
    parent_id: null,
    sort_order: 4,
    active: true,
  },
  {
    id: 'cat-wreaths-seasonal',
    name_cs: 'Sezónní věnce',
    name_en: 'Seasonal Wreaths',
    slug: 'sezonni-vence',
    description_cs: 'Pohřební věnce s použitím sezónních květin a dekorací',
    description_en: 'Funeral wreaths using seasonal flowers and decorations',
    image_url: '/images/categories/seasonal-wreaths.jpg',
    parent_id: null,
    sort_order: 5,
    active: true,
  },
];

const products = [
  {
    id: 'prod-classic-rose-wreath',
    name_cs: 'Klasický růžový věnec',
    name_en: 'Classic Rose Wreath',
    slug: 'klasicky-ruzovy-venec',
    description_cs: 'Elegantní pohřební věnec z červených a bílých růží s tradičním designem. Vhodný pro všechny typy pohřebních obřadů.',
    description_en: 'Elegant funeral wreath made of red and white roses with traditional design. Suitable for all types of funeral ceremonies.',
    base_price: 2500,
    category_id: 'cat-wreaths-classic',
    images: [
      {
        id: 'img-classic-rose-1',
        url: '/images/products/classic-rose-wreath-1.jpg',
        alt: 'Klasický růžový věnec - hlavní pohled',
        isPrimary: true,
        sortOrder: 0,
      },
      {
        id: 'img-classic-rose-2',
        url: '/images/products/classic-rose-wreath-2.jpg',
        alt: 'Klasický růžový věnec - detail',
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    customization_options: [
      {
        id: 'size-classic-rose',
        type: 'size',
        name: { cs: 'Velikost věnce', en: 'Wreath Size' },
        description: { cs: 'Vyberte velikost pohřebního věnce', en: 'Choose the size of the funeral wreath' },
        choices: [
          { id: 'size-small', value: 'small', label: { cs: 'Malý (40 cm)', en: 'Small (40 cm)' }, priceModifier: 0, available: true },
          { id: 'size-medium', value: 'medium', label: { cs: 'Střední (60 cm)', en: 'Medium (60 cm)' }, priceModifier: 500, available: true },
          { id: 'size-large', value: 'large', label: { cs: 'Velký (80 cm)', en: 'Large (80 cm)' }, priceModifier: 1000, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
      {
        id: 'ribbon-classic-rose',
        type: 'ribbon',
        name: { cs: 'Stuha', en: 'Ribbon' },
        description: { cs: 'Vyberte barvu a typ stuhy', en: 'Choose ribbon color and type' },
        choices: [
          { id: 'ribbon-white', value: 'white', label: { cs: 'Bílá stuha', en: 'White Ribbon' }, priceModifier: 0, available: true },
          { id: 'ribbon-black', value: 'black', label: { cs: 'Černá stuha', en: 'Black Ribbon' }, priceModifier: 0, available: true },
          { id: 'ribbon-gold', value: 'gold', label: { cs: 'Zlatá stuha', en: 'Gold Ribbon' }, priceModifier: 200, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
      {
        id: 'message-classic-rose',
        type: 'message',
        name: { cs: 'Osobní vzkaz', en: 'Personal Message' },
        description: { cs: 'Napište osobní vzkaz na stuhu', en: 'Write a personal message on the ribbon' },
        choices: [],
        required: false,
        maxSelections: 1,
        minSelections: 0,
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 15,
      maxOrderQuantity: 5,
      leadTimeHours: 24,
    },
    seo_metadata: {
      title: { cs: 'Klasický růžový věnec - Pohřební věnce', en: 'Classic Rose Wreath - Funeral Wreaths' },
      description: { cs: 'Elegantní klasický pohřební věnec z růží. Tradiční design vhodný pro všechny typy obřadů. Rychlé dodání do 24 hodin.', en: 'Elegant classic funeral wreath made of roses. Traditional design suitable for all ceremony types. Fast delivery within 24 hours.' },
      keywords: { cs: ['pohřební věnec', 'růže', 'klasický', 'tradiční', 'pohřeb'], en: ['funeral wreath', 'roses', 'classic', 'traditional', 'funeral'] },
    },
    active: true,
    featured: true,
  },
  {
    id: 'prod-white-lily-wreath',
    name_cs: 'Bílý liliový věnec',
    name_en: 'White Lily Wreath',
    slug: 'bily-liliovy-venec',
    description_cs: 'Čistý a důstojný pohřební věnec z bílých lilií symbolizující čistotu a věčnost. Ideální pro tichou vzpomínku.',
    description_en: 'Pure and dignified funeral wreath made of white lilies symbolizing purity and eternity. Perfect for quiet remembrance.',
    base_price: 2800,
    category_id: 'cat-wreaths-classic',
    images: [
      {
        id: 'img-lily-1',
        url: '/images/products/white-lily-wreath-1.jpg',
        alt: 'Bílý liliový věnec - hlavní pohled',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    customization_options: [
      {
        id: 'size-lily',
        type: 'size',
        name: { cs: 'Velikost věnce', en: 'Wreath Size' },
        choices: [
          { id: 'size-medium', value: 'medium', label: { cs: 'Střední (60 cm)', en: 'Medium (60 cm)' }, priceModifier: 0, available: true },
          { id: 'size-large', value: 'large', label: { cs: 'Velký (80 cm)', en: 'Large (80 cm)' }, priceModifier: 700, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 8,
      maxOrderQuantity: 3,
      leadTimeHours: 48,
    },
    seo_metadata: {
      title: { cs: 'Bílý liliový věnec - Pohřební věnce', en: 'White Lily Wreath - Funeral Wreaths' },
      description: { cs: 'Důstojný bílý pohřební věnec z lilií. Symbol čistoty a věčnosti pro tichou vzpomínku na zesnulého.', en: 'Dignified white funeral wreath made of lilies. Symbol of purity and eternity for quiet remembrance of the deceased.' },
      keywords: { cs: ['bílý věnec', 'lilie', 'čistota', 'věčnost', 'vzpomínka'], en: ['white wreath', 'lilies', 'purity', 'eternity', 'remembrance'] },
    },
    active: true,
    featured: true,
  },
  {
    id: 'prod-heart-red-roses',
    name_cs: 'Srdce z červených růží',
    name_en: 'Heart of Red Roses',
    slug: 'srdce-z-cervenych-ruzi',
    description_cs: 'Pohřební věnec ve tvaru srdce z červených růží vyjadřující hlubokou lásku a nekonečnou vzpomínku na milovanou osobu.',
    description_en: 'Heart-shaped funeral wreath made of red roses expressing deep love and endless memory of a beloved person.',
    base_price: 3200,
    category_id: 'cat-wreaths-heart',
    images: [
      {
        id: 'img-heart-roses-1',
        url: '/images/products/heart-red-roses-1.jpg',
        alt: 'Srdce z červených růží - hlavní pohled',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    customization_options: [
      {
        id: 'size-heart',
        type: 'size',
        name: { cs: 'Velikost srdce', en: 'Heart Size' },
        choices: [
          { id: 'size-small', value: 'small', label: { cs: 'Malé (35 cm)', en: 'Small (35 cm)' }, priceModifier: 0, available: true },
          { id: 'size-large', value: 'large', label: { cs: 'Velké (50 cm)', en: 'Large (50 cm)' }, priceModifier: 800, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 5,
      maxOrderQuantity: 2,
      leadTimeHours: 36,
    },
    seo_metadata: {
      title: { cs: 'Srdce z červených růží - Pohřební věnce', en: 'Heart of Red Roses - Funeral Wreaths' },
      description: { cs: 'Pohřební věnec ve tvaru srdce z červených růží. Vyjádření hluboké lásky a věčné vzpomínky na milovanou osobu.', en: 'Heart-shaped funeral wreath made of red roses. Expression of deep love and eternal memory of a beloved person.' },
      keywords: { cs: ['srdce', 'červené růže', 'láska', 'vzpomínka', 'pohřební věnec'], en: ['heart', 'red roses', 'love', 'memory', 'funeral wreath'] },
    },
    active: true,
    featured: false,
  },
  {
    id: 'prod-cross-white-flowers',
    name_cs: 'Kříž z bílých květin',
    name_en: 'Cross of White Flowers',
    slug: 'kriz-z-bilych-kvetin',
    description_cs: 'Pohřební věnec ve tvaru kříže z bílých květin pro křesťanské pohřby. Symbol víry, naděje a věčného života.',
    description_en: 'Cross-shaped funeral wreath made of white flowers for Christian funerals. Symbol of faith, hope and eternal life.',
    base_price: 2900,
    category_id: 'cat-wreaths-cross',
    images: [
      {
        id: 'img-cross-white-1',
        url: '/images/products/cross-white-flowers-1.jpg',
        alt: 'Kříž z bílých květin - hlavní pohled',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    customization_options: [
      {
        id: 'size-cross',
        type: 'size',
        name: { cs: 'Velikost kříže', en: 'Cross Size' },
        choices: [
          { id: 'size-medium', value: 'medium', label: { cs: 'Střední (70 cm)', en: 'Medium (70 cm)' }, priceModifier: 0, available: true },
          { id: 'size-large', value: 'large', label: { cs: 'Velký (90 cm)', en: 'Large (90 cm)' }, priceModifier: 600, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 6,
      maxOrderQuantity: 2,
      leadTimeHours: 48,
    },
    seo_metadata: {
      title: { cs: 'Kříž z bílých květin - Pohřební věnce', en: 'Cross of White Flowers - Funeral Wreaths' },
      description: { cs: 'Pohřební věnec ve tvaru kříže z bílých květin. Symbol víry a naděje pro křesťanské pohřby.', en: 'Cross-shaped funeral wreath made of white flowers. Symbol of faith and hope for Christian funerals.' },
      keywords: { cs: ['kříž', 'bílé květiny', 'víra', 'naděje', 'křesťanský pohřeb'], en: ['cross', 'white flowers', 'faith', 'hope', 'christian funeral'] },
    },
    active: true,
    featured: false,
  },
  {
    id: 'prod-autumn-wreath',
    name_cs: 'Podzimní věnec',
    name_en: 'Autumn Wreath',
    slug: 'podzimni-venec',
    description_cs: 'Sezónní pohřební věnec s podzimními květinami a dekoracemi v teplých barvách. Ideální pro podzimní období.',
    description_en: 'Seasonal funeral wreath with autumn flowers and decorations in warm colors. Perfect for the autumn season.',
    base_price: 2600,
    category_id: 'cat-wreaths-seasonal',
    images: [
      {
        id: 'img-autumn-1',
        url: '/images/products/autumn-wreath-1.jpg',
        alt: 'Podzimní věnec - hlavní pohled',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    customization_options: [
      {
        id: 'size-autumn',
        type: 'size',
        name: { cs: 'Velikost věnce', en: 'Wreath Size' },
        choices: [
          { id: 'size-medium', value: 'medium', label: { cs: 'Střední (60 cm)', en: 'Medium (60 cm)' }, priceModifier: 0, available: true },
          { id: 'size-large', value: 'large', label: { cs: 'Velký (80 cm)', en: 'Large (80 cm)' }, priceModifier: 500, available: true },
        ],
        required: true,
        maxSelections: 1,
        minSelections: 1,
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 10,
      maxOrderQuantity: 4,
      leadTimeHours: 24,
    },
    seo_metadata: {
      title: { cs: 'Podzimní věnec - Pohřební věnce', en: 'Autumn Wreath - Funeral Wreaths' },
      description: { cs: 'Sezónní podzimní pohřební věnec s teplými barvami. Ideální pro podzimní období a vzpomínkové obřady.', en: 'Seasonal autumn funeral wreath with warm colors. Perfect for autumn season and memorial ceremonies.' },
      keywords: { cs: ['podzimní věnec', 'sezónní', 'teplé barvy', 'vzpomínka'], en: ['autumn wreath', 'seasonal', 'warm colors', 'remembrance'] },
    },
    active: true,
    featured: false,
  },
];

// Sample contact form submissions for testing
const sampleContactForms = [
  {
    id: 'contact-1',
    name: 'Marie Nováková',
    email: 'marie.novakova@email.cz',
    phone: '+420 123 456 789',
    subject: 'Dotaz na pohřební věnce',
    message: 'Dobrý den, chtěla bych se zeptat na možnost objednání klasického věnce pro pohřeb mé babičky. Potřebovala bych ho do zítřka. Je to možné? Děkuji.',
    status: 'new',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'contact-2',
    name: 'Jan Svoboda',
    email: 'jan.svoboda@gmail.com',
    phone: null,
    subject: 'Individuální požadavek',
    message: 'Zdravím, potřeboval bych speciální věnec ve tvaru srdce s modrými květinami. Jedná se o pohřeb mého syna. Můžete mi prosím zavolat? Děkuji.',
    status: 'read',
    ip_address: '10.0.0.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed categories
    console.log('📂 Seeding categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' });

    if (categoriesError) {
      console.error('❌ Error seeding categories:', categoriesError);
      throw categoriesError;
    }
    console.log('✅ Categories seeded successfully');

    // Seed products
    console.log('🌹 Seeding products...');
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (productsError) {
      console.error('❌ Error seeding products:', productsError);
      throw productsError;
    }
    console.log('✅ Products seeded successfully');

    // Seed sample contact forms
    console.log('📧 Seeding sample contact forms...');
    const { error: contactError } = await supabase
      .from('contact_forms')
      .upsert(sampleContactForms, { onConflict: 'id' });

    if (contactError) {
      console.error('❌ Error seeding contact forms:', contactError);
      throw contactError;
    }
    console.log('✅ Contact forms seeded successfully');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Seeded data summary:
   • ${categories.length} categories
   • ${products.length} products
   • ${sampleContactForms.length} sample contact forms
    `);

  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

import { ProductDetail } from "@/components/product/ProductDetail";
import type { Product } from "@/types/product";

interface TestProductPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TestProductPage({ params }: TestProductPageProps) {
  const { locale } = await params;

  // Mock product data for testing
  const mockProduct: Product = {
    id: "test-product-1",
    nameCs: "Klasický pohřební věnec",
    nameEn: "Classic Funeral Wreath",
    slug: "test-product",
    descriptionCs:
      "Tradiční pohřební věnec z čerstvých květin s bílými chryzantémami a zelenými listy. Ručně vyráběný našimi zkušenými floristy s důrazem na kvalitu a detail.",
    descriptionEn:
      "Traditional funeral wreath made from fresh flowers with white chrysanthemums and green leaves. Handcrafted by our experienced florists with emphasis on quality and detail.",
    basePrice: 1200,
    categoryId: "cat-1",
    images: [
      {
        id: "img-1",
        url: "/funeral-wreaths-and-floral-arrangement-001.png",
        alt: "Klasický pohřební věnec",
        width: 600,
        height: 600,
        isPrimary: true,
        sortOrder: 1,
      },
      {
        id: "img-2",
        url: "/funeral-wreaths-and-floral-arrangement-002.png",
        alt: "Detail věnce",
        width: 600,
        height: 600,
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    customizationOptions: [
      {
        id: "size",
        type: "size",
        name: { cs: "Velikost", en: "Size" },
        description: { cs: "Vyberte velikost věnce", en: "Choose wreath size" },
        required: true,
        maxSelections: 1,
        choices: [
          {
            id: "small",
            value: "small",
            label: { cs: "Malý (40cm)", en: "Small (40cm)" },
            priceModifier: 0,
            available: true,
          },
          {
            id: "medium",
            value: "medium",
            label: { cs: "Střední (60cm)", en: "Medium (60cm)" },
            priceModifier: 300,
            available: true,
          },
          {
            id: "large",
            value: "large",
            label: { cs: "Velký (80cm)", en: "Large (80cm)" },
            priceModifier: 600,
            available: true,
          },
        ],
      },
      {
        id: "ribbon",
        type: "ribbon",
        name: { cs: "Stuha", en: "Ribbon" },
        description: { cs: "Vyberte barvu stuhy", en: "Choose ribbon color" },
        required: false,
        maxSelections: 1,
        choices: [
          {
            id: "white",
            value: "white",
            label: { cs: "Bílá stuha", en: "White ribbon" },
            priceModifier: 0,
            available: true,
          },
          {
            id: "black",
            value: "black",
            label: { cs: "Černá stuha", en: "Black ribbon" },
            priceModifier: 0,
            available: true,
          },
          {
            id: "gold",
            value: "gold",
            label: { cs: "Zlatá stuha", en: "Gold ribbon" },
            priceModifier: 50,
            available: true,
          },
        ],
      },
      {
        id: "flowers",
        type: "flowers",
        name: { cs: "Doplňkové květiny", en: "Additional Flowers" },
        description: { cs: "Přidejte další květiny", en: "Add extra flowers" },
        required: false,
        maxSelections: 2,
        choices: [
          {
            id: "roses",
            value: "roses",
            label: { cs: "Bílé růže", en: "White roses" },
            priceModifier: 200,
            available: true,
          },
          {
            id: "lilies",
            value: "lilies",
            label: { cs: "Bílé lilie", en: "White lilies" },
            priceModifier: 150,
            available: true,
          },
          {
            id: "carnations",
            value: "carnations",
            label: { cs: "Karafiáty", en: "Carnations" },
            priceModifier: 100,
            available: false,
          },
        ],
      },
      {
        id: "message",
        type: "message",
        name: { cs: "Věnování", en: "Dedication" },
        description: { cs: "Osobní vzkaz na stuhu", en: "Personal message on ribbon" },
        required: false,
        choices: [],
      },
    ],
    availability: {
      inStock: true,
      stockQuantity: 15,
      leadTimeHours: 24,
      maxOrderQuantity: 5,
    },
    seoMetadata: {
      title: { cs: "Klasický pohřební věnec", en: "Classic Funeral Wreath" },
      description: {
        cs: "Tradiční pohřební věnec z čerstvých květin",
        en: "Traditional funeral wreath made from fresh flowers",
      },
    },
    active: true,
    featured: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    name: { cs: "Klasický pohřební věnec", en: "Classic Funeral Wreath" },
    description: {
      cs: "Tradiční pohřební věnec z čerstvých květin s bílými chryzantémami a zelenými listy. Ručně vyráběný našimi zkušenými floristy s důrazem na kvalitu a detail.",
      en: "Traditional funeral wreath made from fresh flowers with white chrysanthemums and green leaves. Handcrafted by our experienced florists with emphasis on quality and detail.",
    },
    category: {
      id: "cat-1",
      nameCs: "Pohřební věnce",
      nameEn: "Funeral Wreaths",
      slug: "funeral-wreaths",
      sortOrder: 1,
      active: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      name: { cs: "Pohřební věnce", en: "Funeral Wreaths" },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Test Page:</strong> This is a test page to demonstrate the Product Detail and
          Customization System functionality.
        </p>
      </div>
      <ProductDetail product={mockProduct} locale={locale} />
    </div>
  );
}

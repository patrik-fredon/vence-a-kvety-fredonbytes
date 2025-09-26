#!/usr/bin/env node

/**
 * Enhanced seeding script for funeral wreaths e-commerce
 * Seeds 13 products with standardized customization_options using Supabase-js client
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Product data with standardized customization_options
const PRODUCTS_DATA = [
  {
    name_cs: "Klasický bílý pohřební věnec",
    name_en: "Classic White Funeral Wreath",
    slug: "classic-white-funeral-wreath",
    description_cs:
      "Tradiční pohřební věnec z čerstvých bílých chryzantém, růží a zelených listů. Elegantní a důstojný design vhodný pro všechny typy pohřebních obřadů. Věnec je ručně vyráběn našimi zkušenými floristy s důrazem na kvalitu a detail.",
    description_en:
      "Traditional funeral wreath made from fresh white chrysanthemums, roses and green leaves. Elegant and dignified design suitable for all types of funeral ceremonies. The wreath is handcrafted by our experienced florists with emphasis on quality and detail.",
    base_price: 1200.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-001.png",
        alt: "Klasický bílý pohřební věnec",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-002.png",
        alt: "Detail bílých chryzantém",
        primary: false,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-003.png",
        alt: "Celkový pohled na věnec",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 25,
      estimatedDelivery: "next-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: [],
    },
    seo_metadata: {
      title: {
        cs: "Klasický bílý pohřební věnec | Pohřební věnce",
        en: "Classic White Funeral Wreath | Funeral Wreaths",
      },
      description: {
        cs: "Tradiční bílý pohřební věnec z čerstvých květin. Rychlé dodání po celé ČR.",
        en: "Traditional white funeral wreath from fresh flowers. Fast delivery across Czech Republic.",
      },
      keywords: {
        cs: "pohřební věnec, bílý věnec, chryzantémy, pohřeb",
        en: "funeral wreath, white wreath, chrysanthemums, funeral",
      },
    },
    featured: true,
    active: true,
  },
  {
    name_cs: "Růžový smuteční věnec s liliemi",
    name_en: "Pink Mourning Wreath with Lilies",
    slug: "pink-mourning-wreath-lilies",
    description_cs:
      "Jemný smuteční věnec s růžovými růžemi, bílými liliemi a zelenými listy. Symbolizuje lásku, naději a věčnou vzpomínku. Ideální pro rozloučení s blízkými osobami, zejména ženami a mladými lidmi.",
    description_en:
      "Gentle mourning wreath with pink roses, white lilies and green leaves. Symbolizes love, hope and eternal memory. Ideal for farewell to loved ones, especially women and young people.",
    base_price: 1500.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-004.png",
        alt: "Růžový smuteční věnec s liliemi",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-005.png",
        alt: "Detail růžových růží",
        primary: false,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-006.png",
        alt: "Bílé lilie v kompozici",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 15,
      estimatedDelivery: "next-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["fresh_lilies"],
    },
    seo_metadata: {
      title: {
        cs: "Růžový smuteční věnec s liliemi | Pohřební květiny",
        en: "Pink Mourning Wreath with Lilies | Funeral Flowers",
      },
      description: {
        cs: "Jemný růžový věnec s liliemi pro důstojné rozloučení. Expresní dodání.",
        en: "Gentle pink wreath with lilies for dignified farewell. Express delivery.",
      },
      keywords: {
        cs: "růžový věnec, lilie, smuteční květiny, pohřeb ženy",
        en: "pink wreath, lilies, mourning flowers, woman funeral",
      },
    },
    featured: true,
    active: true,
  },
  {
    name_cs: "Moderní asymetrický věnec",
    name_en: "Modern Asymmetric Wreath",
    slug: "modern-asymmetric-wreath",
    description_cs:
      "Současný designový věnec s asymetrickou kompozicí. Kombinuje tradiční květiny s moderními prvky jako jsou sukulenty a netradiční zelené rostliny. Vhodný pro mladší generaci a milovníky moderního designu.",
    description_en:
      "Contemporary design wreath with asymmetric composition. Combines traditional flowers with modern elements such as succulents and non-traditional green plants. Suitable for younger generation and lovers of modern design.",
    base_price: 1800.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-007.png",
        alt: "Moderní asymetrický věnec",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-008.png",
        alt: "Detail moderní kompozice",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 8,
      estimatedDelivery: "2-3-days",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: false,
      specialRequirements: ["designer_consultation"],
    },
    seo_metadata: {
      title: {
        cs: "Moderní asymetrický pohřební věnec | Designové věnce",
        en: "Modern Asymmetric Funeral Wreath | Designer Wreaths",
      },
      description: {
        cs: "Současný designový věnec s asymetrickou kompozicí. Unikátní design.",
        en: "Contemporary design wreath with asymmetric composition. Unique design.",
      },
      keywords: {
        cs: "moderní věnec, asymetrický design, současný pohřeb",
        en: "modern wreath, asymmetric design, contemporary funeral",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Srdcový věnec z červených růží",
    name_en: "Heart Wreath with Red Roses",
    slug: "heart-wreath-red-roses",
    description_cs:
      "Romantický srdcový věnec z červených růží symbolizující věčnou lásku a oddanost. Ideální pro rozloučení s životním partnerem nebo partnerkou. Ručně vyráběný s největší péčí a citem.",
    description_en:
      "Romantic heart wreath with red roses symbolizing eternal love and devotion. Ideal for farewell to life partner. Handcrafted with the greatest care and sensitivity.",
    base_price: 2200.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-009.png",
        alt: "Srdcový věnec z červených růží",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-010.png",
        alt: "Detail červených růží",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 5,
      estimatedDelivery: "next-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["premium_roses", "careful_handling"],
    },
    seo_metadata: {
      title: {
        cs: "Srdcový věnec z červených růží | Romantické věnce",
        en: "Heart Wreath with Red Roses | Romantic Wreaths",
      },
      description: {
        cs: "Romantický srdcový věnec symbolizující věčnou lásku. Prémiové červené růže.",
        en: "Romantic heart wreath symbolizing eternal love. Premium red roses.",
      },
      keywords: {
        cs: "srdcový věnec, červené růže, láska, partner",
        en: "heart wreath, red roses, love, partner",
      },
    },
    featured: true,
    active: true,
  },
  {
    name_cs: "Elegantní bílá smuteční kytice",
    name_en: "Elegant White Mourning Bouquet",
    slug: "elegant-white-mourning-bouquet",
    description_cs:
      "Elegantní smuteční kytice z bílých a krémových květin včetně růží, lilií a eustomy. Vázaná v klasickém stylu s přírodními materiály. Vhodná pro položení k rakvi nebo jako dar pozůstalým.",
    description_en:
      "Elegant mourning bouquet made from white and cream flowers including roses, lilies and eustoma. Tied in classic style with natural materials. Suitable for placing by the coffin or as a gift to the bereaved.",
    base_price: 800.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-011.png",
        alt: "Elegantní bílá smuteční kytice",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-012.png",
        alt: "Detail bílých květin",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 20,
      estimatedDelivery: "same-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: [],
    },
    seo_metadata: {
      title: {
        cs: "Elegantní bílá smuteční kytice | Smuteční květiny",
        en: "Elegant White Mourning Bouquet | Mourning Flowers",
      },
      description: {
        cs: "Elegantní bílá kytice pro vyjádření soustrasti. Dodání tentýž den.",
        en: "Elegant white bouquet to express condolences. Same-day delivery.",
      },
      keywords: {
        cs: "smuteční kytice, bílé květiny, kondolence",
        en: "mourning bouquet, white flowers, condolences",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Trvalý věnec na hrob - podzimní",
    name_en: "Permanent Grave Wreath - Autumn",
    slug: "permanent-grave-wreath-autumn",
    description_cs:
      "Trvalý věnec z umělých květin v podzimních barvách pro dlouhodobou úpravu hrobu. Odolný vůči povětrnostním vlivům, vydrží celou sezónu. Kombinuje oranžové, žluté a hnědé tóny s přírodními prvky.",
    description_en:
      "Permanent wreath made from artificial flowers in autumn colors for long-term grave decoration. Weather resistant, lasts the entire season. Combines orange, yellow and brown tones with natural elements.",
    base_price: 900.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-013.png",
        alt: "Trvalý podzimní věnec na hrob",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-014.png",
        alt: "Detail podzimních barev",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 30,
      estimatedDelivery: "2-3-days",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: false,
      specialRequirements: ["weather_resistant"],
    },
    seo_metadata: {
      title: {
        cs: "Trvalý podzimní věnec na hrob | Hrobové věnce",
        en: "Permanent Autumn Grave Wreath | Grave Wreaths",
      },
      description: {
        cs: "Odolný podzimní věnec pro dlouhodobou úpravu hrobu. Umělé květiny.",
        en: "Durable autumn wreath for long-term grave decoration. Artificial flowers.",
      },
      keywords: {
        cs: "hrobový věnec, podzimní, trvalý, umělé květiny",
        en: "grave wreath, autumn, permanent, artificial flowers",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Smuteční svíčka s květinovou dekorací",
    name_en: "Mourning Candle with Floral Decoration",
    slug: "mourning-candle-floral-decoration",
    description_cs:
      "Elegantní smuteční svíčka obklopená jemnou květinovou dekorací. Symbolizuje světlo a naději v temných chvílích. Vhodná jako doplněk k hlavní květinové výzdobě nebo jako samostatný dar.",
    description_en:
      "Elegant mourning candle surrounded by delicate floral decoration. Symbolizes light and hope in dark moments. Suitable as a complement to main floral decoration or as a standalone gift.",
    base_price: 350.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-015.png",
        alt: "Smuteční svíčka s květinovou dekorací",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-016.png",
        alt: "Detail květinové dekorace",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 50,
      estimatedDelivery: "same-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["fragile_handling"],
    },
    seo_metadata: {
      title: {
        cs: "Smuteční svíčka s květinovou dekorací | Smuteční doplňky",
        en: "Mourning Candle with Floral Decoration | Mourning Accessories",
      },
      description: {
        cs: "Elegantní smuteční svíčka s jemnou květinovou dekorací. Rychlé dodání.",
        en: "Elegant mourning candle with delicate floral decoration. Fast delivery.",
      },
      keywords: {
        cs: "smuteční svíčka, květinová dekorace, kondolence",
        en: "mourning candle, floral decoration, condolences",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Žlutý věnec s gerberami",
    name_en: "Yellow Wreath with Gerberas",
    slug: "yellow-wreath-gerberas",
    description_cs:
      "Veselý žlutý věnec s čerstvými gerberami a slunečnicemi. Symbolizuje radost ze života a světlé vzpomínky. Ideální pro rozloučení s osobami, které milovali život a přírodu.",
    description_en:
      "Cheerful yellow wreath with fresh gerberas and sunflowers. Symbolizes joy of life and bright memories. Ideal for farewell to people who loved life and nature.",
    base_price: 1350.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-017.png",
        alt: "Žlutý věnec s gerberami",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-018.png",
        alt: "Detail žlutých gerber",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 12,
      estimatedDelivery: "next-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["fresh_gerberas"],
    },
    seo_metadata: {
      title: {
        cs: "Žlutý věnec s gerberami | Barevné věnce",
        en: "Yellow Wreath with Gerberas | Colorful Wreaths",
      },
      description: {
        cs: "Veselý žlutý věnec symbolizující radost ze života. Čerstvé gerbery.",
        en: "Cheerful yellow wreath symbolizing joy of life. Fresh gerberas.",
      },
      keywords: {
        cs: "žlutý věnec, gerbery, radost, světlé vzpomínky",
        en: "yellow wreath, gerberas, joy, bright memories",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Fialový věnec s orchidejemi",
    name_en: "Purple Wreath with Orchids",
    slug: "purple-wreath-orchids",
    description_cs:
      "Luxusní fialový věnec s exotickými orchidejemi a fialovými růžemi. Symbolizuje eleganci, důstojnost a vzácnost. Vhodný pro rozloučení s výjimečnými osobnostmi.",
    description_en:
      "Luxury purple wreath with exotic orchids and purple roses. Symbolizes elegance, dignity and rarity. Suitable for farewell to exceptional personalities.",
    base_price: 2500.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-019.png",
        alt: "Fialový věnec s orchidejemi",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-020.png",
        alt: "Detail fialových orchidejí",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 3,
      estimatedDelivery: "2-3-days",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: false,
      specialRequirements: ["exotic_orchids", "premium_handling"],
    },
    seo_metadata: {
      title: {
        cs: "Fialový věnec s orchidejemi | Luxusní věnce",
        en: "Purple Wreath with Orchids | Luxury Wreaths",
      },
      description: {
        cs: "Luxusní fialový věnec s exotickými orchidejemi. Výjimečná elegance.",
        en: "Luxury purple wreath with exotic orchids. Exceptional elegance.",
      },
      keywords: {
        cs: "fialový věnec, orchideje, luxus, elegance",
        en: "purple wreath, orchids, luxury, elegance",
      },
    },
    featured: true,
    active: true,
  },
  {
    name_cs: "Smíšený barevný věnec",
    name_en: "Mixed Colorful Wreath",
    slug: "mixed-colorful-wreath",
    description_cs:
      "Pestrobarevný věnec kombinující různé druhy květin v harmonických barvách. Obsahuje růže, gerbery, chryzantémy a sezónní květiny. Symbolizuje rozmanitost a bohatost života.",
    description_en:
      "Colorful wreath combining various flower types in harmonious colors. Contains roses, gerberas, chrysanthemums and seasonal flowers. Symbolizes diversity and richness of life.",
    base_price: 1650.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-021.png",
        alt: "Smíšený barevný věnec",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-022.png",
        alt: "Detail barevných květin",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 10,
      estimatedDelivery: "next-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["mixed_flowers"],
    },
    seo_metadata: {
      title: {
        cs: "Smíšený barevný věnec | Pestrobarevné věnce",
        en: "Mixed Colorful Wreath | Multicolor Wreaths",
      },
      description: {
        cs: "Pestrobarevný věnec symbolizující bohatství života. Různé druhy květin.",
        en: "Colorful wreath symbolizing richness of life. Various flower types.",
      },
      keywords: {
        cs: "barevný věnec, smíšené květiny, rozmanitost",
        en: "colorful wreath, mixed flowers, diversity",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Minimalistický bílý věnec",
    name_en: "Minimalist White Wreath",
    slug: "minimalist-white-wreath",
    description_cs:
      "Jednoduchý a elegantní bílý věnec v minimalistickém stylu. Obsahuje pouze bílé růže a zelené listy v čisté kompozici. Symbolizuje čistotu, jednoduchost a klid.",
    description_en:
      "Simple and elegant white wreath in minimalist style. Contains only white roses and green leaves in clean composition. Symbolizes purity, simplicity and peace.",
    base_price: 1100.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-023.png",
        alt: "Minimalistický bílý věnec",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-024.png",
        alt: "Detail minimalistické kompozice",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 18,
      estimatedDelivery: "same-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: [],
    },
    seo_metadata: {
      title: {
        cs: "Minimalistický bílý věnec | Jednoduché věnce",
        en: "Minimalist White Wreath | Simple Wreaths",
      },
      description: {
        cs: "Jednoduchý bílý věnec v minimalistickém stylu. Čistá elegance.",
        en: "Simple white wreath in minimalist style. Pure elegance.",
      },
      keywords: {
        cs: "minimalistický věnec, jednoduchost, čistota",
        en: "minimalist wreath, simplicity, purity",
      },
    },
    featured: false,
    active: true,
  },
  {
    name_cs: "Luxusní prémiový věnec",
    name_en: "Luxury Premium Wreath",
    slug: "luxury-premium-wreath",
    description_cs:
      "Nejluxusnější věnec z naší nabídky vyrobený z nejkvalitnějších importovaných květin. Obsahuje prémiové růže, orchideje, lilie a vzácné exotické květiny. Symbolizuje výjimečnost a úctu.",
    description_en:
      "The most luxurious wreath from our offer made from the highest quality imported flowers. Contains premium roses, orchids, lilies and rare exotic flowers. Symbolizes uniqueness and respect.",
    base_price: 3500.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-001.png",
        alt: "Luxusní prémiový věnec",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-003.png",
        alt: "Detail prémiových květin",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 2,
      estimatedDelivery: "3-5-days",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: false,
      specialRequirements: [
        "premium_flowers",
        "master_florist",
        "special_handling",
      ],
    },
    seo_metadata: {
      title: {
        cs: "Luxusní prémiový věnec | Exkluzivní věnce",
        en: "Luxury Premium Wreath | Exclusive Wreaths",
      },
      description: {
        cs: "Nejluxusnější věnec z importovaných prémiových květin. Výjimečná kvalita.",
        en: "Most luxurious wreath from imported premium flowers. Exceptional quality.",
      },
      keywords: {
        cs: "luxusní věnec, prémiové květiny, exkluzivní",
        en: "luxury wreath, premium flowers, exclusive",
      },
    },
    featured: true,
    active: true,
  },
  {
    name_cs: "Jarní sezónní kytice",
    name_en: "Seasonal Spring Bouquet",
    slug: "seasonal-spring-bouquet",
    description_cs:
      "Svěží jarní kytice z tulipánů, narcisů a prvosenek v jemných pastelových barvách. Symbolizuje nový začátek, naději a obnovu života. Ideální pro jarní rozloučení.",
    description_en:
      "Fresh spring bouquet with tulips, daffodils and primroses in gentle pastel colors. Symbolizes new beginning, hope and renewal of life. Ideal for spring farewell.",
    base_price: 650.0,
    images: [
      {
        url: "/funeral-wreaths-and-floral-arrangement-027.png",
        alt: "Jarní sezónní kytice",
        primary: true,
      },
      {
        url: "/funeral-wreaths-and-floral-arrangement-028.png",
        alt: "Detail jarních květin",
        primary: false,
      },
    ],
    availability: {
      inStock: true,
      quantity: 15,
      estimatedDelivery: "same-day",
      lastUpdated: "2024-01-15T10:00:00Z",
      seasonalAvailability: true,
      specialRequirements: ["seasonal_flowers"],
    },
    seo_metadata: {
      title: {
        cs: "Jarní sezónní kytice | Sezónní květiny",
        en: "Seasonal Spring Bouquet | Seasonal Flowers",
      },
      description: {
        cs: "Svěží jarní kytice symbolizující nový začátek. Sezónní květiny.",
        en: "Fresh spring bouquet symbolizing new beginning. Seasonal flowers.",
      },
      keywords: {
        cs: "jarní kytice, tulipány, narcisy, naděje",
        en: "spring bouquet, tulips, daffodils, hope",
      },
    },
    featured: false,
    active: true,
  },
];

// Standardized customization_options for ALL products
const STANDARDIZED_CUSTOMIZATION_OPTIONS = [
  {
    id: "size",
    type: "size",
    name: { cs: "Velikost", en: "Size" },
    required: true,
    minSelections: 1,
    maxSelections: 1,
    choices: [
      {
        id: "size_120",
        label: { cs: "120cm průměr", en: "120cm diameter" },
        priceModifier: 0,
        available: true,
      },
      {
        id: "size_150",
        label: { cs: "150cm průměr", en: "150cm diameter" },
        priceModifier: 500,
        available: true,
      },
      {
        id: "size_180",
        label: { cs: "180cm průměr", en: "180cm diameter" },
        priceModifier: 1000,
        available: true,
      },
    ],
  },
  {
    id: "ribbon",
    type: "ribbon",
    name: { cs: "Stuha", en: "Ribbon" },
    required: true,
    minSelections: 1,
    maxSelections: 1,
    choices: [
      {
        id: "ribbon_yes",
        label: { cs: "Ano, přidat stuhu", en: "Yes, add ribbon" },
        priceModifier: 0,
      },
      {
        id: "ribbon_no",
        label: { cs: "Nechci stuhu", en: "No, without ribbon" },
        priceModifier: 0,
      },
    ],
  },
  {
    id: "ribbon_color",
    type: "ribbon_color",
    name: { cs: "Barva stuhy", en: "Ribbon Color" },
    required: false,
    dependsOn: {
      optionId: "ribbon",
      requiredChoiceIds: ["ribbon_yes"],
      condition: "selected",
    },
    choices: [
      {
        id: "color_black",
        label: { cs: "Černá", en: "Black" },
        priceModifier: 50,
      },
      {
        id: "color_white",
        label: { cs: "Bílá", en: "White" },
        priceModifier: 50,
      },
      {
        id: "color_red",
        label: { cs: "Červená", en: "Red" },
        priceModifier: 50,
      },
      {
        id: "color_gold",
        label: { cs: "Zlatá", en: "Gold" },
        priceModifier: 75,
      },
      {
        id: "color_silver",
        label: { cs: "Stříbrná", en: "Silver" },
        priceModifier: 75,
      },
    ],
  },
  {
    id: "ribbon_text",
    type: "ribbon_text",
    name: { cs: "Text na stuze", en: "Ribbon Text" },
    required: false,
    dependsOn: {
      optionId: "ribbon",
      requiredChoiceIds: ["ribbon_yes"],
      condition: "selected",
    },
    choices: [
      {
        id: "text_sympathy",
        label: { cs: "S upřímnou soustrasti", en: "With sincere sympathy" },
        priceModifier: 50,
      },
      {
        id: "text_memory",
        label: { cs: "Na věčnou památku", en: "In eternal memory" },
        priceModifier: 50,
      },
      {
        id: "text_love",
        label: { cs: "S láskou vzpomínáme", en: "With love we remember" },
        priceModifier: 50,
      },
      {
        id: "text_respect",
        label: { cs: "S úctou a respektem", en: "With honor and respect" },
        priceModifier: 50,
      },
      {
        id: "text_custom",
        label: { cs: "Vlastní text", en: "Custom text" },
        priceModifier: 100,
        allowCustomInput: true,
        maxLength: 50,
      },
    ],
  },
  {
    id: "delivery_time",
    type: "delivery",
    name: { cs: "Čas dodání", en: "Delivery Time" },
    required: true,
    minSelections: 1,
    maxSelections: 1,
    choices: [
      {
        id: "next_day_morning",
        label: {
          cs: "Následující den ráno (do 10:00)",
          en: "Next day morning (by 10:00 AM)",
        },
        priceModifier: 0,
        available: true,
      },
      {
        id: "custom_date",
        label: {
          cs: "Vlastní datum (kalendář)",
          en: "Custom date (calendar)",
        },
        priceModifier: 0,
        available: true,
        requiresCalendar: true,
        allowCustomInput: true,
        inputType: "date",
        minDaysFromNow: 1,
        maxDaysFromNow: 30,
      },
    ],
  },
];

async function runEnhancedSeeding() {
  console.log("🌱 Starting enhanced data seeding...");

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing required environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔗 Connected to Supabase");

    // Prepare products data with standardized customization_options
    const productsToInsert = PRODUCTS_DATA.map((product) => ({
      ...product,
      customization_options: STANDARDIZED_CUSTOMIZATION_OPTIONS,
    }));

    console.log(
      `📦 Preparing to insert ${productsToInsert.length} products...`
    );

    // Clear existing products (optional - remove if you want to keep existing data)
    console.log("🧹 Clearing existing products...");
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all products

    if (deleteError) {
      console.warn(
        "⚠️  Warning clearing existing products:",
        deleteError.message
      );
    } else {
      console.log("✅ Existing products cleared");
    }

    // Insert products in batches to avoid timeout
    const batchSize = 5;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);

      console.log(
        `⚡ Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          productsToInsert.length / batchSize
        )} (${batch.length} products)...`
      );

      const { data, error } = await supabase
        .from("products")
        .insert(batch)
        .select("id, slug");

      if (error) {
        console.error(
          `❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
          error.message
        );
        errorCount += batch.length;
      } else {
        console.log(
          `✅ Successfully inserted batch ${Math.floor(i / batchSize) + 1}: ${
            data.length
          } products`
        );
        successCount += data.length;
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`   ✅ Successfully inserted: ${successCount} products`);
    console.log(`   ❌ Failed to insert: ${errorCount} products`);

    // Verify the seeding by checking data
    console.log("\n🔍 Verifying seeded data...");

    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, slug, name_cs, customization_options")
      .eq("active", true);

    if (prodError) {
      console.error("❌ Error fetching products:", prodError.message);
    } else {
      console.log(`✅ Products in database: ${products?.length || 0}`);
      console.log(
        `✅ Featured products: ${
          products?.filter((p) => p.featured).length || 0
        }`
      );

      // Verify customization_options are standardized
      const hasStandardizedOptions = products?.every(
        (p) =>
          p.customization_options &&
          Array.isArray(p.customization_options) &&
          p.customization_options.length === 5
      );

      console.log(
        `✅ All products have standardized customization_options: ${
          hasStandardizedOptions ? "Yes" : "No"
        }`
      );
    }

    console.log("\n🎉 Enhanced seeding completed!");
    console.log("\n📋 Next steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Visit: http://localhost:3000/cs/products");
    console.log("   3. Test product customization options");
    console.log("   4. Test add to cart functionality");
    console.log(
      "   5. Verify all products have identical customization options"
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  runEnhancedSeeding().catch(console.error);
}

module.exports = { runEnhancedSeeding };

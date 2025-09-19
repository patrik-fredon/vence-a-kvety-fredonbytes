# Content Analysis and Inventory

## Executive Summary

This document provides a comprehensive analysis of the company content from `docs/company-data-each-page.md` and maps it to the existing i18n structure in `messages/cs.json` and `messages/en.json`.

## Content Sections Identified

### 1. Landing Page / Home Content

#### Philosophy Section

- **Original Quote**: "Zivot je krehky jak motyli prach -- prach jsi a v prach se obratis."
- **Extended Text**: Philosophical reflection on life transformation using butterfly metaphor
- **Mapping Target**: `home.philosophy` (new subsection)
- **Content Type**: Emotional/philosophical messaging
- **Tone**: Reflective, empathetic, respectful

#### Benefits Section

- **Content**: 4 key value propositions
  1. Garance čerstvosti (Freshness guarantee)
  2. Doručení (Delivery)
  3. Pečlivá práce (Careful work)
  4. Možnost se realizovat (Customization options)
- **Mapping Target**: `home.benefits` (enhance existing features)
- **Content Type**: Trust-building, conversion-focused
- **Tone**: Professional, reassuring

### 2. FAQ Content

#### Questions Identified

1. **Wreath Storage and Care**: How to store and care for wreaths
2. **Flower Longevity**: How long flowers stay fresh
3. **Disposal**: What to do with wreaths after wilting

#### Content Structure

- **Mapping Target**: `faq` (new section)
- **Structure**: Array of question-answer objects
- **Content Type**: Practical, helpful information
- **Tone**: Informative, caring

### 3. Product Grid Content

#### Introductory Text

- **Content**: Symbolism of funeral wreaths and flowers
- **Mapping Target**: `product.gridIntroduction` (new field)
- **Content Type**: Educational, respectful

#### Product Specifications

- **Price Range**: 2,000 - 10,000 CZK
- **Colors**: 7 options (fialová, bílá, růžová, žlutá, zelená, červená, oranžová)
- **Sizes**: 5 options (45cm, 50cm, 60cm, 70cm, 80cm)
- **Shapes**: 4 options (srdce, kruh, kříž, obdélník)
- **Product Names**: 7 butterfly-themed names (Pieris, Danaus, Maniola, Thymelicus, Kallima, Euphorion, Lycaena)

### 4. About Section Content

#### Company Description

- **Content**: Small family floral workshop description
- **Focus**: Attention to detail, careful flower selection
- **Personal Touch**: Individual care for each order
- **Mapping Target**: `about` (new section or enhance existing)
- **Content Type**: Brand story, credibility building
- **Tone**: Personal, professional, caring

## Existing i18n Structure Analysis

### Current Home Section

```json
"home": {
  "title": "Pohřební věnce",
  "subtitle": "Prémiové pohřební věnce a květinové aranžmá pro důstojné rozloučení",
  "description": "Ruční výroba, pečlivý výběr květin a rychlé dodání...",
  "browseWreaths": "Prohlédnout věnce",
  "contactUs": "Kontaktovat nás",
  "features": {
    "handcrafted": {...},
    "fastDelivery": {...},
    "personalApproach": {...}
  }
}
```

### Missing Sections

- No `faq` section
- No dedicated `about` section beyond footer
- No `philosophy` subsection in home
- Limited SEO metadata

## Content Mapping Strategy

### 1. Home Section Enhancement

- **Add**: `home.philosophy` subsection
- **Enhance**: `home.benefits` to replace/enhance existing features
- **Add**: `home.hero` subsection for main messaging
- **Maintain**: Existing structure compatibility

### 2. New FAQ Section

```json
"faq": {
  "title": "Často kladené otázky",
  "items": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}
```

### 3. About Section Creation

```json
"about": {
  "title": "O nás",
  "mission": "...",
  "story": "...",
  "values": "..."
}
```

### 4. SEO Enhancement

```json
"seo": {
  "home": {
    "title": "...",
    "description": "...",
    "keywords": ["pohřební věnce", "květinové aranžmá", ...]
  }
}
```

## Content Categorization by Page Type

### Homepage Content

- Hero section (title, subtitle, CTA)
- Philosophy section (quote + explanation)
- Benefits section (4 key benefits)
- Features section (existing 3 features)

### FAQ Page Content

- 3 main FAQ items
- Structured for SEO optimization
- Practical, helpful information

### About Page Content

- Company story
- Mission statement
- Quality commitment
- Personal approach

### Product Pages Content

- Category introductions
- Product specifications
- Customization options

## Content Quality Assessment

### Strengths

- Authentic, personal tone
- Practical, helpful information
- Clear value propositions
- Emotional connection through philosophy

### Areas for Professional Enhancement

- Grammar and spelling corrections needed
- SEO optimization required
- Conversion-focused messaging improvements
- Professional copywriting polish
- Consistent tone across all sections

## Implementation Priority

1. **High Priority**: Home section enhancement (hero, philosophy, benefits)
2. **High Priority**: FAQ section creation
3. **Medium Priority**: About section enhancement
4. **Medium Priority**: SEO metadata addition
5. **Low Priority**: Product content enhancement

## Technical Considerations

### JSON Structure Compatibility

- Must maintain existing key names
- Add new sections without breaking existing functionality
- Ensure proper nesting and validation

### Translation Requirements

- All Czech content needs English translation
- Maintain emotional tone and meaning
- Cultural adaptation for international audience
- SEO keyword research for English market

### Component Integration

- Verify existing components can handle new structure
- May need component updates for new sections
- Test rendering and functionality

## Next Steps

1. Professional copywriting and editing of Czech content
2. SEO optimization and keyword integration
3. JSON structure implementation
4. English translation and localization
5. Component integration testing
6. Quality assurance and validation

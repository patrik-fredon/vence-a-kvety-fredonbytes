# Content Mapping to i18n Structure

## Overview

This document provides the detailed mapping of company content from `docs/company-data-each-page.md` to the enhanced i18n JSON structure.

## Enhanced JSON Structure Design

### 1. Home Section Enhancement

```json
"home": {
  // Existing fields (to be enhanced)
  "title": "Pohřební věnce",
  "subtitle": "Enhanced with professional copywriting",
  "description": "Enhanced with conversion focus",
  "browseWreaths": "Prohlédnout věnce",
  "contactUs": "Kontaktovat nás",

  // NEW: Hero subsection
  "hero": {
    "title": "Professional headline based on philosophy",
    "subtitle": "Conversion-focused subtitle",
    "description": "Trust-building description",
    "cta": "Primary call-to-action"
  },

  // NEW: Philosophy subsection
  "philosophy": {
    "quote": "Refined version of butterfly quote",
    "text": "Professional explanation of life transformation metaphor"
  },

  // ENHANCED: Benefits subsection (replaces features)
  "benefits": {
    "title": "Proč si vybrat naše služby",
    "items": [
      {
        "title": "Garance čerstvosti",
        "description": "Professional copy about fresh flower guarantee"
      },
      {
        "title": "Spolehlivé doručení",
        "description": "Professional copy about delivery reliability"
      },
      {
        "title": "Pečlivá ruční práce",
        "description": "Professional copy about craftsmanship"
      },
      {
        "title": "Možnost přizpůsobení",
        "description": "Professional copy about customization options"
      }
    ]
  }
}
```

### 2. New FAQ Section

```json
"faq": {
  "title": "Často kladené otázky",
  "subtitle": "Odpovědi na nejčastější dotazy o našich věncích",
  "items": [
    {
      "question": "Jak věnec skladovat a pečovat o něj?",
      "answer": "Professional rewrite of storage instructions"
    },
    {
      "question": "Jak dlouho květiny vydrží čerstvé?",
      "answer": "Professional rewrite of longevity information"
    },
    {
      "question": "Co udělat s věncem po uvadnutí?",
      "answer": "Professional rewrite of disposal instructions"
    }
  ]
}
```

### 3. Enhanced About Section

```json
"about": {
  "title": "O naší rodinné dílně",
  "mission": "Professional mission statement based on company values",
  "story": "Professional company story about family business and craftsmanship",
  "values": "Quality commitment and attention to detail messaging",
  "approach": "Personal approach to each customer and order"
}
```

### 4. New SEO Section

```json
"seo": {
  "home": {
    "title": "Pohřební věnce Praha | Ruční výroba | Ketingmar s.r.o.",
    "description": "Prémiové pohřební věnce a květinové aranžmá. Ruční výroba, rychlé dodání, důstojné rozloučení. Objednávka online.",
    "keywords": ["pohřební věnce", "květinové aranžmá", "pohřeb Praha", "ruční výroba věnců"]
  },
  "products": {
    "title": "Pohřební věnce - Katalog produktů | Ketingmar s.r.o.",
    "description": "Široký výběr pohřebních věnců různých tvarů a velikostí. Možnost přizpůsobení. Rychlé dodání po celé Praze.",
    "keywords": ["pohřební věnce katalog", "smuteční věnce", "věnce na pohřeb"]
  },
  "faq": {
    "title": "Často kladené otázky - Pohřební věnce | Ketingmar s.r.o.",
    "description": "Odpovědi na nejčastější otázky o pohřebních věncích, skladování, péči a dodání. Praktické rady od odborníků.",
    "keywords": ["péče o věnce", "skladování věnců", "výdrž květin"]
  },
  "about": {
    "title": "O nás - Rodinná květinová dílna | Ketingmar s.r.o.",
    "description": "Jsme malá rodinná květinová dílnička specializující se na pohřební věnce. Pečlivá ruční práce a osobní přístup.",
    "keywords": ["rodinná květinářství", "ruční výroba", "květinová dílna Praha"]
  }
}
```

### 5. Enhanced Product Section

```json
"product": {
  // Existing fields remain...

  // NEW: Grid introduction
  "gridIntroduction": {
    "title": "Pohřební věnce a květinové aranžmá",
    "description": "Professional rewrite of wreath symbolism and meaning"
  },

  // NEW: Customization options
  "customization": {
    "colors": {
      "title": "Barva",
      "options": ["Fialová", "Bílá", "Růžová", "Žlutá", "Zelená", "Červená", "Oranžová"]
    },
    "sizes": {
      "title": "Velikost",
      "options": ["45cm", "50cm", "60cm", "70cm", "80cm"]
    },
    "shapes": {
      "title": "Tvar",
      "options": ["Srdce", "Kruh", "Kříž", "Obdélník"]
    }
  },

  // NEW: Product names
  "butterflyNames": ["Pieris", "Danaus", "Maniola", "Thymelicus", "Kallima", "Euphorion", "Lycaena"]
}
```

## Content Source Mapping

### From Company Content to JSON Structure

| Company Content Section | Target JSON Path | Content Type | Processing Needed |
|-------------------------|------------------|--------------|-------------------|
| Philosophy quote | `home.philosophy.quote` | Emotional | Professional editing |
| Philosophy explanation | `home.philosophy.text` | Emotional | Professional rewrite |
| Benefits (4 items) | `home.benefits.items[]` | Trust-building | Professional copywriting |
| FAQ question 1 | `faq.items[0]` | Practical | SEO optimization |
| FAQ question 2 | `faq.items[1]` | Practical | SEO optimization |
| FAQ question 3 | `faq.items[2]` | Practical | SEO optimization |
| Product intro text | `product.gridIntroduction` | Educational | Professional rewrite |
| About company | `about.story` | Brand story | Professional copywriting |
| Quality commitment | `about.values` | Trust-building | Professional enhancement |

## Content Processing Requirements

### 1. Professional Copywriting Needs

**Philosophy Section:**

- Original: "Zivot je krehky jak motyli prach..."
- Needs: Grammar correction, professional polish, emotional resonance
- Target: Compelling hero message with butterfly metaphor

**Benefits Section:**

- Original: Basic bullet points
- Needs: Conversion-focused rewriting, trust-building language
- Target: Clear value propositions with emotional connection

**FAQ Section:**

- Original: Practical but informal answers
- Needs: Professional tone, SEO optimization, helpful structure
- Target: Featured snippet optimization, clear helpful content

### 2. SEO Optimization Requirements

**Primary Keywords (Czech):**

- pohřební věnce
- květinové aranžmá
- smuteční věnce
- ruční výroba věnců

**Secondary Keywords:**

- pohřeb Praha
- věnce na pohřeb
- květinářství Praha
- rodinná květinová dílna

**Long-tail Keywords:**

- jak skladovat pohřební věnec
- péče o smuteční věnce
- výdrž květin ve věnci

### 3. Translation Strategy

**Tone Preservation:**

- Maintain empathetic, respectful tone
- Preserve emotional connection
- Adapt cultural references appropriately

**SEO Adaptation:**

- Research English funeral wreath keywords
- Adapt meta descriptions for English market
- Maintain conversion focus in translation

## Implementation Phases

### Phase 1: Czech Content Enhancement

1. Professional copywriting of philosophy section
2. Rewrite benefits with conversion focus
3. Edit FAQ content for SEO and clarity
4. Enhance About section content

### Phase 2: JSON Structure Implementation

1. Add new sections to cs.json
2. Maintain existing structure compatibility
3. Validate JSON syntax and structure
4. Test with existing components

### Phase 3: English Translation

1. Translate enhanced Czech content
2. Adapt for international audience
3. Research and implement English SEO keywords
4. Cultural adaptation where needed

### Phase 4: Integration Testing

1. Component compatibility testing
2. Content rendering validation
3. SEO metadata implementation
4. Cross-language consistency check

## Quality Assurance Checklist

- [ ] All company content mapped to appropriate JSON paths
- [ ] Professional tone maintained throughout
- [ ] SEO keywords naturally integrated
- [ ] JSON structure validates correctly
- [ ] Existing functionality preserved
- [ ] Translation completeness verified
- [ ] Component integration tested
- [ ] Conversion elements optimized

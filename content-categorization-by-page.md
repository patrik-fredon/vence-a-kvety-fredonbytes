# Content Categorization by Page and Section Type

## Page-Based Content Organization

### 1. Homepage Content

#### Section Type: Hero/Banner

- **Content**: Main headline and call-to-action
- **Source**: Derived from philosophy section
- **Target**: `home.hero`
- **Processing**: Professional copywriting, conversion optimization
- **Priority**: High - First impression content

#### Section Type: Philosophy/Brand Message

- **Content**: "Život je křehký jak motýlí prach..." + explanation
- **Source**: Landing page philosophy text
- **Target**: `home.philosophy`
- **Processing**: Grammar correction, professional polish
- **Priority**: High - Unique brand differentiator

#### Section Type: Benefits/Value Propositions

- **Content**: 4 key benefits (freshness, delivery, craftsmanship, customization)
- **Source**: Benefits section from company content
- **Target**: `home.benefits`
- **Processing**: Conversion-focused rewriting, trust-building language
- **Priority**: High - Core value communication

#### Section Type: Features (Existing)

- **Content**: Current 3 features (handcrafted, fast delivery, personal approach)
- **Source**: Existing i18n content
- **Target**: `home.features` (maintain or merge with benefits)
- **Processing**: Review for consistency with new benefits
- **Priority**: Medium - May be replaced by benefits section

### 2. FAQ Page Content

#### Section Type: Question-Answer Pairs

- **Content**: 3 main FAQ items
  1. Wreath storage and care instructions
  2. Flower longevity information
  3. Disposal and recycling guidance
- **Source**: FAQ section from company content
- **Target**: `faq.items[]`
- **Processing**: SEO optimization, professional tone, featured snippet structure
- **Priority**: High - Customer support and SEO value

#### Section Type: Page Introduction

- **Content**: FAQ page title and subtitle
- **Source**: To be created
- **Target**: `faq.title`, `faq.subtitle`
- **Processing**: Professional copywriting
- **Priority**: Medium - Page structure completion

### 3. About Page Content

#### Section Type: Company Story

- **Content**: Family business narrative, craftsmanship focus
- **Source**: About section from company content
- **Target**: `about.story`
- **Processing**: Professional storytelling, emotional connection
- **Priority**: High - Brand credibility and trust

#### Section Type: Mission Statement

- **Content**: Quality commitment and customer care philosophy
- **Source**: Derived from about content
- **Target**: `about.mission`
- **Processing**: Professional copywriting, value articulation
- **Priority**: High - Brand positioning

#### Section Type: Values/Approach

- **Content**: Personal attention, detail focus, customer care
- **Source**: About section emphasis on individual care
- **Target**: `about.values`, `about.approach`
- **Processing**: Professional enhancement, trust-building
- **Priority**: Medium - Supporting brand messaging

### 4. Product Pages Content

#### Section Type: Category Introduction

- **Content**: Wreath symbolism and meaning explanation
- **Source**: Product grid introductory text
- **Target**: `product.gridIntroduction`
- **Processing**: Professional rewrite, educational tone
- **Priority**: Medium - Product context and education

#### Section Type: Customization Options

- **Content**: Colors, sizes, shapes specifications
- **Source**: Product specifications from company content
- **Target**: `product.customization`
- **Processing**: Structured data organization, clear labeling
- **Priority**: Medium - Product functionality

#### Section Type: Product Names

- **Content**: Butterfly-themed names (Pieris, Danaus, etc.)
- **Source**: Product names list
- **Target**: `product.butterflyNames`
- **Processing**: Data organization, potential descriptions
- **Priority**: Low - Product naming system

### 5. SEO Metadata Content

#### Section Type: Page Titles

- **Content**: SEO-optimized titles for each page
- **Source**: To be created based on keyword research
- **Target**: `seo.{page}.title`
- **Processing**: Keyword optimization, character limits
- **Priority**: High - Search visibility

#### Section Type: Meta Descriptions

- **Content**: Compelling descriptions for search results
- **Source**: To be created from page content summaries
- **Target**: `seo.{page}.description`
- **Processing**: Conversion optimization, character limits
- **Priority**: High - Search click-through rates

#### Section Type: Keywords

- **Content**: Targeted keyword arrays for each page
- **Source**: Keyword research (pohřební věnce, etc.)
- **Target**: `seo.{page}.keywords`
- **Processing**: Keyword research, relevance validation
- **Priority**: High - Search ranking factors

## Section Type Classification

### Content Types by Function

#### 1. Conversion-Focused Content

- **Sections**: Hero, Benefits, CTAs
- **Purpose**: Drive user actions and purchases
- **Tone**: Persuasive, trust-building, professional
- **Processing Priority**: High

#### 2. Educational Content

- **Sections**: FAQ, Product introductions, About story
- **Purpose**: Inform and educate users
- **Tone**: Helpful, informative, caring
- **Processing Priority**: High

#### 3. Brand/Emotional Content

- **Sections**: Philosophy, Company story, Values
- **Purpose**: Build emotional connection and trust
- **Tone**: Empathetic, respectful, authentic
- **Processing Priority**: High

#### 4. Functional Content

- **Sections**: Navigation, Product specs, Customization options
- **Purpose**: Enable user functionality and choices
- **Tone**: Clear, practical, straightforward
- **Processing Priority**: Medium

#### 5. SEO/Technical Content

- **Sections**: Meta titles, descriptions, keywords
- **Purpose**: Improve search visibility and ranking
- **Tone**: Optimized, compelling, keyword-rich
- **Processing Priority**: High

### Content Processing Requirements by Type

#### Immediate Processing Needed (High Priority)

1. **Philosophy Section**: Grammar correction, professional polish
2. **Benefits Section**: Conversion-focused rewriting
3. **FAQ Content**: SEO optimization, professional tone
4. **About Content**: Professional storytelling enhancement
5. **SEO Metadata**: Keyword research and optimization

#### Secondary Processing (Medium Priority)

1. **Product Introductions**: Educational rewriting
2. **Customization Options**: Data structuring
3. **Page Titles/Subtitles**: Professional copywriting

#### Future Enhancement (Low Priority)

1. **Product Names**: Potential descriptions
2. **Additional FAQ Items**: Content expansion
3. **Extended About Content**: Additional sections

## Implementation Sequence by Page Priority

### Phase 1: Homepage (Highest Impact)

1. Hero section creation
2. Philosophy section enhancement
3. Benefits section rewriting
4. SEO metadata optimization

### Phase 2: FAQ Page (SEO Value)

1. FAQ content professional editing
2. SEO optimization for featured snippets
3. Page structure completion

### Phase 3: About Page (Trust Building)

1. Company story professional rewrite
2. Mission statement creation
3. Values articulation

### Phase 4: Product Pages (Functionality)

1. Category introduction enhancement
2. Customization options structuring
3. Product naming system organization

### Phase 5: Cross-Page Elements (Consistency)

1. SEO metadata completion
2. Tone consistency review
3. Translation preparation

## Quality Metrics by Section Type

### Conversion Content Metrics

- Clear value propositions
- Compelling call-to-actions
- Trust-building language
- Professional tone consistency

### Educational Content Metrics

- Clarity and helpfulness
- SEO optimization
- Featured snippet potential
- User question coverage

### Brand Content Metrics

- Emotional resonance
- Authenticity preservation
- Respectful tone maintenance
- Unique brand voice

### Technical Content Metrics

- JSON structure validity
- Component compatibility
- SEO best practices
- Performance impact

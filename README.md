# Pohřební věnce | Ketingmar s.r.o

A premium e-commerce platform for funeral wreaths and floral arrangements, built with modern web technologies and focused on providing a dignified experience during difficult times.

## 🌹 Features

- **Multilingual Support**: Czech and English language support
- **Product Customization**: Size, flowers, ribbons, and personal messages
- **Secure Payments**: Stripe and GoPay integration
- **Responsive Design**: Optimized for all devices
- **Performance Focused**: Next.js 15 with advanced optimizations
- **Accessibility**: WCAG compliant design
- **SEO Optimized**: Structured data and meta tags

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4 with custom design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe + GoPay
- **Caching**: Redis
- **Testing**: Jest, React Testing Library, Playwright
- **Linting**: Biome
- **Deployment**: Vercel

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pohrebni-vence
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.local.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code
- `npm run type-check` - Check TypeScript types
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:all` - Run all tests and checks
- `npm run clean` - Clean build artifacts

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes

.kiro/
└── specs/              # Feature specifications and tasks
    └── wreaths-ecommerce/
        ├── requirements.md
        ├── design.md
        └── tasks.md

e2e/                    # End-to-end tests
```

## 🎨 Design System

The project uses a custom design system tailored for funeral wreaths:

- **Primary Colors**: Warm, earthy tones (browns, beiges)
- **Secondary Colors**: Muted, respectful palette
- **Accent Colors**: Floral colors (rose, lily, sage)
- **Typography**: Inter (sans-serif) + Playfair Display (serif)
- **Spacing**: Consistent 8px grid system

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:coverage
```

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## 📋 Implementation Progress

Track implementation progress in `.kiro/specs/wreaths-ecommerce/tasks.md`:

- [x] 1. Project Setup and Core Infrastructure
- [ ] 2. Database Schema and Supabase Configuration
- [ ] 3. Authentication System Implementation
- [ ] ... (see tasks.md for full list)

## 🤝 Contributing

1. Follow the existing code style (Biome configuration)
2. Write tests for new features
3. Update documentation as needed
4. Ensure accessibility compliance

## 📄 License

© 2024 Ketingmar s.r.o. All rights reserved.

## 📞 Contact

- **Email**: <info@ketingmar.cz>
- **Phone**: +420 123 456 789
- **Address**: Hlavní 123, Praha, 110 00, Česká republika

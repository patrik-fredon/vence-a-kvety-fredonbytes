# Product Image and Config Fixes - Spec Creation Complete

## Date
2025-10-08

## Overview
Created comprehensive spec for fixing five critical production issues affecting the funeral wreaths e-commerce platform.

## Spec Location
`.kiro/specs/product-image-and-config-fixes/`

## Documents Created

### 1. Requirements Document (requirements.md)
Defined 5 main requirements with EARS format acceptance criteria:
- **Requirement 1**: Product Image Rendering on Products Page
- **Requirement 2**: Image Height Styling Compliance
- **Requirement 3**: Internationalization Completeness
- **Requirement 4**: Modern HTML Meta Tag Compliance
- **Requirement 5**: HTTP Headers Policy Modernization

### 2. Design Document (design.md)
Comprehensive design covering:
- Architecture overview with Mermaid diagrams
- Component-level implementation details
- Data models and interfaces
- Error handling strategies
- Testing strategy (manual and automated)
- Performance and security considerations
- Phased migration strategy with rollback plan
- Monitoring and validation checklist

### 3. Tasks Document (tasks.md)
Implementation plan with 6 main tasks and 17 sub-tasks:
1. Add missing translation key (1 task)
2. Update deprecated meta tags (3 sub-tasks)
3. Remove unsupported bluetooth directive (1 task)
4. Fix ProductCard image height styling (3 sub-tasks)
5. Debug and verify product image rendering (5 sub-tasks)
6. Verify all fixes and run final tests (4 sub-tasks)

## Key Issues Addressed

### 1. Product Image Rendering
- Supabase JSONB data parsing (already implemented correctly)
- Primary image selection logic
- Fallback to first image
- Placeholder for missing images
- Debug logging for verification

### 2. Image Height Warnings
- ProductCard grid view: Add `h-64` container
- ProductCard list view: Add `h-32` container
- Ensure `relative` positioning for `fill` images
- Maintain responsive aspect ratios

### 3. Missing Translation
- Add `footer.home: "Domů"` to messages/cs.json
- Verify English locale has matching key

### 4. Deprecated Meta Tag
- Replace `apple-mobile-web-app-capable` with `mobile-web-app-capable`
- Update in 3 files: PageMetadata, ResourceHints, SEO utils

### 5. Invalid HTTP Header
- Remove `bluetooth=()` from Permissions-Policy in next.config.ts
- Maintain all other security directives

## Files to Modify
1. messages/cs.json - Add translation key
2. src/components/seo/PageMetadata.tsx - Update meta tag
3. src/components/performance/ResourceHints.tsx - Update meta tag
4. src/lib/seo/utils.ts - Update meta tag
5. next.config.ts - Remove bluetooth directive
6. src/components/product/ProductCard.tsx - Add image container heights
7. src/app/[locale]/products/page.tsx - Add debug logging (temporary)

## Next Steps
User can now execute tasks by:
1. Opening `.kiro/specs/product-image-and-config-fixes/tasks.md`
2. Clicking "Start task" next to individual task items
3. Following the implementation steps for each task

## Technical Approach
- Maintains backward compatibility
- Follows existing codebase patterns (Next.js 15, Server Components, TypeScript)
- Low-risk changes with clear rollback strategy
- Comprehensive testing at each phase
- No database schema changes required

## Status
✅ **SPEC CREATION COMPLETE** - Ready for task execution

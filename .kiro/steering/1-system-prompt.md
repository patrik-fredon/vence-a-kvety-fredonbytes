---
inclusion: always
---

# Multi-MCP Development Guidelines

This document defines workflows and conventions for using multiple MCP servers effectively in this Next.js e-commerce project.

## Available MCP Tools

- **Serena**: Semantic code analysis, safe editing, and project memory
- **Context7**: Library documentation and API references
- **SequentialThinking**: Structured problem-solving and tool orchestration
- **Chrome DevTools**: Browser automation, debugging, and performance testing
- **Magic UI**: Component generation and UI design patterns

## Core Workflow Principles

### 1. Task Planning (Required First Step)

Always start complex tasks with `sequentialthinking_tools` to:

- Analyze available tools and their capabilities
- Generate a structured approach with confidence scores
- Identify the optimal tool sequence for the task

### 2. Project Context (Required Second Step)

Use Serena to establish codebase understanding:

- `activate_project` - Initialize project context
- `check_onboarding_performed` - Verify project setup
- `get_symbols_overview` - Understand code structure
- `read_memory` - Access previous insights

## Serena MCP - Semantic Code Operations

### Required Initialization Sequence

1. `activate_project` - Initialize project context
2. `check_onboarding_performed` - Verify project setup status
3. `get_symbols_overview` - Map codebase structure
4. `read_memory` - Load previous project insights

### Code Analysis Before Changes

- Use `find_symbol` to locate target code elements
- Use `find_referencing_symbols` to understand dependencies
- Use `search_for_pattern` for broader code searches

### Safe Code Modifications

Use only semantic editing tools:

- `replace_symbol_body` - Replace function/class implementations
- `insert_after_symbol` / `insert_before_symbol` - Add new code
- Never mix with direct file operations

### Memory Management

- `write_memory` after completing significant tasks
- `read_memory` to maintain context across sessions
- Store architectural decisions and patterns discovered

## SequentialThinking MCP - Task Planning

### Mandatory First Step

For complex tasks, always start with `sequentialthinking_tools`:

- Analyzes available MCP tools and capabilities
- Returns prioritized tool recommendations with confidence scores
- Provides structured approach and execution order

### Required Parameters

```json
{
  "available_mcp_tools": ["mcp_serena", "mcp_Context7", "mcp_chrome_devtools", "mcp_magicuidesignmcp"],
  "thought": "Current analysis or planning step",
  "next_thought_needed": true,
  "thought_number": 1,
  "total_thoughts": 3
}
```

### When to Use

- Multi-step feature implementations
- Complex debugging scenarios
- Architecture decisions
- Cross-component integrations

## Context7 MCP - Library Documentation

### Documentation Retrieval Process

1. `resolve_library_id` - Convert library name to Context7 ID
2. `get_library_docs` - Fetch relevant documentation
   - Set `tokens: 3000-5000` for complex tasks
   - Use `topic` parameter for focused retrieval

### Common Library Mappings

- Next.js: `/vercel/next.js`
- React: `/facebook/react`
- Tailwind CSS: `/tailwindlabs/tailwindcss`
- Stripe: `/stripe/stripe-node`

### Integration Points

- Before implementing new library features
- When debugging library-specific issues
- For API reference during development

## Chrome DevTools MCP - Browser Testing

### Available Tool Categories

- **Navigation**: `navigate_page`, `new_page`, `select_page`, `wait_for`
- **Interaction**: `click`, `fill`, `fill_form`, `hover`, `drag`
- **Debugging**: `take_screenshot`, `take_snapshot`, `list_console_messages`
- **Performance**: `performance_start_trace`, `performance_stop_trace`
- **Network**: `list_network_requests`, `get_network_request`

### Common Testing Workflows

**Performance Testing**

1. `performance_start_trace`
2. Execute user scenario (`navigate_page`, `click`, `fill`)
3. `performance_stop_trace`
4. `performance_analyze_insight`

**Debugging Issues**

1. `navigate_page` to problem area
2. `list_console_messages` and `evaluate_script`
3. `take_screenshot` or `take_snapshot` for visual context
4. `list_network_requests` for API issues

**Form Testing**

1. `fill` or `fill_form` with test data
2. `handle_dialog` for confirmations
3. `wait_for` expected results

## Magic UI MCP - Component Generation

### Available Functions

- `getUIComponents` - Generate responsive UI components
- `getButtons` - Create interactive button designs
- `getAnimations` - Add motion and transitions
- `getBackgrounds` - Generate background patterns
- `getSpecialEffects` - Add visual enhancements
- `getTextAnimations` - Animate text elements

### Integration Workflow

1. Generate components with Magic UI
2. Integrate safely using Serena semantic tools
3. Validate with Chrome DevTools testing
4. Store patterns in Serena memory

## Project-Specific Conventions

### Next.js E-commerce Architecture

- Use App Router for all new routes
- Implement server components by default, client components when needed
- Follow the established folder structure in `src/app`
- Use TypeScript strictly with proper type definitions

### Code Style Standards

- Use Tailwind CSS for styling
- Implement responsive design mobile-first
- Follow established component patterns in `src/components`
- Use proper error handling and validation

### Database & API Patterns

- Use Supabase for data persistence
- Implement proper RLS policies
- Follow RESTful API conventions in route handlers
- Use proper TypeScript types from `src/server/types.ts`

### Testing Guidelines

- Do not auto-generate tests unless explicitly requested
- Use Chrome DevTools MCP for user journey validation
- Prefer `data-*` attributes for stable element selection
- Focus on critical user flows over unit test coverage

## Development Workflow

### Standard Task Sequence

1. **Plan** - Use SequentialThinking for complex tasks
2. **Context** - Initialize Serena and read project memory
3. **Research** - Get library docs from Context7 if needed
4. **Implement** - Use Serena semantic tools for code changes
5. **Validate** - Test with Chrome DevTools MCP
6. **Document** - Store insights in Serena memory

### Quality Standards

- All code changes through Serena semantic tools only
- Consistent documentation integration from Context7
- Reproducible workflows validated with browser testing
- Knowledge preservation through memory management

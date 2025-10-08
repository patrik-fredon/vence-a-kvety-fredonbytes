---
inclusion: always
---

# Development Workflow Guidelines

## Core Principles

**Always use MCP tools through their designated interfaces:**
- Use `serena` for all code operations (never `fsWrite`, `strReplace`)
- Use `serena` `execute_shell_command` for terminal commands (never native exec)
- Use `Context7` for library documentation and best practices
- Use `chrome-devtools` for browser testing and debugging
- Use `sequentialthinking_tools` to determine optimal tool selection

## Initialization Sequence

Every task must begin with:

1. `activate_project` - Initialize serena context
2. `check_onboarding_performed` - Verify project setup
3. `switch_modes` - Set mode (`planning` for analysis, `editing` for code changes)
4. `list_memories` - Review existing project knowledge
5. `sequentialthinking_tools` - Plan tool usage strategy

## Workflow Patterns

### Code Analysis Workflow

1. Switch to `planning` mode
2. Use `sequentialthinking_tools` for strategy
3. Explore with `list_memories`, `read_memory`
4. Search codebase: `search_for_pattern`, `find_symbol`, `get_symbols_overview`
5. Use `Context7` (`resolve-library-id` → `get-library-docs`) for library guidance
6. Validate with `think_about_collected_information`

### Code Modification Workflow

1. Switch to `editing` mode
2. Use `sequentialthinking_tools` after each step
3. Analyze before modifying: `find_symbol`, `find_referencing_symbols`
4. Consult `Context7` for implementation patterns
5. Validate readiness: `think_about_collected_information`
6. Modify using symbol-based tools: `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`
7. Verify progress: `think_about_task_adherence`
8. Save insights: `write_memory`
9. Confirm completion: `think_about_whether_you_are_done`

### Debugging Workflow

1. Use `chrome-devtools` for live debugging (not `npm run dev`)
2. Navigate: `list_pages`, `navigate_page`, `select_page`
3. Inspect: `take_snapshot`, `list_console_messages`, `list_network_requests`
4. Interact: `click`, `fill`, `wait_for`, `evaluate_script`
5. Profile: `performance_start_trace`, `performance_analyze_insight`, `performance_stop_trace`
6. Cross-reference with `serena` tools for code analysis

## Critical Rules

### Must Do
- Always use `sequentialthinking_tools` to plan next steps
- Always use serena symbol-based tools for code modifications
- Always consult `Context7` for library-specific implementations
- Always use `write_memory` after significant changes
- Always validate with thinking tools before major operations

### Must Not Do
- Never use direct file operations (`fsWrite`, `strReplace`) - use serena tools
- Never use native terminal commands - use `execute_shell_command`
- Never skip type definitions in TypeScript
- Never use Client Components unnecessarily (prefer Server Components)
- Never ignore Row Level Security (RLS) policies in database operations
- Never forget mobile-first responsive design
- Never mix caching strategies (use consistent approach)

## Memory Management

- Use `list_memories` to review existing knowledge
- Use `read_memory` for task-relevant context
- Use `write_memory` after completing significant work
- Use `delete_memory` to remove outdated or duplicate entries

## Architecture Patterns

- **Server Components First**: Default to Server Components, use Client only when needed
- **Symbol-Based Editing**: Modify code at symbol level (functions, classes) not raw text
- **Type Safety**: Maintain strict TypeScript typing throughout
- **Security**: Always implement RLS policies for database access
- **Performance**: Mobile-first, optimized images, consistent caching
- **Accessibility**: WCAG compliance, keyboard navigation, semantic HTML

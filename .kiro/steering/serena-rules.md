---
inclusion: always
---

# Serena MCP Server Integration Guidelines

This document defines mandatory workflows and tool usage patterns for the Serena MCP server integration. Follow these patterns precisely to maintain consistency and leverage the full capabilities of the knowledge management system.

## Core Principles

- **Knowledge-First Approach**: Always retrieve existing knowledge before implementing new features
- **Persistent Planning**: Save all approved implementation plans immediately
- **Continuous Learning**: Store insights and patterns for future reference
- **Context Awareness**: Regularly assess and reflect on gathered information

## Workflow Patterns

### Initial Project Onboarding

When starting work on this codebase or when explicitly requested:

1. **Check Documentation State**
   - Use `serena-check-handbook-existence` to verify handbook status
   - If missing, call `serena-create-handbook` to establish baseline documentation

2. **Synchronize Knowledge**
   - Use `serena-check-handbook-sync` to identify gaps between code and documentation
   - Immediately follow with `serena-update-handbook` to maintain accuracy

3. **Module Discovery & Registration**
   - Start with `serena-list-modules` to understand existing module structure
   - Use `serena-store-module` for new modules or `serena-update-module` for changes
   - Focus on architectural components, feature modules, and utility libraries

4. **Knowledge Capture**
   - Conclude with `serena-store-knowledge` to document onboarding insights

### Implementation Planning & Execution

For feature development and code changes:

1. **Plan Recovery** (if continuing work)
   - Use `serena-retrieve-active-plans` to find incomplete implementations

2. **Knowledge Gathering** (mandatory for each task)
   - Call `serena-retrieve-knowledge` multiple times per task
   - Query for: patterns, previous implementations, known issues, best practices
   - Prioritize this over module searches for broader context

3. **Plan Persistence** (critical)
   - Immediately save approved plans with `serena-save-implementation-plan`
   - Include detailed task breakdown and module dependencies

4. **Progress Tracking**
   - Use `serena-update-plan-progress` to mark task completion
   - Update entire plan status when all tasks complete

5. **Continuous Reflection**
   - Regularly call `serena-reflect-context` during implementation
   - Use `serena-assess-context` to validate information completeness

6. **Knowledge Storage**
   - Store implementation insights with `serena-store-knowledge`
   - Document patterns, gotchas, and architectural decisions

## Tool Usage Priorities

### Primary Tools (use frequently)

- `serena-retrieve-knowledge` - Essential for every task
- `serena-store-knowledge` - Document all significant insights

### Secondary Tools (use as needed)

- `serena-search-module` - When working with specific architectural components
- `serena-update-module` - When module purposes or technical details change

### Workflow Tools (use systematically)

- `serena-save-implementation-plan` - For all approved plans
- `serena-update-plan-progress` - Track completion status
- `serena-reflect-context` / `serena-assess-context` - Validate approach

## Communication Standards

When referencing Serena-sourced information, use explicit attribution:

- "According to Serena memory layer..."
- "Based on knowledge retrieved from Serena..."
- "From Serena's stored patterns..."

This ensures transparency about information sources and builds confidence in the knowledge management system.

## Module Update Triggers

Immediately update module information when:

- Changing component architecture or responsibilities
- Modifying API interfaces or data structures
- Discovering critical implementation patterns or constraints
- Identifying performance considerations or security requirements
- Documenting integration patterns with external services

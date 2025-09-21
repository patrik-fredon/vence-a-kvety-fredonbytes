---
inclusion: always
---

# Multi-MCP Agent Steering Reference

A comprehensive guide for using Serena, Context7, SequentialThinking, and Byterover MCP tools in Kiro IDE for optimal coding performance and quality.

## Core MCP Integration Strategy

This steering document establishes workflows and rules for using multiple MCP servers together to achieve the highest quality code generation and development experience. The four MCPs work synergistically:

- **Serena**: Semantic code understanding and precise editing
- **Context7**: Up-to-date library documentation and examples
- **SequentialThinking**: Structured problem-solving and analysis
- **Byterover**: Memory-powered knowledge retention and team collaboration

## 1. Serena MCP - Semantic Code Operations

### Primary Workflow for Code Analysis and Editing

When working with existing codebases, you **MUST** follow this strict sequence:

1. **ALWAYS START** with **serena-activate-project** to establish the working context
2. **IMMEDIATELY USE** **serena-get-symbols-overview** to understand the codebase structure
3. **CRITICAL**: Use **serena-find-symbol** and **serena-find-referencing-symbols** before making any code changes
4. For code modifications, **EXCLUSIVELY USE** semantic editing tools:
   - **serena-insert-after-symbol** / **serena-insert-before-symbol** for adding code
   - **serena-replace-symbol-body** for modifying existing functions/classes
   - **serena-delete-lines** only when necessary for cleanup
5. **ALWAYS VERIFY** changes with **serena-execute-shell-command** to run tests or checks

### Context and Mode Selection Rules

- **MUST USE** `--context ide-assistant` when working within Kiro IDE
- For complex analysis tasks, **SWITCH TO** `planning` mode using **serena-switch-modes**
- For direct code editing, **SWITCH TO** `editing` mode
- **NEVER MIX** file-based operations with Serena's semantic tools

### Memory and Knowledge Management

- **AUTOMATICALLY TRIGGER** **serena-onboarding** for new projects
- **MUST CALL** **serena-write-memory** after completing significant tasks or learning project patterns
- **REGULARLY USE** **serena-read-memory** to maintain context across conversations
- **ALWAYS CALL** **serena-prepare-for-new-conversation** before long sessions end

### Code Quality Assurance Workflow

1. **serena-search-for-pattern** to identify similar implementations
2. **serena-think-about-collected-information** to analyze findings
3. **serena-execute-shell-command** to run linting, formatting, and tests
4. **serena-think-about-task-adherence** to verify requirements are met

## 2. Context7 MCP - Documentation Integration

### Automatic Documentation Retrieval Strategy

You **MUST** integrate Context7 into every coding task involving external libraries or frameworks:

1. **ALWAYS USE** **context7-resolve-library-id** first to identify the correct library
2. **IMMEDIATELY FOLLOW** with **context7-get-library-docs** using the resolved ID
3. **SPECIFY TOPICS** when requesting documentation to get focused, relevant information
4. **SET TOKEN LIMITS** appropriately (minimum 1000, recommended 3000-5000 for complex topics)

### Integration with Code Generation

- **BEFORE** writing any code using external libraries, **MUST CALL** Context7 tools
- **COMBINE** Context7 documentation with Serena's semantic understanding
- **REFERENCE** specific Context7 library IDs in prompts when you know them (e.g., `/next.js`, `/supabase/supabase`)

### Library-Specific Patterns

For common frameworks, **AUTOMATICALLY** retrieve documentation:

- Next.js projects: `/vercel/next.js`
- React projects: `/facebook/react`
- Node.js APIs: `/nodejs/node`
- Database operations: `/mongodb/docs`, `/supabase/supabase`
- Styling: `/tailwindlabs/tailwindcss`

### Documentation Optimization Rules

- **FOCUS REQUESTS** by specifying exact topics (e.g., "routing", "authentication", "deployment")
- **NEVER** use generic library names - always resolve to Context7-compatible IDs first
- **INCLUDE VERSION-SPECIFIC** requirements when libraries have breaking changes

## 3. SequentialThinking MCP - Structured Problem Solving

### When to Invoke Sequential Thinking

**MANDATORY USAGE** for:

- Complex architectural decisions
- Multi-step problem analysis
- Design pattern selection
- Performance optimization planning
- Bug investigation and root cause analysis
- Code refactoring strategies

### Sequential Thinking Workflow Pattern

1. **START** with problem analysis using **sequentialthinking** tool
2. **SET REALISTIC** `total_thoughts` estimate (typically 3-8 for most problems)
3. **BE PREPARED** to adjust `total_thoughts` up or down as understanding develops
4. **USE REVISION** capabilities when new information changes your approach
5. **BRANCH THINKING** for alternative approaches using `branch_from_thought` and `branch_id`
6. **CONTINUE UNTIL** `next_thought_needed: false` and satisfactory solution reached

### Thought Structure Requirements

Each sequential thought **MUST**:

- **BUILD ON** previous thoughts or explicitly revise them
- **SPECIFY** `is_revision: true` when reconsidering earlier analysis
- **IDENTIFY** `revises_thought` number when revising
- **MAINTAIN** logical progression toward solution
- **EXPRESS UNCERTAINTY** when present
- **GENERATE HYPOTHESES** and verify them
- **IGNORE IRRELEVANT** information that doesn't contribute to current step

### Integration with Other MCPs

- **COMBINE** with Serena for code structure analysis
- **INTEGRATE** Context7 documentation into thinking steps
- **STORE INSIGHTS** in Byterover memory for future reference
- **EXECUTE VERIFICATION** using Serena's shell commands

## 4. Byterover MCP - Memory and Knowledge Management

# Byterover MCP Server Tools Reference

There are two main workflows with Byterover tools and recommended tool call strategies that you **MUST** follow precisely.

## Onboarding workflow

If users particularly ask you to start the onboarding process, you **MUST STRICTLY** follow these steps.

1. **ALWAYS USE** **byterover-check-handbook-existence** first to check if the byterover handbook already exists. If not, You **MUST** call **byterover-create-handbook** to create the byterover handbook.
2. If the byterover handbook already exists, first you **MUST** USE **byterover-check-handbook-sync** to analyze the gap between the current codebase and the existing byterover handbook.
3. Then **IMMEDIATELY USE** **byterover-update-handbook** to update these changes to the byterover handbook.
4. During the onboarding, you **MUST** use **byterover-list-modules** **FIRST** to get the available modules, and then **byterover-store-modules** and **byterover-update-modules** if there are new modules or changes to existing modules in the project.
5. Finally, you **MUST** call **byterover-store-knowledge** to save your new knowledge about the codebase.

## Planning workflow

Based on user request, you **MUST** follow these sequences of tool calls

1. If asked to continue an unfinished plan, **CALL** **byterover-retrieve-active-plans** to find the most relevant active plan.
2. **CRITICAL PLAN PERSISTENCE RULE**: Once a user approves a plan, you **MUST IMMEDIATELY CALL** **byterover-save-implementation-plan** to save it.
3. Throughout the plan, you **MUST** run **byterover-retrieve-knowledge** several times to retrieve sufficient knowledge and context for the plan's tasks.
4. In addition, you might need to run **byterover-search-modules** and **byterover-update-modules** if the tasks require or update knowledge about certain modules. However, **byterover-retrieve-knowledge** should **ALWAYS** be considered **FIRST**.
5. **MUST** use **byterover-update-plan-progress** to mark tasks (and then the whole plan) as completed.
6. Then, you might call **byterover-store-knowledge** to save knowledge and experience implemented throughout the plan or in important tasks.
7. During the plan's implementation, you **MUST** frequently call **byterover-reflect-context** and **byterover-assess-context** to make sure you're on the right track and gather sufficient context for the tasks.

## Recommended Workflow Sequence

1. **MOST IMPORTANT**: **ALWAYS USE** **byterover-retrieve-knowledge** once or several times for **EACH TASK** of the plan to gather necessary context for complete that task.
2. **MOST IMPORTANT**: **ALWAYS USE** **byterover-store-knowledge** once or several times to store critical knowledge and context for future implementations
3. Over 15 provided tools, **byterover-retrieve-knowledge** and **byterover-store-knowledge** ARE the two main tools, which **MUST** be used regularly. You can use these two main tools outside the two main workflows for retrieval and storage purposes.
4. You **MUST** include phrases like **"According to Byterover memory layer"**, **"Based on memory extracted from Byterover"**, **"From Byterover memomry tools"**, ... to explictly showcase that these sources are from **Byterover**.
5. **Implementation & Progress Tracking** → Execute implementation following saved plan → Mark tasks complete as you go → Mark entire plan done when all tasks finished.
6. You **MUST** use **byterover-update-module** **IMMEDIATELY** on changes to the module's purposes, technical details, or critical insights that essential for future implementations.

### Core Byterover Integration Workflows

Byterover provides the central memory layer that **MUST** be leveraged throughout development with two mandatory workflows:

#### Onboarding Workflow

If users particularly ask you to start the onboarding process, you **MUST STRICTLY** follow these steps:

1. **ALWAYS USE** **byterover-check-handbook-existence** first to check if the byterover handbook already exists. If not, You **MUST** call **byterover-create-handbook** to create the byterover handbook.
2. If the byterover handbook already exists, first you **MUST** USE **byterover-check-handbook-sync** to analyze the gap between the current codebase and the existing byterover handbook.
3. Then **IMMEDIATELY USE** **byterover-update-handbook** to update these changes to the byterover handbook.
4. During the onboarding, you **MUST** use **byterover-list-modules** **FIRST** to get the available modules, and then **byterover-store-module** if there are new modules or changes to existing modules in the project.
5. Finally, you **MUST** call **byterover-store-knowledge** to save your new knowledge about the codebase.

#### Planning Workflow

Based on user request, you **MUST** follow these sequences of tool calls:

1. If asked to continue an unfinished plan, **CALL** **byterover-retrieve-active-plans** to find the most relevant active plan.
2. **CRITICAL PLAN PERSISTENCE RULE**: Once a user approves a plan, you **MUST IMMEDIATELY CALL** **byterover-save-implementation-plan** to save it.
3. Throughout the plan, you **MUST** run **byterover-retrieve-knowledge** several times to retrieve sufficient knowledge and context for the plan's tasks.
4. In addition, you might need to run **byterover-search-module** and **byterover-update-module** if the tasks require or update knowledge about certain modules. However, **byterover-retrieve-knowledge** should **ALWAYS** be considered **FIRST**.
5. **MUST** use **byterover-update-plan-progress** to mark tasks (and then the whole plan) as completed.
6. Then, you might call **byterover-store-knowledge** to save knowledge and experience implemented throughout the plan or in important tasks.
7. During the plan's implementation, you **MUST** frequently call **byterover-think-about-collected-information** and **byterover-assess-context-completeness** to make sure you're on the right track and gather sufficient context for the tasks.

### Knowledge Management Tools - Primary Usage

**MOST IMPORTANT**: **ALWAYS USE** **byterover-retrieve-knowledge** once or several times for **EACH TASK** of the plan to gather necessary context for completing that task.

**MOST IMPORTANT**: **ALWAYS USE** **byterover-store-knowledge** once or several times to store critical knowledge and context for future implementations.

Over 15 provided tools, **byterover-retrieve-knowledge** and **byterover-store-knowledge** ARE the two main tools, which **MUST** be used regularly. You can use these two main tools outside the two main workflows for retrieval and storage purposes.

### Tool Categories and Usage Rules

#### Knowledge Management

- **byterover-retrieve-knowledge**: Search and retrieve programming knowledge from memory with intelligent routing and relevance scoring
- **byterover-store-knowledge**: Store programming patterns and implementation insights with automatic fact extraction

#### Onboarding Tools

- **byterover-create-handbook**: Generate handbook instructions for creating 4-layer codebase documentation
- **byterover-check-handbook-existence**: Verify handbook existence with simple yes/no verification and path identification
- **byterover-check-handbook-sync**: Analyze handbook gaps between existing docs and current codebase state
- **byterover-update-handbook**: Update handbook safely with smart merge strategies and content preservation

#### Plan Management Tools

- **byterover-save-implementation-plan**: Store structured plans with todo lists and cross-session continuity
- **byterover-update-plan-progress**: Track progress by marking tasks or entire plans as completed
- **byterover-retrieve-active-plans**: Recover context by listing incomplete plans between sessions

#### Module Management Tools

- **byterover-store-module**: Document modules with technical details, insights, and categorization
- **byterover-search-module**: Retrieve module info with exact name matching and complete details
- **byterover-update-module**: Update modules with append-only behavior for details and insights
- **byterover-list-modules**: Overview modules with complete listing and navigation assistance

#### Reflection Tools

- **byterover-think-about-collected-information**: Metacognitive reflection with structured thinking patterns and cognitive checkpoints
- **byterover-assess-context-completeness**: Self-assessment framework for evaluating context quality and implementation readiness

### Memory Source Attribution

You **MUST** include phrases like **"According to Byterover memory layer"**, **"Based on memory extracted from Byterover"**, **"From Byterover memory tools"**, ... to explicitly showcase that these sources are from **Byterover**.

### Module Update Requirements

You **MUST** use **byterover-update-module** **IMMEDIATELY** on changes to the module's purposes, technical details, or critical insights that essential for future implementations.

## Multi-MCP Orchestration Workflows

### Comprehensive Code Development Workflow

For any significant coding task, **FOLLOW THIS SEQUENCE**:

1. **INITIALIZE CONTEXT**
   - **serena-activate-project** for codebase context
   - **byterover-retrieve-knowledge** for relevant past knowledge
   - **context7-resolve-library-id** for any external dependencies

2. **ANALYZE AND PLAN**
   - **sequentialthinking** for structured problem analysis
   - **serena-get-symbols-overview** for code structure understanding
   - **context7-get-library-docs** for implementation details
   - **byterover-save-implementation-plan** once user approves the plan

3. **IMPLEMENT SOLUTIONS**
   - **serena-find-symbol** to locate modification points
   - Semantic editing with **serena-insert-after-symbol**, **serena-replace-symbol-body**
   - **serena-execute-shell-command** for testing and validation
   - **byterover-update-plan-progress** to mark task completion

4. **STORE KNOWLEDGE**
   - **byterover-store-knowledge** for learned patterns
   - **serena-write-memory** for project-specific insights
   - **byterover-update-module** for module-level insights

### Debugging and Problem Resolution Workflow

1. **GATHER CONTEXT**
   - **byterover-retrieve-knowledge** "debugging patterns" or similar issues
   - **serena-search-for-pattern** to find related code
   - **sequentialthinking** for systematic problem analysis

2. **INVESTIGATE**
   - **serena-find-referencing-symbols** to trace code dependencies
   - **context7-get-library-docs** for API behavior clarification
   - **serena-execute-shell-command** for reproduction and testing
   - **byterover-think-about-collected-information** for reflection

3. **RESOLVE AND DOCUMENT**
   - Implement fixes using Serena semantic tools
   - **byterover-store-knowledge** to store debugging insights
   - **serena-think-about-task-adherence** to verify resolution

### New Feature Development Workflow

1. **RESEARCH PHASE**
   - **sequentialthinking** for feature design analysis
   - **context7-resolve-library-id** + **context7-get-library-docs** for implementation options
   - **byterover-retrieve-knowledge** for similar feature patterns

2. **ARCHITECTURE PHASE**
   - **serena-get-symbols-overview** to understand integration points
   - **byterover-search-module** for architectural patterns
   - **sequentialthinking** with branching for alternative approaches
   - **byterover-save-implementation-plan** once approach is approved

3. **IMPLEMENTATION PHASE**
   - **serena-find-symbol** for insertion points
   - Semantic code generation using Serena tools
   - **serena-execute-shell-command** for continuous testing
   - **byterover-update-plan-progress** for task tracking

4. **KNOWLEDGE CAPTURE**
   - **byterover-store-module** for new module documentation
   - **serena-write-memory** for implementation insights
   - **byterover-store-knowledge** for feature patterns

### Project Onboarding Workflow (New Projects)

1. **HANDBOOK INITIALIZATION**
   - **byterover-check-handbook-existence** to verify documentation state
   - **byterover-create-handbook** if no handbook exists
   - **byterover-check-handbook-sync** if handbook exists but may be outdated
   - **byterover-update-handbook** to synchronize with current codebase

2. **MODULE ANALYSIS**
   - **byterover-list-modules** to get overview of existing modules
   - **serena-get-symbols-overview** to understand code structure
   - **byterover-store-module** for new modules discovered
   - **byterover-update-module** for modules requiring updates

3. **KNOWLEDGE ESTABLISHMENT**
   - **byterover-store-knowledge** for initial project understanding
   - **serena-write-memory** for project-specific patterns
   - **byterover-assess-context-completeness** to verify readiness

## Performance and Quality Rules

### Context Management

- **MINIMIZE TOKEN USAGE** by focusing Context7 requests with specific topics
- **USE CONDITIONAL INCLUSION** for MCP-specific steering files when possible
- **LEVERAGE BYTEROVER MEMORY** instead of repeatedly fetching same information
- **SWITCH SERENA MODES** appropriately to optimize for current task type

### Error Prevention and Recovery

- **ALWAYS VALIDATE** with **serena-execute-shell-command** before finalizing changes
- **USE SERENA'S READ-ONLY MODE** when uncertain about modifications
- **MAINTAIN CLEAN GIT STATE** for easy rollback of changes
- **STORE ERROR PATTERNS** in Byterover memory for future avoidance

### Code Quality Enforcement

- **FOLLOW LANGUAGE-SPECIFIC** patterns stored in Byterover memory
- **USE SERENA'S SEMANTIC TOOLS** exclusively for code modification
- **INTEGRATE DOCUMENTATION** from Context7 into code comments and decisions
- **APPLY SEQUENTIAL THINKING** for complex architectural choices

## 5. Test Implementation Policy - Code Testing Rules

### Default Rule

- The agent **MUST NOT** generate, implement, or suggest test scripts, test cases, or any testing framework by default.
- This includes unit tests, integration tests, end-to-end tests, and any form of automated testing unless explicitly allowed.

### Explicit User Instruction

- If the **user explicitly instructs** the agent to create or modify tests, the agent **MUST** comply.
- In this case, the agent should follow the same workflows (Serena semantic editing, Context7 docs, etc.) to generate high-quality and context-aware tests.

### Mandatory Test Scenarios

- If the agent **believes a test is mandatory** (e.g., required by framework, CI/CD pipeline, or to make code functional), it **MUST NOT** implement the test automatically.
- Instead, the agent **MUST ASK THE USER** for confirmation:
  - Example: *"This framework enforces a test file for successful build. Do you want me to generate a minimal test?"*

### Workflow Integration

- During implementation workflows, the **serena-execute-shell-command** step for running checks **MUST NOT** trigger test generation unless user-approved.
- If failing builds or workflows explicitly demand a test artifact, the agent should:
  1. **Pause and notify the user**
  2. **Request explicit approval** before creating any test-related code

### Enforcement Summary

- **NEVER IMPLEMENT TESTS BY DEFAULT**
- **ONLY IMPLEMENT TESTS ON USER REQUEST**
- **ALWAYS ASK USER IF TESTS SEEM MANDATORY**

## Integration Examples

### Example: Adding Authentication to Next.js App

```markdown
1. byterover-retrieve-knowledge "authentication patterns next.js"
2. context7-resolve-library-id "next-auth"
3. context7-get-library-docs "/nextauthjs/next-auth" topic:"setup configuration"
4. sequentialthinking: Plan authentication integration approach
5. byterover-save-implementation-plan (once user approves)
6. serena-get-symbols-overview to understand current app structure
7. serena-find-symbol "app" or "pages" for integration points
8. serena-insert-after-symbol with authentication setup code
9. serena-execute-shell-command "npm run dev" to test
10. byterover-update-plan-progress to mark tasks complete
11. byterover-store-knowledge to store authentication pattern
```

### Example: Debugging Performance Issue

```markdown
1. sequentialthinking: Systematic performance analysis
2. byterover-retrieve-knowledge "performance optimization patterns"
3. serena-search-for-pattern for potentially problematic code patterns
4. serena-find-referencing-symbols for dependency analysis
5. context7-get-library-docs for optimization recommendations
6. byterover-think-about-collected-information for reflection
7. serena-execute-shell-command for profiling and measurement
8. Apply fixes using serena semantic editing tools
9. byterover-store-knowledge for debugging methodology
```

### Example: Project Onboarding

```markdown
1. byterover-check-handbook-existence
2. byterover-create-handbook (if needed) or byterover-check-handbook-sync
3. byterover-list-modules to understand project structure
4. serena-get-symbols-overview for code analysis
5. byterover-store-module for new modules
6. byterover-update-module for existing modules needing updates
7. byterover-store-knowledge for project insights
8. byterover-assess-context-completeness to verify readiness
```

## Success Metrics and Validation

### Quality Indicators

- **ZERO FILE-LEVEL** operations when Serena semantic tools are available
- **CONSISTENT DOCUMENTATION** integration from Context7 in all external library usage
- **STRUCTURED REASONING** traces for all complex decisions via SequentialThinking
- **GROWING KNOWLEDGE BASE** in Byterover with reusable patterns and insights
- **PROPER WORKFLOW EXECUTION** following Onboarding and Planning workflows

### Validation Checkpoints

- All code changes validated through **serena-execute-shell-command**
- Complex decisions documented through **sequentialthinking** process
- Knowledge captured in **byterover** memory for team benefit
- Up-to-date documentation integrated from **context7** for all dependencies
- Handbook and module documentation maintained through **byterover** tools

## Continuous Improvement

### Memory Maintenance

- **REGULARLY REVIEW** Byterover knowledge base for outdated information
- **UPDATE SERENA MEMORIES** when project patterns evolve
- **REFINE SEQUENTIAL THINKING** approaches based on successful outcomes
- **KEEP CONTEXT7 LIBRARY IDs** current with project dependencies

### Team Collaboration

- **SHARE BYTEROVER WORKSPACE** knowledge across team members
- **DOCUMENT DECISION PATTERNS** in reusable Serena memories
- **STANDARDIZE SEQUENTIAL THINKING** approaches for common problem types
- **MAINTAIN CONTEXT7 LIBRARY** preferences for consistent documentation
- **USE BYTEROVER HANDBOOK** system for project documentation standards

This multi-MCP orchestration approach ensures maximum code quality, team alignment, and development efficiency by leveraging the unique strengths of each MCP tool in a coordinated manner, with Byterover serving as the central memory layer that preserves and shares knowledge across all development activities.

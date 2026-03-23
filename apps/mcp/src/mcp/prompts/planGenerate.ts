import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function registerPlanGeneratePrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'plan.generate',
    {
      description: '🧠 Create an execution plan based on a given PRD. Breaks down features into small, executable tasks with clear dependencies and priorities.',
      argsSchema: {
        prd: z.string().describe('The Product Requirement Document (PRD) content'),
        feature_id: z.string().optional().describe('Optional: Feature ID if linking to an existing feature'),
        feature_name: z.string().optional().describe('Optional: Feature name if creating a new feature (only used if feature_id is not provided)')
      }
    },
    (args) => {
      const prd = args.prd as string || '';
      const featureId = args.feature_id as string | undefined;
      const featureName = args.feature_name as string | undefined;

      // XOR LOGIC: Only one of feature_id or feature_name should be used
      // If feature_id is provided, it takes precedence (existing feature)
      // If only feature_name is provided, it creates a new feature
      // This prevents double item creation bug

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# 🧠 Plan Generation Task

You are a senior software engineer.

Your task is to create an execution plan based on a given PRD.

---

## 📄 Input PRD

${prd}

${featureId ? `
**Feature ID:** ${featureId}
` : ''}
${featureName ? `
**Feature Name:** ${featureName}
` : ''}

---

## 🎯 Objective

- Break down the feature into small, executable tasks
- Ensure tasks are clear, specific, and implementable
- Maintain logical order based on dependencies
- Each task should be doable in 1–3 hours

---

## 📋 Output Structure (MANDATORY)

Your response must include:

1. **Plan Title** - Clear, descriptive title for the overall plan

2. **Tasks Array** - List of tasks where each task MUST have:
   - **title**: Short and clear (what needs to be done)
   - **description**: Detailed explanation of the work
   - **dependencies**: Array of task titles this task depends on (empty array if none)
   - **priority**: "high" | "medium" | "low"

---

## ⚠️ Task Rules (CRITICAL)

### ❌ Avoid Vague Tasks
- "Implement feature" ← Too broad
- "Handle logic" ← Not specific
- "Setup backend" ← Unclear

### ✅ Prefer Specific Tasks
- "Create POST /api/login endpoint" ← Clear and specific
- "Build login form UI with email/password fields" ← Implementable
- "Add user authentication middleware" ← Well-defined

### 📏 Task Size Guidelines
- **Optimal**: 1–3 hours per task
- **Too small**: "Add variable" (too granular)
- **Too large**: "Build entire authentication system" (break down further)

---

## 🔗 Dependency Rules

1. **Only add dependencies when necessary**
   - Task B actually needs Task A to be complete first
   - Don't add dependencies just because tasks are related

2. **Avoid deep chains**
   - Prefer broad dependency trees over long chains
   - Aim for: A → [B, C, D] rather than A → B → C → D

3. **Keep tasks independent when possible**
   - Tasks that can be done in parallel should NOT depend on each other
   - Example: "Design homepage" and "Design settings page" can be parallel

---

## 📊 Task Ordering

Tasks should be logically ordered:
1. Foundation tasks first (database, models, core logic)
2. Integration tasks second (API endpoints, services)
3. UI tasks third (components, pages)
4. Polish tasks last (testing, docs, refinement)

---

## 📘 Parameter Usage Guide (CRITICAL)

### When to use `feature_id` vs `feature_name`:

**✅ Use `feature_id` when:**
- Linking a plan to an EXISTING feature
- You have the feature's UUID from PM-AI
- Example: \`"feature_id": "cef2abf3-8236-475d-93d8-acfd5ee92b2b"\`

**✅ Use `feature_name` when:**
- Creating a NEW feature that doesn't exist yet
- You only know the feature name, not the UUID
- Example: \`"feature_name": "User Authentication"\`

**❌ NEVER use BOTH:**
- Using both parameters creates ambiguity
- If both are provided, \`feature_id\` takes precedence
- \`feature_name\` will be ignored if \`feature_id\` exists

### Concrete Examples:

**Example 1 - Link to existing feature:**
\`\`\`json
{
  "title": "Implement Login API",
  "feature_id": "abc-123-def-456",  // ✅ Use existing feature ID
  "tasks": [...]
}
\`\`\`

**Example 2 - Create new feature:**
\`\`\`json
{
  "title": "Build Dashboard",
  "feature_name": "Analytics Dashboard",  // ✅ Create new feature
  "tasks": [...]
}
\`\`\`

**Example 3 - WRONG (ambiguous):**
\`\`\`json
{
  "title": "Setup Database",
  "feature_id": "abc-123",        // ❌ Don't use both!
  "feature_name": "Database",     // ❌ This will be ignored
  "tasks": [...]
}
\`\`\`

---

## 🔄 Iteration Rule

If the user asks for revision:
- Modify only affected tasks
- Keep stable tasks unchanged
- Maintain dependency integrity
- Update task IDs/references if needed

---

## 🎯 PM-AI Integration (CRITICAL)

**Parameter Precedence Rules:**
- Use \`feature_id\` when linking to an EXISTING feature
- Use \`feature_name\` when creating a NEW feature
- ⚠️ **IMPORTANT**: Only use ONE parameter at a time (never both)
- If both are somehow provided, \`feature_id\` takes precedence

After generating the plan:

1. Call \`save_plan\` tool with:
   \`\`\`json
   {
     "title": "[Your plan title]",
     "markdown": "[Optional: Additional context or notes about the plan]",
     ${featureId ? `"feature_id": "${featureId}",` : featureName ? `"feature_name": "${featureName}",` : ''}
     "tasks": [
       {
         "title": "Task 1 title",
         "description": "Task 1 description",
         "priority": "high",
         "dependencies": [],
         "status": "planned"
       },
       {
         "title": "Task 2 title",
         "description": "Task 2 description",
         "priority": "medium",
         "dependencies": ["Task 1 title"],
         "status": "planned"
       }
     ]
   }
   \`\`\`

2. The tool will save the plan to PM-AI database
3. Confirm the plan was saved with the plan ID

4. **Suggest next step**: Ask the user if they want to execute this plan
   - Say: "Would you like to execute this plan and start implementing the tasks?"
   - Explain: "I can work through each task systematically, updating status as I complete each one."
   - Instructions: "To execute the plan, use the auto_execute_plan tool with the plan ID, or say 'execute this plan'"

**IMPORTANT:**
- Replace previous plan if updating an existing one
- Do NOT keep the plan only in chat
- All plans must be saved to PM-AI database

---

## ✅ Plan Creation Termination Protocol (MANDATORY)

After generating and saving the plan:

1. **Confirm plan was created** - Show plan ID, title, and number of tasks
2. **Output the termination signal** - On a new line, output EXACTLY:
   \`<<PM-AI:PLAN_CREATED>>\`

3. **STOP immediately** - Do NOT execute any tasks

---

## 🛑 Strict Rules

After outputting \`<<PM-AI:PLAN_CREATED>>\`:

- **Do NOT** execute any tasks
- **Do NOT** write implementation code
- **Do NOT** start working on the first task
- **DO WAIT** for user to approve the plan or request changes
- User will invoke \`/task.execute\` when ready to begin implementation

**The termination signal means: PLAN COMPLETE. WAIT FOR USER APPROVAL.**

---

## 🚀 Now, create the execution plan

Analyze the PRD above and generate a comprehensive, well-structured execution plan.

Remember:
- Tasks should be 1–3 hours each
- Be specific and actionable
- Use dependencies wisely
- Save to PM-AI database when done`
            }
          }
        ]
      };
    }
  );
}

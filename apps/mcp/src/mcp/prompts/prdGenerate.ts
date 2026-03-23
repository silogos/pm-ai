import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function registerPrdGeneratePrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'prd.generate',
    {
      description: '🧠 Generate or update a Product Requirement Document (PRD) based on user request. Creates clear, concise PRDs with problem definition, users, solution, scope, and success metrics.',
      argsSchema: {
        request: z.string().describe('The user request describing what feature or product they want to build'),
        feature_name: z.string().optional().describe('Optional: Feature name for context (does not create/update, only for reference)'),
        feature_id: z.string().optional().describe('Optional: Feature ID if updating an existing PRD (if provided, updates existing; if not, creates new)')
      }
    },
    (args) => {
      const request = args.request as string || '';
      const featureName = args.feature_name as string | undefined;
      const featureId = args.feature_id as string | undefined;

      // UPDATE LOGIC: If feature_id exists, we're updating; otherwise creating new
      // feature_name is only for context/reference, never triggers creation
      const isUpdate = !!featureId;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# 🧠 PRD Generation Task

You are a senior product manager.

Your task is to ${isUpdate ? 'update an existing' : 'generate a new'} Product Requirement Document (PRD)
based on the user's request.

## User Request
${request}

${isUpdate ? `
## 🔄 UPDATE SCENARIO
You are UPDATING an existing feature.

**Existing Feature Details:**
- Feature Name: ${featureName || 'Unknown'}
- Feature ID: ${featureId}

**Instructions:**
- Review the current feature state
- Make targeted improvements based on user request
- Use \`update_feature\` tool when done (do NOT create a new feature)
` : `
## ✨ CREATE SCENARIO
You are CREATING a NEW feature.

**Instructions:**
- Generate a complete PRD based on user request
- Use \`create_feature\` tool when done
- Extract a concise feature name from the PRD
`}

---

## 📋 Output Structure (MANDATORY)

Your response MUST follow this exact structure:

### ## Problem
Describe the core problem in 1–3 sentences.
- What pain point are we solving?
- Why is this important now?

### ## Users
Who will use this feature?
- Primary users
- Secondary users (if any)
- User personas or segments

### ## Solution
Describe the proposed solution in a simple and clear way.
- High-level approach
- Key user flows
- Core functionality

### ## Scope
List what is INCLUDED in this feature.
- Must-have features
- Key deliverables
- Acceptance criteria

### ## Out of Scope
List what is EXCLUDED to prevent scope creep.
- What will NOT be built
- Future phases
- Explicit boundaries

### ## Success Metrics
How do we measure success?
- User engagement metrics
- Business KPIs
- Technical performance indicators

---

## ✅ Rules

1. **Keep it concise** - Avoid long paragraphs, use bullet points
2. **No technical details** - Focus on WHAT and WHY, not HOW
3. **User value first** - Every feature should tie back to user value
4. **Make reasonable assumptions** - If something is unclear, state your assumption
5. **Be specific** - Avoid vague language like "improve experience"

---

## 🔄 Iteration Rule

If the user provides feedback:
- Update only relevant sections
- Keep structure consistent
- Avoid rewriting everything
- Preserve what's already good

---

## 📘 Parameter Usage Guide (CRITICAL)

### Understanding PRD Generation Parameters:

**`feature_id` - UPDATE existing feature:**
- Use when you want to update an EXISTING feature's PRD
- Must be a valid UUID from PM-AI database
- When provided, the prompt enters UPDATE MODE
- Calls \`update_feature\` tool when done

**`feature_name` - Reference only:**
- Used ONLY for context/reference about existing features
- Does NOT trigger creation or updates by itself
- Helpful for identifying which feature to update when combined with \`feature_id\`

**No parameters - CREATE new feature:**
- When \`feature_id\` is NOT provided, creates a NEW feature
- Enters CREATE MODE automatically
- Calls \`create_feature\` tool when done
- Extracts feature name from the PRD content

### Concrete Examples:

**Example 1 - Create new feature (no parameters):**
\`\`\`
User: "Create a PRD for user authentication"
→ Result: Creates new feature, extracts name "User Authentication"
\`\`\`

**Example 2 - Update existing feature:**
\`\`\`
User: "Update the PRD for feature abc-123-def"
→ Result: Updates existing feature, uses \`update_feature\`
\`\`\`

**Example 3 - Update with context (both parameters):**
\`\`\`
User: "Improve the authentication PRD (ID: abc-123)"
feature_id: "abc-123"
feature_name: "User Authentication"  // Only for reference
→ Result: Updates existing feature abc-123
\`\`\`

### Key Rules:
1. ✅ \`feature_id\` present → UPDATE existing feature
2. ✅ \`feature_id\` absent → CREATE new feature
3. ℹ️  \`feature_name\` → Reference/context only, never creates duplicates
4. ⚠️  If both provided, \`feature_id\` takes precedence

---

## 🎯 PM-AI Integration (CRITICAL)

**Parameter Precedence Rules:**
- When \`feature_id\` is provided → UPDATE existing feature (use \`update_feature\`)
- When \`feature_id\` is NOT provided → CREATE new feature (use \`create_feature\`)
- ⚠️ **IMPORTANT**: \`feature_name\` is only for reference/context, never creates duplicates
- If both \`feature_id\` and \`feature_name\` are provided, \`feature_id\` takes precedence

${isUpdate ? `
**UPDATE MODE:** You are updating an existing feature
After generating the updated PRD:

1. Call the \`update_feature\` tool:
   - feature_id: "${featureId}"
   - description: [The updated PRD content]

2. Confirm the update to the user

3. **Suggest next step**: Ask the user if they want to create a plan for this updated PRD
   - Say: "Would you like to create an execution plan for this PRD?"
   - Explain: "I can break down this feature into actionable tasks with dependencies and priorities."
   - Instructions: "To create a plan, use the plan.generate prompt with the PRD content, or say 'create a plan for this feature'"

` : `
**CREATE MODE:** You are creating a new feature
After generating the PRD:

1. Call the \`create_feature\` tool:
   - name: [Extract a concise feature name from the PRD]
   - description: [The full PRD content]

2. The tool will return a feature_id
3. Confirm the feature was created with the ID

4. **Suggest next step**: Ask the user if they want to create a plan for this PRD
   - Say: "Would you like to create an execution plan for this PRD?"
   - Explain: "I can break down this feature into actionable tasks with dependencies and priorities."
   - Instructions: "To create a plan, use the plan.generate prompt with the PRD content, or say 'create a plan for this feature'"

`}
**IMPORTANT:** Do NOT leave the PRD only in chat. It must be saved to PM-AI database.


---

## ✅ PRD Creation Termination Protocol (MANDATORY)

After generating and saving the PRD:

1. **Confirm PRD was created** - Show feature ID, name, and brief summary
2. **Output the termination signal** - On a new line, output EXACTLY:
   \`<<PM-AI:PRD_CREATED>>\`

3. **STOP immediately** - Do NOT continue to implementation

---

## 🛑 Strict Rules

After outputting \`<<PM-AI:PRD_CREATED>>\`:

- **Do NOT** start implementation
- **Do NOT** generate tasks
- **Do NOT** write code
- **Do NOT** create execution plans
- **DO WAIT** for user to approve PRD or request changes

**The termination signal means: PRD COMPLETE. WAIT FOR USER APPROVAL.**

---

Now, generate ${isUpdate ? 'the updated' : 'a'} PRD based on the user request above.

Remember to follow the MANDATORY structure exactly and save it to PM-AI database when done.`
            }
          }
        ]
      };
    }
  );
}

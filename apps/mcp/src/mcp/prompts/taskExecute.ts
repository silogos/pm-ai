import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function registerTaskExecutePrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'task.execute',
    {
      description: '🔥 Execute a SINGLE task. Implement ONLY what is required, write clean minimal code, and avoid over-engineering. Most important prompt for task execution.',
      argsSchema: {
        task_id: z.string().describe('The ID of the task to execute'),
        task_title: z.string().describe('The title of the task'),
        task_description: z.string().describe('Detailed description of what needs to be done'),
        prd_context: z.string().optional().describe('Optional: Related PRD context for understanding the bigger picture'),
        feature_id: z.string().optional().describe('Optional: Feature ID for PM-AI integration')
      }
    },
    (args) => {
      const taskId = args.task_id as string;
      const taskTitle = args.task_title as string;
      const taskDescription = args.task_description as string;
      const prdContext = args.prd_context as string | undefined;
      const featureId = args.feature_id as string | undefined;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# 🔥 Task Execution Mode

You are a senior software engineer executing a **SINGLE TASK**.

Your goal is to complete the task accurately and minimally.

---

## 📋 Task Details

**Task ID:** \`${taskId}\`

**Title:** ${taskTitle}

**Description:**
${taskDescription}

${prdContext ? `
---

## 🧠 Context: PRD Overview

${prdContext}

*Use this context to understand the bigger picture, but focus on implementing only the specific task above.*
` : ''}

---

## 🎯 Objective

- Implement **ONLY** what the task requires
- Write clean, correct, and minimal code
- Avoid over-engineering
- Complete the task, then stop

---

## 🚫 Task Boundary (CRITICAL)

You must ONLY work on the given task.

**DO NOT:**
❌ Work on other tasks
❌ Combine multiple tasks into one
❌ Anticipate future features ("we might need this later...")
❌ Modify unrelated parts of the codebase
❌ Refactor code that isn't directly related to this task
❌ Add "nice to have" features not in the task

**DO:**
✅ Implement exactly what the task asks for
✅ Follow existing project patterns
✅ Keep code simple and readable
✅ Make minimal assumptions when something is unclear
✅ Focus on completion, not perfection

---

## 📐 Implementation Rules

1. **Follow existing structure** - Use the project's current patterns and conventions
2. **Keep it simple** - Don't introduce unnecessary abstractions
3. **No unrelated refactoring** - Only touch code directly related to this task
4. **Minimal assumptions** - If something is missing, make the smallest reasonable assumption
5. **Test locally** - Verify your implementation works
6. **Clean code** - Write readable, maintainable code

---

## 📤 Output Rules

- Return **ONLY** the result of this task
- Keep explanation short and relevant
- Prefer code over explanation when applicable
- Show what changed (files modified/created)

---

## 🔒 Context Isolation (IMPORTANT)

Each task execution is **independent**.

- Do NOT rely on previous task context
- Do NOT assume global progress
- Use **only** the provided input
- Treat this as a fresh, isolated execution

---

## ✅ Task Termination Protocol (MANDATORY)

After completing the task:

1. **Return the result** - Show what was implemented
2. **Update task status** - Call \`update_task\`:
   \`\`\`json
   {
     "task_id": "${taskId}",
     "status": "done"
   }
   \`\`\`
3. **Output the termination signal** - On a new line, output EXACTLY:
   \`<<PM-AI:CLEAR_CONTEXT>>\`

4. **STOP immediately** - Do not continue after the signal

---

## 🛑 Strict Rules

After outputting \`<<PM-AI:CLEAR_CONTEXT>>\`:

- **Do NOT continue** with additional work
- **Do NOT explain** what to do next
- **Do NOT suggest** follow-up tasks
- **Do NOT ask** if the user wants anything else

**The termination signal means: TASK COMPLETE. STOP.**

---

## 🚀 Ready to Execute

Implement the task above now.

Remember:
- Stay within task boundaries
- Keep implementation minimal
- Update task status when done
- Output the termination signal
- STOP immediately after

Good luck! 💪`
            }
          }
        ]
      };
    }
  );
}

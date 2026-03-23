import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export async function registerTaskReviewPrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'task.review',
    {
      description: '🧪 Review a completed task for correctness, issues, and quality assurance. Optional QA layer for task validation.',
      argsSchema: {
        task_id: z.string().describe('The ID of the task to review'),
        task_title: z.string().describe('The title of the task that was completed'),
        task_description: z.string().describe('Original task description to compare against'),
        implementation_summary: z.string().describe('Summary of what was implemented'),
        feature_id: z.string().optional().describe('Optional: Feature ID for PM-AI integration')
      }
    },
    (args) => {
      const taskId = args.task_id as string;
      const taskTitle = args.task_title as string;
      const taskDescription = args.task_description as string;
      const implementationSummary = args.implementation_summary as string;
      const featureId = args.feature_id as string | undefined;

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# 🧪 Task Review Mode

You are a senior reviewer specializing in code quality, correctness, and best practices.

Your task is to review the result of a completed task.

---

## 📋 Task Information

**Task ID:** \`${taskId}\`

**Task Title:** ${taskTitle}

**Original Description:**
${taskDescription}

**Implementation Summary:**
${implementationSummary}

---

## 🎯 Review Objectives

Your goal is to:

1. **Check correctness** - Does the implementation match the requirements?
2. **Identify issues** - Any bugs, errors, or potential problems?
3. **Assess quality** - Is the code clean, maintainable, and following best practices?
4. **Suggest fixes** - If issues found, provide clear, actionable fixes

---

## 🔍 Review Checklist

### ✅ Correctness
- [ ] Implementation matches the task description
- [ ] All requirements are met
- [ ] No missing functionality
- [ ] No extra/unrelated features added

### 🐛 Issues
- [ ] No bugs or logic errors
- [ ] No edge cases overlooked
- [ ] Error handling is appropriate
- [ ] No security vulnerabilities

### 📐 Code Quality
- [ ] Code is readable and clear
- [ ] Follows project conventions
- [ ] Proper naming and structure
- [ ] Appropriate comments (if needed)

### 🧪 Testing
- [ ] Implementation appears testable
- [ ] Edge cases considered
- [ ] No obvious runtime issues

---

## 📤 Output Structure

Your review MUST include:

### 1. Issues Found (if any)
List each issue with:
- **Severity:** Critical | High | Medium | Low
- **Location:** Where in the code
- **Description:** What's wrong
- **Impact:** Why it matters

### 2. Suggested Fixes (if issues found)
For each issue:
- **Fix:** What should be changed
- **Code Example:** Show the fix (if applicable)
- **Priority:** Order by severity

### 3. Approval Status
One of:
- ✅ **approved** - No issues found, task is complete
- ⚠️ **needs_revision** - Issues found that should be fixed

### 4. Overall Comments
Brief summary of your review:
- What was done well
- Overall quality assessment
- Any recommendations for future

---

## ⚠️ Review Rules

1. **Be fair** - Don't nitpick minor style issues unless they affect quality
2. **Be specific** - Point to exact issues, not vague concerns
3. **Be constructive** - Focus on what matters for correctness and maintainability
4. **Be practical** - Consider the task scope, don't expect perfection

---

## 🔄 PM-AI Integration

${featureId ? `
After completing your review:

**If approved:**
- Optionally: Add a comment to the task with the review summary
- No status change needed (task is already "done")

**If needs_revision:**
- Call \`add_task_comment\` with:
  - task_id: "${taskId}"
  - content: [Your review with issues and fixes]
- Consider if the task should be moved back to "planned" status
` : `
This review appears to be standalone (no feature_id provided).
Provide your review output without database integration.
`}

---

## 🚀 Ready to Review

Analyze the task implementation against the original requirements now.

Remember:
- Be thorough but fair
- Focus on correctness and quality
- Provide clear, actionable feedback
- Make a clear approval decision

Let's begin the review! 👀`
            }
          }
        ]
      };
    }
  );
}

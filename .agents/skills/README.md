# .agents/skills/

This directory contains reusable AI skill definitions for the hackathon workspace.

## What is a Skill?

A skill is a structured instruction set for an AI agent. Each skill defines:
- When and why to use it
- A step-by-step workflow
- Expected inputs and outputs
- Safety constraints
- Verification checklist

Skills are designed for **you** (the developer) to invoke, not for AI to auto-execute autonomously.

## Available Skills

| Skill | When to Use |
|---|---|
| [`problem-analyzer`](./problem-analyzer/SKILL.md) | Immediately when the problem statement is announced |
| [`hackathon-planner`](./hackathon-planner/SKILL.md) | After analysis — to generate the task list |
| [`frontend-wow`](./frontend-wow/SKILL.md) | When designing or implementing any UI |
| [`backend-builder`](./backend-builder/SKILL.md) | When designing APIs or data models |
| [`bug-hunter`](./bug-hunter/SKILL.md) | When debugging any error or failure |
| [`demo-reviewer`](./demo-reviewer/SKILL.md) | 45 minutes before submission deadline |

## How to Use a Skill with Antigravity

1. Open Antigravity
2. Say: `Read and follow the skill at .agents/skills/[skill-name]/SKILL.md`
3. Provide the inputs the skill requests
4. Follow the workflow step by step

## How to Use a Skill with ChatGPT

1. Open the SKILL.md file in your editor
2. Copy the relevant section (e.g., "Workflow Step 3")
3. Paste it as context in ChatGPT along with your specific data
4. Follow ChatGPT's output through the skill's verification checklist

## Adding New Skills

Copy an existing skill directory and edit the YAML frontmatter and content.
Skills should be self-contained — no external dependencies beyond the tools listed.

---
name: problem-analyzer
version: "1.0"
description: >
  Analyzes an unknown hackathon problem statement to extract requirements,
  constraints, judging criteria, and the simplest effective architecture.
  Separates confirmed facts from assumptions. Compares technical approaches.
tags: [hackathon, analysis, requirements, architecture]
author: workspace-setup
---

# Skill: problem-analyzer

## Purpose

When a hackathon problem statement is announced, this skill guides a structured analysis before any code is written. Rushing into implementation without analysis is the most common hackathon failure mode.

**Use this skill immediately after the problem statement is revealed.**

---

## Inputs Required

Before starting, collect:

- [ ] The full, exact problem statement text
- [ ] Judging criteria (if published)
- [ ] Time limit for the hackathon
- [ ] Any technical constraints from organizers (required APIs, platforms, etc.)
- [ ] Team size (you are solo)

---

## Workflow

### Step 1 — Read Without Filtering (5 minutes)

Read the problem statement three times:
1. First read: Just understand the general idea
2. Second read: Highlight every verb (these are actions the system must perform)
3. Third read: Highlight every noun (these are data entities and actors)

Do not start designing yet.

---

### Step 2 — Extract Requirements

Using the problem statement, fill in this template:

```markdown
## Extracted Requirements

### Who are the users?
- Primary user: [role/persona]
- Secondary users: [if any]

### What problem are they trying to solve?
[1-2 sentence plain-English description]

### What must the system DO? (Functional Requirements)
- [ ] FR1: 
- [ ] FR2: 
- [ ] FR3: 
[Add as many as needed]

### What must the system NOT do, or how must it behave? (Non-Functional)
- Performance: 
- Security: 
- Accessibility: 
- Platform: 

### What data does the system need to store or process?
- Entity 1: [fields]
- Entity 2: [fields]

### What external services or APIs are mentioned or implied?
- 
```

---

### Step 3 — Identify Judging Criteria

Most hackathons judge on some combination of:

| Criterion | Weight (if known) | How to address it |
|---|---|---|
| Technical complexity | | |
| Innovation / creativity | | |
| Practical usefulness | | |
| Completeness / polish | | |
| Presentation quality | | |
| Impact / scalability | | |

**Action:** Map each judging criterion to a specific feature or decision in your plan.

---

### Step 4 — Separate Facts from Assumptions

```markdown
## Confirmed (from problem statement)
- 

## Assumed (not stated, but reasonable)
- 

## Uncertain (need to clarify or decide arbitrarily)
- 
```

**Rule:** Never build on an uncertain assumption without flagging it in code comments.

---

### Step 5 — Compare Technical Approaches

For each major architectural decision, list at least two options:

```markdown
## Architecture Decision: [Decision name]

### Option A: [Name]
- How it works: 
- Pros: 
- Cons: 
- Time estimate: 

### Option B: [Name]
- How it works: 
- Pros: 
- Cons: 
- Time estimate: 

### Recommendation: Option [A/B] because [reason]
```

Common decisions to evaluate:
- Frontend framework (React, Next.js, plain HTML, etc.)
- Backend approach (REST API, serverless functions, BFF, no backend)
- Data persistence (none, localStorage, SQLite, Supabase, Firebase)
- Authentication (none, magic link, OAuth, simple session)
- AI integration (needed? which API?)
- Deployment target (Vercel, Netlify, Railway, local demo)

---

### Step 6 — Recommend the Simplest Effective Architecture

Write a one-paragraph architecture recommendation:

```markdown
## Recommended Architecture

[System name] is a [type of application] that [core purpose].

The frontend is built with [framework] because [reason].
The backend [uses X / is not needed] because [reason].
Data is stored [where/how] because [reason].

The MVP requires [N] core features:
1. 
2. 
3. 

This architecture can be completed in [estimated time] leaving [buffer time] for polish and debugging.
```

---

### Step 7 — Prompt for Antigravity

After completing Steps 1–6, use this prompt in Antigravity:

```
I have analyzed the hackathon problem statement. Here is my analysis:

[Paste your completed analysis from Steps 1-6]

Based on this, please help me create docs/PRD.md using the PRD template, 
then run the hackathon-planner skill to generate a task list.

Do not install anything yet. Just create the documents.
```

---

## Expected Outputs

- Completed `docs/PROBLEM.md` with full analysis
- Architecture recommendation written in plain English
- Clear list of confirmed vs assumed requirements
- Comparison of at least two technical approaches per major decision

---

## Safety Constraints

- Do not write any code during this step
- Do not install any packages or frameworks
- Do not commit anything to Git
- If requirements are unclear, document the ambiguity — do not silently assume

---

## Verification

✅ You can explain the problem in two sentences without looking at the statement  
✅ You know who the user is and what problem they have  
✅ You have written down at least 3 functional requirements  
✅ You have compared at least 2 architectural approaches  
✅ Your architecture recommendation fits within the hackathon time limit  
✅ Every assumption is labeled as an assumption  

---

## Time Budget

This entire skill should take **20–30 minutes maximum**. If you are spending more time analyzing than building, cut the analysis short and make reasonable decisions.

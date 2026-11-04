---
name: hackathon-planner
version: "1.0"
description: >
  Converts analyzed requirements into a prioritized MVP task list.
  Separates critical from optional features. Establishes milestones.
  Ensures a working end-to-end demo is always the top priority.
tags: [hackathon, planning, tasks, mvp, prioritization]
author: workspace-setup
---

# Skill: hackathon-planner

## Purpose

After the problem is analyzed (see `problem-analyzer`), this skill converts requirements into a concrete, time-boxed task list. The primary goal is always: **have a working demo at every milestone.**

**Use this skill after `problem-analyzer` is complete.**

---

## Prerequisite

- `docs/PROBLEM.md` is filled in
- Architecture has been decided
- `docs/PRD.md` exists with confirmed requirements

---

## Workflow

### Step 1 — Establish Your Time Budget

```markdown
## Time Budget

Hackathon start:    [HH:MM]
Hackathon end:      [HH:MM]
Total time:         [X hours]

Breakdown:
- Setup & scaffolding:       [30 min]
- Core feature development:  [X hours]
- Polish & UX:               [1 hour]
- Testing & bug fixes:       [1 hour]
- Demo preparation:          [30 min]
- Buffer (always keep this): [30 min]

Available for features: [X hours remaining]
```

---

### Step 2 — Define the MVP

The MVP is the **minimum** that makes a judge say "this works."

```markdown
## MVP Definition

The demo is complete when a judge can:
1. [Action 1] — and see [expected result]
2. [Action 2] — and see [expected result]
3. [Action 3] — and see [expected result]

Nothing else is required for the MVP.
```

---

### Step 3 — Categorize Features

```markdown
## Feature Categories

### 🔴 MUST HAVE (MVP — demo breaks without these)
- [ ] M1: [Feature] — [Why essential]
- [ ] M2: 
- [ ] M3: 

### 🟡 SHOULD HAVE (Impressive — add after MVP works)
- [ ] S1: [Feature] — [Impact on score]
- [ ] S2: 
- [ ] S3: 

### 🟢 NICE TO HAVE (Polish — only if time allows)
- [ ] N1: [Feature]
- [ ] N2: 

### ⛔ CUT (Out of scope — do not build)
- [Feature]: [Reason it's cut]
```

---

### Step 4 — Build the Task List

Break each MUST HAVE feature into concrete, completable tasks (30–90 minutes each):

```markdown
## Task List

### Phase 1: Foundation (Target: [time])
- [ ] T01 — Initialize project with [framework]: `[command to run]`
- [ ] T02 — Set up folder structure
- [ ] T03 — Configure environment variables template
- [ ] T04 — Create basic layout/shell UI

**Milestone 1:** App runs locally with placeholder content

### Phase 2: Core Features (Target: [time])
- [ ] T05 — [Feature 1, Part A]
- [ ] T06 — [Feature 1, Part B]
- [ ] T07 — [Feature 2]
- [ ] T08 — Connect frontend to backend/API

**Milestone 2:** Core user journey works end-to-end (even if ugly)

### Phase 3: Polish & UX (Target: [time])
- [ ] T09 — Apply design system (Tailwind, shadcn)
- [ ] T10 — Add loading states and error handling
- [ ] T11 — Make responsive for mobile
- [ ] T12 — Add demo data / seed content

**Milestone 3:** App is visually impressive and stable

### Phase 4: Final (Target: [time])
- [ ] T13 — End-to-end test of demo flow
- [ ] T14 — Fix any critical bugs
- [ ] T15 — Deploy to [platform]
- [ ] T16 — Prepare demo script

**Milestone 4:** Ready to submit
```

---

### Step 5 — Identify Dependencies

```markdown
## Dependencies

T06 requires T05 (can't build feature without backend route)
T08 requires T05, T06, T07
...

Critical path: T01 → T02 → T05 → T06 → T08 → T09 → T13
```

---

### Step 6 — Time-Cut Protocol

If you fall behind schedule, apply these rules in order:

1. **First cut:** All 🟢 NICE TO HAVE features
2. **Second cut:** 🟡 SHOULD HAVE features one by one (lowest impact first)
3. **Never cut:** The demo flow — judges must be able to use the app
4. **Fake it if needed:** Use hardcoded data for features not yet built, but clearly label them as "demo mode" in comments
5. **Last resort:** A polished, explained prototype beats a broken full implementation

---

### Step 7 — Antigravity Task Prompt

Use this prompt to delegate tasks to Antigravity:

```
I am working on task [T0X]: [Task description].

Context:
- Stack: [frontend/backend stack]
- Current state: [what already exists]
- This task must: [specific requirements]
- Do not: [things to avoid]

Please help me implement this. Show me the files you will create or modify 
before making any changes. List any packages you need to install.
Do not run any commands — I will run them myself.
```

---

## Expected Outputs

- Completed `docs/TASKS.md` with prioritized task list
- MVP definition written in terms of judge-observable actions
- Time budget allocated to each phase
- Clear time-cut protocol documented

---

## Safety Constraints

- Tasks marked 🔴 MUST be completed before touching 🟡 or 🟢 tasks
- Never skip Milestone 1 (working local app) to add features
- Always keep 30 minutes buffer — do not fill it with features
- No task should be longer than 90 minutes — split it if so

---

## Verification

✅ Every MUST HAVE feature has at least one concrete task  
✅ Each task is 30–90 minutes maximum  
✅ You can reach Milestone 1 within the first 25% of your time budget  
✅ The time-cut protocol is clear and you've emotionally accepted it  
✅ `docs/TASKS.md` is saved and open in your editor  

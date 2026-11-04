---
name: demo-reviewer
version: "1.0"
description: >
  Reviews the completed project against the problem statement before submission.
  Checks critical user journeys, usability, performance, and stability.
  Prepares a demonstration checklist and identifies presentation risks.
tags: [demo, review, submission, presentation, quality, testing]
author: workspace-setup
---

# Skill: demo-reviewer

## Purpose

The 30 minutes before a hackathon submission are the most valuable minutes. This skill ensures you use them to verify and present — not to fix last-minute bugs that introduce new problems.

**Use this skill 45 minutes before submission deadline.**

---

## The Prime Directive

> **After this skill begins, no new features.** 
> 
> Bug fixes only if they affect the demo flow. Everything else is frozen.

---

## Workflow

### Step 1 — Verify Against the Problem Statement

Open `docs/PROBLEM.md` and `docs/PRD.md`. For each functional requirement:

```markdown
## Requirements Verification

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR1: [description] | ✅ Works / ⚠️ Partial / ❌ Missing | |
| FR2: | | |
| FR3: | | |
```

**Triage:**
- ✅ Works → move on
- ⚠️ Partial → can it be demoed around? If yes, note it in the demo script
- ❌ Missing → is there a workaround or explanation for judges?

---

### Step 2 — Walk the Critical User Journey

Perform the exact steps a judge will follow during your demo:

```markdown
## Demo Flow Test

Starting point: [URL / fresh browser tab]

Step 1: [Action] → Expected: [result] → Actual: [result] ✅/❌
Step 2: [Action] → Expected: [result] → Actual: [result] ✅/❌
Step 3: [Action] → Expected: [result] → Actual: [result] ✅/❌
...

Edge cases to test:
- [ ] What if the user submits an empty form?
- [ ] What if the API takes > 3 seconds to respond?
- [ ] What if the user refreshes mid-flow?
- [ ] What if they open it on a phone?
```

---

### Step 3 — Visual & UX Check

```markdown
## Visual Checklist

### Layout
- [ ] No horizontal scroll on desktop (1280px width)
- [ ] No broken layout on mobile (375px width)
- [ ] Images all load (no broken image icons)
- [ ] No placeholder text ("lorem ipsum", "TODO", "coming soon")
- [ ] No raw error messages visible to users

### Design Quality
- [ ] Colors are consistent throughout
- [ ] Typography is consistent (max 2-3 font sizes)
- [ ] Spacing feels balanced — nothing cramped or too sparse
- [ ] Dark/light mode works if implemented

### States
- [ ] Loading states appear during async operations
- [ ] Error states explain what went wrong
- [ ] Empty states exist (no blank white boxes)
- [ ] Success feedback is visible after user actions
```

---

### Step 4 — Performance Check

Run in browser DevTools (you run this):

```markdown
## Performance Checks

Open DevTools → Network tab:
- [ ] Initial page load < 3 seconds on normal connection
- [ ] No failing network requests (red rows)
- [ ] No 404s for assets (images, fonts, scripts)

Open DevTools → Console:
- [ ] Zero errors in the console
- [ ] No warnings about deprecated APIs
- [ ] No "[DEBUG]" logs remaining

Lighthouse (optional but impressive):
- Run: DevTools → Lighthouse → Analyze page load
- Target: Performance > 70, Accessibility > 90
```

---

### Step 5 — Stability Check

```markdown
## Stability Tests

- [ ] Refresh the page — does it restore correctly?
- [ ] Open in an incognito window — works without existing session?
- [ ] Try on a different browser (Firefox or Safari if available)
- [ ] Simulate slow network: DevTools → Network → Slow 3G → does it handle gracefully?
- [ ] Try submitting the same action twice quickly — no duplicate data?
```

---

### Step 6 — Deployment Verification

```markdown
## Deployment Checklist

- [ ] App is deployed to production URL
- [ ] Production URL is different from localhost
- [ ] Environment variables are set in production (not just .env)
- [ ] Database / external services are connected to production (not dev)
- [ ] Test the full demo flow on the production URL (not localhost)
- [ ] URL is short and shareable (or have QR code ready)
```

---

### Step 7 — Demo Script

Write your demo script before presenting:

```markdown
## Demo Script

**Opening line:** (15 seconds)
"[App name] solves [problem] by [key innovation]."

**Demo flow:** (2-3 minutes)
1. "First, let me show you [feature] — [what it does and why it matters]"
   → [perform action]
2. "Notice how [observation about quality/design/speed]"
3. "Now [next action] — [what it demonstrates]"
4. "Finally, [compelling closing feature]"

**Closing:** (30 seconds)
"In summary, [app name] [impact statement]. It was built in [X hours] using [key technologies]."

**Prepare answers for likely questions:**
- How does [core feature] work technically?
- How would this scale to real users?
- What would you add with more time?
- How is this different from [obvious competitor]?
```

---

### Step 8 — Risk Register

```markdown
## Known Risks Before Demo

| Risk | Probability | Mitigation |
|------|-------------|------------|
| API rate limit hit during demo | Medium | Use cached/local demo data |
| Slow network at venue | High | Test on mobile data, not venue wifi |
| Environment variables missing in prod | Low | Verify in Step 6 |
| Browser extension interfering | Low | Use incognito window |
| Judges ask about missing feature | Medium | Have explanation ready |
```

---

### Step 9 — Final ChatGPT Review

Before submitting, paste this into ChatGPT:

```
I have built [app name] for a hackathon. Here is a summary:

Problem statement: [paste]
What we built: [brief description]
Tech stack: [list]
What works: [list completed features]
What's missing: [list incomplete items and why]
Judging criteria: [list]

Please give me:
1. An honest assessment of how well this addresses the problem
2. Three strengths to emphasize in the demo
3. Two weaknesses and how to address them in conversation
4. Any security or technical concerns judges might raise
5. One memorable line I can use to open the demo
```

---

## Expected Outputs

- Completed requirements verification table
- Tested demo flow with all steps confirmed
- Zero console errors on production URL
- Written demo script with timing
- List of known risks with mitigations
- ChatGPT review completed

---

## Safety Constraints

- No new features after this skill begins
- Do not fix bugs that aren't in the demo flow
- Do not deploy untested code in the final 15 minutes
- Do not show localhost during a live demo — always use the deployed URL
- If something is broken and can't be fixed in 10 minutes, script around it

---

## Verification

✅ Demo flow works end-to-end on the production URL  
✅ Zero browser console errors during the demo  
✅ All placeholder content replaced with realistic demo data  
✅ Demo script is written and timed (under 3 minutes)  
✅ You can answer "how does [X] work technically?" for every feature  
✅ Backup plan exists for your highest-probability risk  

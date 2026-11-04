---
name: bug-hunter
version: "1.0"
description: >
  Systematically investigates errors and failures. Identifies root causes
  with minimal invasive changes. Explains every debugging step so
  the developer learns from the process.
tags: [debugging, errors, root-cause, testing, regression]
author: workspace-setup
---

# Skill: bug-hunter

## Purpose

Debugging under time pressure leads to random changes that introduce new bugs. This skill enforces a systematic approach: understand the error fully before touching the code.

**Use this skill any time you encounter an error, unexpected behavior, or build failure.**

---

## The Golden Rule of Debugging

> **Never change code to fix an error you don't understand.**
> 
> If you don't know why a change fixes the bug, you don't know what else it might break.

---

## Workflow

### Step 1 — Capture the Full Error (Before Anything Else)

Collect all of this information:

```markdown
## Bug Report

### What happened?
[Describe the observed behavior in one sentence]

### What did you expect?
[Describe the expected behavior]

### Error message (exact, full text):
```
[paste error here]
```

### Stack trace (if present):
```
[paste stack trace here]
```

### Where does the error appear?
- [ ] Browser console
- [ ] Terminal / server logs  
- [ ] Build output
- [ ] Test output
- [ ] Network tab (HTTP error)

### When does it happen?
- [ ] Always (reproducible 100%)
- [ ] Sometimes (intermittent)
- [ ] Only after [specific action]
- [ ] Only in [specific environment]

### What changed recently?
- Last git commit: [description]
- Packages installed/updated: [list]
- Config changed: [what]
- If nothing changed: this may be an environment issue
```

---

### Step 2 — Reproduce the Bug

Before diagnosing, confirm you can trigger the bug reliably:

1. Write the exact steps to reproduce in `docs/` or a comment
2. If you cannot reproduce it, do NOT guess a fix
3. If it's intermittent, add logging first (Step 4) and wait for it to happen

**If you cannot reproduce it → Stop here and add observability (Step 4)**

---

### Step 3 — Read the Error Carefully

Most bugs are solved by reading the error message properly:

```markdown
## Error Anatomy

1. Error TYPE: What kind of error? (TypeError, ReferenceError, 404, CORS, etc.)
2. Error MESSAGE: What specifically went wrong?
3. Error LOCATION: Which file and line number?
4. Stack TRACE: What called that function?

## Common Error Patterns

| Error | Common Cause |
|-------|-------------|
| `Cannot read properties of undefined` | Accessing property before data loads |
| `Module not found` | Missing import, wrong path, not installed |
| `CORS error` | Missing CORS headers on backend |
| `404 on API route` | Wrong URL, server not running, route not defined |
| `Hydration mismatch` | Server/client HTML differs (Next.js) |
| `Maximum update depth exceeded` | useEffect with wrong dependencies |
| `Cannot access before initialization` | Using variable before let/const declaration |
| `ENOENT` | File path doesn't exist |
| `EADDRINUSE` | Port already in use — kill the process |
```

---

### Step 4 — Add Targeted Logging

Add the minimum logging needed to understand the error:

```typescript
// Before the error occurs, log the key variables
console.log('[DEBUG step-name]', {
  variableName: value,
  timestamp: new Date().toISOString(),
})

// After the error is fixed, remove all [DEBUG] logs
```

**Logging rules:**
- Use a `[DEBUG]` prefix so they're easy to find and remove
- Log the variable, not just "reached here"
- Log at the boundary (before calling a function, after receiving a response)
- Never log sensitive data (passwords, tokens, PII)

---

### Step 5 — Binary Search the Bug

If the source isn't obvious, use binary search:

1. Comment out half the relevant code
2. Does the error still occur?
   - YES → bug is in the half that's still active → comment out half of that
   - NO → bug is in the half you commented out → restore it, comment out a quarter
3. Repeat until you've isolated the smallest piece of code that causes the error

---

### Step 6 — Fix with Minimum Change

Once you know the root cause:

```markdown
## Fix Plan

Root cause: [Specific, precise description]

Minimum fix:
- File: [file path]
- Lines: [line numbers]
- Change: [describe the change]

Why this fixes it: [explanation]

What else could be affected: [list of potential regressions]
```

**Make only the change described in the fix plan.** Do not refactor while fixing.

---

### Step 7 — Verify the Fix

After applying the fix:

1. **Reproduce the original bug** → it should no longer occur
2. **Test adjacent functionality** → related features should still work
3. **Check the error log** → no new errors introduced
4. **Remove all `[DEBUG]` console.log statements**
5. **Commit the fix** with a message: `fix(scope): describe what was fixed`

---

### Step 8 — Learn from the Bug

After each bug is resolved, write one sentence in `docs/TASKS.md`:

```markdown
## Bug Log
- [date] [error type]: [root cause] → [fix summary]
```

This helps you recognize similar patterns faster.

---

## Common Hackathon Bug Patterns

### Environment Issues
```bash
# Port already in use
lsof -ti:3000 | xargs kill -9  # macOS/Linux
# Windows: netstat -ano | findstr :3000 → taskkill /PID [pid] /F

# Node modules corrupted
rm -rf node_modules && npm install

# Environment variable not loading
echo $MY_VAR  # Check if it's set
# Check .env file is in correct directory
```

### React / Next.js Issues
```typescript
// Hydration error → wrap dynamic content
'use client'  // Add to component using browser APIs

// State not updating → check dependencies
useEffect(() => { ... }, [dependency]) // Add missing dep

// Infinite re-render → don't mutate state in render
// Never: state.push(item) — Instead: setState([...state, item])
```

### API / Fetch Issues
```typescript
// Check network tab first — what status code did the server return?
// Check the request URL is correct
// Check Content-Type header matches what backend expects
fetch('/api/resource', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // Don't forget this
  body: JSON.stringify(data), // Must be string
})
```

---

## Prompt for Antigravity

```
I have an error I cannot resolve. Here is the full information:

Error message: [exact error]
Stack trace: [if present]
File: [where it occurs]
Steps to reproduce: [exact steps]
What I've tried: [list attempts]

Please help me identify the ROOT CAUSE before suggesting a fix.
Explain what the error means, why it's happening, and what the minimum 
change would be to fix it. Do not change anything beyond what's needed.
```

---

## Expected Outputs

- Root cause identified and explained in plain English
- Minimal code change that resolves the issue
- Verification that the fix works without introducing regressions
- All debug logging removed from final code
- One-line entry added to the bug log

---

## Safety Constraints

- Do not apply a fix you cannot explain
- Do not delete or comment out error handling to silence an error
- Do not upgrade packages to fix a bug without checking the changelog
- Do not suppress TypeScript errors with `// @ts-ignore` — fix the type
- Always remove debug logging before committing

---

## Verification

✅ The original error no longer occurs  
✅ You can explain in plain English why the bug happened  
✅ Adjacent features still work correctly  
✅ No `console.log('[DEBUG')` statements remain in committed code  
✅ The fix is the smallest possible change — no accidental refactoring included  

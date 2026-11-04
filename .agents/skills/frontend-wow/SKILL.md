---
name: frontend-wow
version: "1.0"
description: >
  Designs and builds exceptional, visually impressive frontend interfaces.
  Uses v0, Aceternity UI, React Bits, Tailwind, shadcn/ui, and Motion.
  Enforces accessibility, responsiveness, and proper loading/error states.
tags: [frontend, ui, design, tailwind, shadcn, aceternity, react-bits, v0, motion]
author: workspace-setup
---

# Skill: frontend-wow

## Purpose

A technically correct app that looks mediocre loses hackathons. This skill ensures your UI is polished, fast, accessible, and visually impressive — without wasting time on unnecessary complexity.

**Use this skill when designing or implementing any UI component or page.**

---

## Design Principles (Non-Negotiable)

1. **Hierarchy first** — Every screen has one primary action. Everything else supports it.
2. **White space is not wasted space** — Padding and margins make interfaces breathe.
3. **Consistency beats creativity** — Use your design system tokens; don't invent new colors.
4. **Motion has a purpose** — Animate state changes, not decorations.
5. **Mobile-first** — Design for 375px width, then scale up.
6. **Accessible by default** — If a keyboard user or screen reader can't use it, it's broken.

---

## Tool Selection Guide

Use the right tool for each job:

| Need | Tool | Notes |
|---|---|---|
| Full page layout prototype | **v0.dev** | Generate, then copy code locally |
| Polished hero/section components | **Aceternity UI** | Free components, MIT license |
| Animated cards, text effects | **React Bits** | Check free vs pro |
| Design system foundation | **shadcn/ui** | CLI-installable components |
| Utility styling | **Tailwind CSS** | Co-locate with components |
| Page transitions, scroll animations | **Motion (Framer)** | Keep animations subtle |
| Icons | **Lucide React** | Ships with shadcn |

---

## Workflow

### Step 1 — Define the Visual Brief (5 minutes)

Before opening any tool, answer these questions:

```markdown
## Visual Brief

Target user: [who will use this in the demo]
Tone: [professional / playful / minimal / bold / techy]
Primary color: [pick one — everything else derives from it]
Font style: [serif / sans-serif / mono accent]

Key screens to build:
1. [Screen name] — primary action: [what user does]
2. 
3. 
```

---

### Step 2 — Prototype with v0

**When to use v0:** For full page layouts, complex multi-section designs, or when you need something impressive fast.

**v0 workflow:**
1. Go to [v0.dev](https://v0.dev)
2. Write a clear prompt — see `docs/PROMPTS.md` for the template
3. Iterate with follow-up prompts (max 3 iterations — don't over-perfect)
4. Click **"Open in v0"** → **"Copy code"** (not "Deploy")
5. Paste the code into your local project under `app/components/`
6. Review and clean up: remove unused imports, check for hardcoded colors

**v0 prompt format:**
```
Build a [page/component] for [app description].

Design requirements:
- Style: [dark/light], [modern/minimal/bold]
- Color scheme: [primary color and its role]
- Must include: [specific elements]
- Must NOT include: [elements to omit]

Use Tailwind CSS and shadcn/ui components. 
Make it responsive (mobile-first).
Use realistic placeholder content, not lorem ipsum.
```

---

### Step 3 — Select Aceternity UI Components

**Website:** [ui.aceternity.com](https://ui.aceternity.com)

**Best components for hackathon demos:**
- **Bento Grid** — Great for feature showcases
- **Spotlight Card** — Impressive hero sections
- **Moving Border** — Highlight key CTAs
- **Background Beams** — Landing page depth
- **3D Card Effect** — Product showcases
- **Typewriter Effect** — Dynamic text for demos
- **Animated Tooltip** — Contextual information

**Installation pattern (after stack is chosen):**
```bash
# Each component is copy-paste — no npm install needed for most
# Visit the component page and click "Copy" tab
# Paste into app/components/ui/[component-name].tsx
# Check the "Dependencies" section on the page for required packages
```

**Important:** Some Aceternity components require:
- `framer-motion` (Motion) — `npm install motion`
- `clsx` and `tailwind-merge` — usually already present with shadcn

---

### Step 4 — Select React Bits Components

**Website:** [reactbits.dev](https://reactbits.dev)  
**Pro site:** [pro.reactbits.dev](https://pro.reactbits.dev) *(requires paid license)*

**Free components best for hackathons:**
- **Animated Counter** — Live stats
- **Stagger Text** — Title reveals
- **Magnet Effect** — Interactive buttons
- **Noise** — Textured backgrounds
- **Circular Gallery** — Image showcases

**Pro components** (if you have a license):
- **Pixel Trail** — Impressive cursor effects
- **Aurora** — Dynamic background
- Check site for current pro tier contents

**Installation:** Each component shows its specific install command on its page.

---

### Step 5 — Build with shadcn/ui

**Website:** [ui.shadcn.com](https://ui.shadcn.com)

shadcn is the foundation — use it for all standard UI: forms, dialogs, buttons, cards, navigation.

**After project is initialized:**
```bash
# Install shadcn (run inside app/ directory)
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add badge
npx shadcn@latest add skeleton  # for loading states
npx shadcn@latest add toast     # for notifications
```

**Do not install all components upfront.** Add them as needed.

---

### Step 6 — Apply Motion (Framer Motion)

Use Motion for:
- ✅ Page entry animations (fade/slide in)
- ✅ List item stagger effects
- ✅ State transitions (loading → content)
- ✅ Micro-interactions (button press, hover)
- ❌ NOT for decorative spinning or bouncing — this looks amateur

**Install:**
```bash
npm install motion
```

**Standard patterns:**
```tsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>

// Stagger children
<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li variants={itemVariant} key={item.id}>
```

---

### Step 7 — Loading & Error States (Required)

Every async operation must have:

```tsx
// Loading state
{isLoading && <Skeleton className="h-[200px] w-full rounded-xl" />}

// Error state  
{error && (
  <div className="text-destructive text-sm">
    Something went wrong. <button onClick={retry}>Try again</button>
  </div>
)}

// Empty state
{data.length === 0 && (
  <div className="text-muted-foreground text-center py-12">
    No results found.
  </div>
)}
```

---

### Step 8 — Accessibility Checklist

Before considering a component done:

- [ ] All interactive elements reachable via Tab key
- [ ] Buttons have descriptive `aria-label` if icon-only
- [ ] Form inputs have associated `<label>` elements
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] Modal dialogs trap focus and close on Escape
- [ ] No information conveyed by color alone

---

## Expected Outputs

- Visually impressive screens that match the brief
- All components properly typed (TypeScript)
- No hardcoded colors outside of Tailwind config
- Loading, error, and empty states present on every data-driven view
- Responsive at 375px, 768px, and 1280px breakpoints

---

## Safety Constraints

- Do not add animation libraries beyond Motion without approval
- Do not use `!important` in CSS — fix specificity properly
- Do not disable ESLint or TypeScript for visual components
- Limit total animation duration to < 400ms for UI transitions
- Always test at least one of: keyboard nav, screen reader, or mobile viewport

---

## Verification

✅ The UI looks impressive at first glance (show it to someone unfamiliar)  
✅ All buttons and links are keyboard-accessible  
✅ Loading states are visible when network is throttled  
✅ No console errors in the browser dev tools  
✅ Layout does not break at 375px mobile width  
✅ Colors are consistent — no random hex values in component files  

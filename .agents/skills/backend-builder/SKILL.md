---
name: backend-builder
version: "1.0"
description: >
  Recommends and implements suitable backend architecture based on actual
  requirements. Designs API routes, database models, and integrations.
  Enforces security, validation, and graceful failure handling.
tags: [backend, api, database, security, validation, architecture]
author: workspace-setup
---

# Skill: backend-builder

## Purpose

Not every hackathon project needs a backend. This skill starts by questioning whether you need one, then — if you do — helps you build it correctly, securely, and quickly.

**Use this skill when designing APIs, data models, or server-side logic.**

---

## Step 0 — Do You Actually Need a Backend?

Answer these questions before writing any server code:

| Question | If YES | If NO |
|---|---|---|
| Does data need to persist between sessions? | Need DB | localStorage or no storage |
| Do multiple users share data? | Need server | Client-side only |
| Are there secrets (API keys) to protect? | Need server | Can use client (with caution) |
| Do you need server-side processing (AI, file transforms)? | Need server | Client-side API calls |
| Is real-time sync required? | Need WebSockets | Polling or no |

**If all answers are NO:** Skip this skill. Build client-side only.

---

## Workflow

### Step 1 — Choose Architecture Tier

```markdown
## Backend Architecture Decision

### Option A: No Backend (Client-Only)
Best when: Simple data, no shared state, secrets not required
Stack: React/Next.js + direct API calls from client
Risk: API keys visible in browser (only acceptable for public APIs)

### Option B: API Routes / Serverless Functions  
Best when: Need to protect secrets, simple CRUD, AI integrations
Stack: Next.js API routes / Vercel Functions / Netlify Functions
Risk: Cold starts, no persistent connections

### Option C: Lightweight Server
Best when: Real-time features, file uploads, complex logic
Stack: Express/Fastify on Railway/Render, or Hono on Cloudflare Workers
Risk: More setup time, deployment complexity

### Option D: Backend-as-a-Service (BaaS)
Best when: Auth + DB + storage needed quickly
Stack: Supabase / Firebase
Risk: Vendor lock-in, learning curve if unfamiliar

Decision: Option [X] because [reason]
```

---

### Step 2 — Design API Routes

Before writing any code, map out all routes:

```markdown
## API Routes

Base URL: /api

| Method | Path | Purpose | Auth required? |
|--------|------|---------|----------------|
| GET    | /health | Health check | No |
| GET    | /[resource] | List all | [Yes/No] |
| POST   | /[resource] | Create | [Yes/No] |
| GET    | /[resource]/:id | Get one | [Yes/No] |
| PATCH  | /[resource]/:id | Update | [Yes/No] |
| DELETE | /[resource]/:id | Delete | [Yes/No] |

## Request/Response Shapes

### POST /[resource]
Request body:
{
  field1: string (required, max 255 chars)
  field2: number (required, > 0)
  field3?: string (optional)
}

Success response (201):
{
  id: string
  field1: string
  createdAt: string (ISO 8601)
}

Error response (400):
{
  error: "Validation failed"
  details: { field1: "Required" }
}
```

---

### Step 3 — Design Data Models

```markdown
## Data Models

### [Model Name]
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | uuid | Yes | Auto-generated |
| [field] | string | Yes | Max 255 chars |
| [field] | number | No | > 0 |
| createdAt | timestamp | Yes | Auto-set |
| updatedAt | timestamp | Yes | Auto-updated |

### Relationships
[ModelA] has many [ModelB]
[ModelB] belongs to [ModelA]
```

---

### Step 4 — Security Checklist (Apply Before Writing Any Route)

```markdown
## Security Requirements

### Input Validation
- [ ] All request body fields validated (type, length, format)
- [ ] Query parameters sanitized before use in DB queries
- [ ] File uploads: check type, size, and scan if processing
- [ ] Rate limiting on auth and expensive routes

### Authentication (if needed)
- [ ] JWT verified on every protected route
- [ ] Session tokens stored in httpOnly cookies, not localStorage
- [ ] Auth errors return 401, not 200 with error body

### Data Handling
- [ ] Parameterized queries (never string-concatenate SQL)
- [ ] Sensitive fields excluded from API responses
- [ ] User can only access their own resources (authorization, not just authentication)

### Secrets Management
- [ ] All API keys in environment variables
- [ ] .env file added to .gitignore
- [ ] .env.example committed with placeholder values
- [ ] No secrets logged or returned in error messages
```

---

### Step 5 — Validation Pattern

Use a consistent validation approach across all routes:

```typescript
// Using Zod (recommended — works everywhere)
import { z } from 'zod'

const CreateItemSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().positive(),
})

// In route handler:
const result = CreateItemSchema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: result.error.flatten().fieldErrors,
  })
}
const data = result.data // fully typed
```

**Install Zod:**
```bash
npm install zod
```

---

### Step 6 — Error Handling Pattern

Consistent error handling across the entire API:

```typescript
// Standard error shape
interface ApiError {
  error: string
  code?: string
  details?: Record<string, string[]>
}

// Route wrapper for consistent error handling
function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      console.error('[API Error]', error) // log full error server-side
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message, code: error.code })
      }
      
      // Never expose internal errors to client
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
```

---

### Step 7 — Environment Variables Template

Create `.env.example` (commit this) and `.env` (never commit):

```bash
# .env.example — copy to .env and fill in values

# Server
PORT=3001
NODE_ENV=development

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth (if using)
JWT_SECRET=your-secret-here-min-32-chars
SESSION_SECRET=your-session-secret-here

# External APIs (if using)
OPENAI_API_KEY=sk-...
[OTHER_API_NAME]_API_KEY=
```

**Never commit `.env`** — verify it's in `.gitignore`:
```bash
# Check (run this yourself)
grep -n ".env" .gitignore
```

---

### Step 8 — Integration Testing (Quick)

Before declaring the backend done:

```bash
# Quick health check (run yourself)
curl http://localhost:3001/api/health

# Test a POST route
curl -X POST http://localhost:3001/api/[resource] \
  -H "Content-Type: application/json" \
  -d '{"field1": "test value"}'

# Test validation rejection
curl -X POST http://localhost:3001/api/[resource] \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Expected Outputs

- Documented API route table
- Data model definitions
- `.env.example` with all required variables
- Input validation on every route that accepts data
- Consistent error response format
- No secrets in any committed file

---

## Safety Constraints

- Never hardcode credentials, tokens, or API keys in source files
- Always create `.env.example` before `.env`
- Do not skip validation — even in hackathons, malformed input causes crashes
- Do not expose stack traces or internal errors to API clients
- No database is required by default — justify it if you add one

---

## Verification

✅ Every API route is documented in the route table  
✅ `.env.example` exists and `.env` is in `.gitignore`  
✅ Sending invalid data to any POST route returns a 400 error  
✅ Sending a request to a non-existent route returns 404 (not a crash)  
✅ No `console.log(secret)` or similar patterns exist in the code  
✅ You can explain what each route does without reading the code  

# ReEntry task providers

Edit app/backend/.env locally. Never put keys in extension source or VITE variables. Restart scripts/start_backend.ps1 after changes.

The existing MODEL_API_KEY, MODEL_NAME and MODEL_BASE_URL define the default generation provider. Optional ANSWER_, SUMMARY_ and CHECK_ settings route questions, session briefs and evidence comparisons independently. For example:

```
ANSWER_API_KEY=your-answer-provider-key
ANSWER_MODEL_NAME=your-available-model
ANSWER_BASE_URL=https://your-provider.example/v1
SUMMARY_API_KEY=your-summary-provider-key
SUMMARY_MODEL_NAME=your-available-model
SUMMARY_BASE_URL=https://your-provider.example/v1
CHECK_API_KEY=your-check-provider-key
CHECK_MODEL_NAME=your-available-model
CHECK_BASE_URL=https://your-provider.example/v1
BRAVE_SEARCH_API_KEY=your-search-key
```

Use the provider's actual documented endpoint and model; example hostnames above are placeholders. Google endpoints use the native Gemini adapter; other configured endpoints must support OpenAI-compatible JSON chat completions. A custom task endpoint requires its own key; default keys are not forwarded to another host. This is explicit routing, not automatic fallback to an undisclosed provider.

Brave Search endpoint is fixed to its official web-search API. More tools → Map & reports → Find independent web evidence exposes query-based lookup. No search occurs until the user clicks. Search snippets are discovery leads, not verification. Open and capture original sources before drawing conclusions. Crossref scholarly search remains independent and needs no model key.

Current live generation test: HTTP 503; no successful live answer verified. A valid key does not prove model availability or quota. Missing search credentials produce an explicit message. No alternative paid account or subscription was created.

New structured captures separate search queries, detected AI Overviews and result titles/snippets. Older immutable snapshots retain their original content; start a fresh session to test extraction. Google's changing DOM may need selector updates; failed answer detection should not be treated as a complete captured overview.

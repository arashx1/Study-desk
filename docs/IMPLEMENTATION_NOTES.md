# Implemented MVP decisions

- A Passage is an immutable selected-text snapshot. Version hashes the selected text, not an entire webpage. Nearby context is captured when injection succeeds. Whole-page monitoring and automated version diffs are not implemented.
- A Claim includes one supported draft paragraph with a stable claim ID and revision. Passage references provide a navigable evidence trail. A separate visual graph canvas is not implemented.
- Findings are manual or requested explicitly from the optional AI backend. The user chooses a claim and comparison evidence. Automatic on-capture contradiction detection is not implemented.
- AI compares bounded supplied passages. Collection-wide keyword/embedding retrieval, gap detection and prior-work search remain later work. Missing credentials return unavailable, never fixture output.
- AI findings must cite both original and comparison evidence. Citation IDs are checked; their semantic correctness still needs human review.
- Extension IndexedDB owns all workspace and draft state. Finding decisions, draft revisions and review events commit in one local transaction. Backend SQLite persists ingested evidence and analysis jobs, not drafts. Broader endpoints in DATA_CONTRACTS.md are proposed, not existing.
- Permissioned page capture/restore adds tabs individually, reuses matching URLs and reports position support. Dynamic pages can prevent exact restoration. No unrelated tab is closed.
- AI sends the explicitly chosen claim, paragraph and evidence through the backend to the configured provider. It does not send browser history. No arbitrary remote page fetching is implemented.
- The backend is a loopback development prototype, not a multi-user deployment. Production authentication, quotas and packaging remain future work.

# Data contracts

Use stable IDs, UTC ISO timestamps internally, workspace ownership on every object and parameterized SQL. Display times in the user's locale.

| Entity | Required fields |
|---|---|
| Workspace | id, name, researchQuestion, createdAt |
| Source | id, workspaceId, url, title |
| SourceVersion | id, sourceId, contentHash, capturedAt, text, origin (live/fixture) |
| Passage | id, workspaceId, sourceVersionId, quote, prefix, suffix, locator |
| Claim | id, workspaceId, text, scope, reviewStatus |
| DraftParagraph | id, workspaceId, draftId, text, revision |
| EvidenceLink | id, workspaceId, passageId, claimId, relation, rationale |
| ClaimUsage | id, workspaceId, claimId, paragraphId, paragraphRevision |
| Checkpoint | id, workspaceId, tabs, positions, notes, openQuestions, confirmedNextStep, savedAt |
| Finding | id, workspaceId, type, status, passageIds, affectedClaimIds, affectedParagraphIds, limitations |
| ReviewEvent | id, findingId, decision, beforeRevision, afterRevision, createdAt |
| AnalysisJob | id, workspaceId, inputVersionIds, status, errorCode, updatedAt |

Evidence relations: supports, qualifies, challenges. Related-topic similarity is a separate non-evidence relation. Review statuses: unreviewed, accepted, rejected. Findings must record version IDs through their passage references.

## Proposed API contract; implement progressively
GET /health; POST /api/workspaces; POST /api/captures (stable captureId); POST /api/claims; POST /api/evidence-links; POST /api/checks; GET /api/jobs/{id}; POST /api/findings/{id}/reviews; GET /api/workspaces/{id}/export.
Validate workspace membership across all linked IDs. Check requests and reviews carry expected source/draft revisions; return a conflict when stale. Error shape: {error: {code, message, retryable}}. Put detailed diagnostics in redacted backend logs.

## Review transaction
Validate unchanged input versions -> persist decision -> create approved draft revision if requested -> append timeline event. Repeated review request IDs must not apply the same edit twice. Rejection leaves original writing untouched. Missing evidence returns insufficient_evidence, not an invented citation.

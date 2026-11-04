export type Workspace = { id: string; name: string; question: string; nextStep: string; notes: string; questions: string; createdAt: string };
export type Passage = { id: string; workspaceId: string; url: string; title: string; quote: string; prefix: string; suffix: string; capturedAt: string; version: string; sessionId?: string; captureKind?: 'search'|'article'|'ai-overview'|'webpage'; searchQuery?: string; displayedAnswer?: string; searchResults?: {title:string;url:string;snippet:string}[]; origin: 'live' | 'fixture' };
export type Claim = { id: string; workspaceId: string; text: string; scope: string; passageId: string; paragraph: string; revision: number; createdAt?: string };
export type Finding = { id: string; workspaceId: string; claimId: string; passageIds: string[]; expectedRevision: number; rationale: string; status: 'possible_conflict' | 'different_conditions' | 'needs_qualification' | 'insufficient_evidence'; decision: 'pending' | 'accepted' | 'rejected'; mode: 'manual' | 'ai'; suggestedText: string; createdAt: string };
export type ReviewEvent = { id: string; workspaceId: string; findingId: string; before: string; after: string; decision: string; createdAt: string };
export type SavedTab = { url: string; title: string; y: number | null };
export type Checkpoint = { id: string; workspaceId: string; tabs: SavedTab[]; savedAt: string; nextStep: string };
export type Tables = { workspaces: Workspace; passages: Passage; claims: Claim; findings: Finding; events: ReviewEvent; checkpoints: Checkpoint };

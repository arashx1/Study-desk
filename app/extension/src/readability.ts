import { Readability } from '@mozilla/readability';

// chrome.scripting runs this bundled file and extractPage in the same isolated world.
(globalThis as typeof globalThis & { ReEntryReadability?: typeof Readability }).ReEntryReadability = Readability;

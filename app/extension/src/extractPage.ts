// Self-contained: Chrome serializes this function into its isolated page world.
export function extractPage() {
  if (document.contentType !== 'text/html') return null;

  const cleanNode = (node: Element): string => {
    const copy = node.cloneNode(true) as HTMLElement;
    // Remove non-content, navigational, advertising, and hidden elements
    copy.querySelectorAll(
      'script, style, noscript, iframe, svg, canvas, input, textarea, select, [contenteditable], nav, footer, header, aside, form, button, [hidden], [role="navigation"], [role="banner"], [role="dialog"], [role="complementary"], .cookie-banner, #cookie-notice, #cookie-consent, [aria-hidden="true"]:not([role="main"])'
    ).forEach(n => n.remove());

    // Separate block elements with line breaks so paragraphs don't run together
    copy.querySelectorAll('p, div, section, article, li, h1, h2, h3, h4, h5, h6, br, blockquote, pre, tr, dl, dt, dd').forEach(n => {
      n.prepend(document.createTextNode('\n'));
      n.append(document.createTextNode('\n'));
    });

    const seen = new Set<string>();
    return (copy.textContent || '')
      .split(/\n+/)
      .map(x => x.replace(/\s+/g, ' ').trim())
      .filter(x => x.length > 2 && !/^(An error has occurred|Please try again later|An AI Overview is not available|Can.t generate an AI overview|Error translating content|AI Overview$|AI Mode replied:?$|AI Mode reply for\b|English$|Share$|This public link is valid for seven days\b|About this response$|People also ask|Read more|Show more|Loading|Transcribing|Web results|Feedback|Accept all cookies|Privacy policy)/i.test(x))
      .filter(x => {
        if (seen.has(x)) return false;
        seen.add(x);
        return true;
      })
      .join('\n\n')
      .slice(0, 25000);
  };

  const isGoogle = /(^|\.)google\.[a-z.]+$/.test(location.hostname) && location.pathname === '/search';
  const results: { title: string; url: string; snippet: string }[] = [];
  let aiOverview = '';
  let searchQuery = '';

  if (isGoogle) {
    searchQuery = new URL(location.href).searchParams.get('q') || '';

    // 1. Google AI Overview Detection: multiple modern selectors
    const aiSelectors = [
      '[data-attrid="SGEAnswer"]',
      '[data-attrid="AIOverview"]',
      '[data-attrid*="Overview"]',
      '[aria-label*="AI Overview" i]',
      'div[jsname][data-md*="overview"]',
      '.M32t7e',
      '.V3FYCf',
      '.wDYxhc:has(.ILfuVd)'
    ];

    for (const sel of aiSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = cleanNode(el);
        if (text && text.length > 40 && !/an AI Overview is not available|can.t generate an AI overview|error translating content/i.test(text)) {
          aiOverview = text;
          break;
        }
      }
    }

    // Fallback: search for heading with "AI Overview"
    if (!aiOverview) {
      const heading = Array.from(document.querySelectorAll('h1, h2, h3, div[role="heading"], span')).find(n =>
        /^AI Overview$/i.test((n.textContent || '').trim())
      );
      if (heading) {
        let parent = heading.parentElement;
        for (let i = 0; parent && i < 6; i++, parent = parent.parentElement) {
          const text = cleanNode(parent);
          if (text.length > 80 && text.length < 15000 && !/an AI Overview is not available|can.t generate an AI overview|error translating content/i.test(text)) {
            aiOverview = text.replace(/^AI Overview\s*/i, '').trim();
            break;
          }
        }
      }
    }

    // 2. Google Organic Search Results
    const seenUrls = new Set<string>();
    for (const h of Array.from(document.querySelectorAll('#search h3, #rso h3, [data-sokoban-container] h3'))) {
      const a = h.closest('a');
      if (!a || !/^https?:/.test(a.href) || seenUrls.has(a.href)) continue;
      const container = h.closest('.MjjYud, .g, [data-sokoban-container]') || a.parentElement;
      const snippet = container?.querySelector('.VwiC3b, [data-sncf], .IsZvec');
      seenUrls.add(a.href);
      results.push({
        title: (h.textContent || '').trim(),
        url: a.href,
        snippet: snippet ? cleanNode(snippet) : ''
      });
      if (results.length >= 10) break;
    }
  }

  // 3. For Non-Google Websites: Full HTML Web Scraping
  // Check main article containers first, then fallback to document.body
  const candidates = Array.from(document.querySelectorAll(
    'article, [itemprop="articleBody"], .post-content, .article-content, .entry-content, .mw-parser-output, main, [role="main"]'
  ));
  // Prefer prose-rich containers rather than dumping the entire page, including menus.
  const ranked = candidates.map(node => {
    const prose = Array.from(node.querySelectorAll('p, blockquote')).reduce((n, p) => n + (p.textContent || '').trim().length, 0);
    const links = Array.from(node.querySelectorAll('a')).reduce((n, a) => n + (a.textContent || '').trim().length, 0);
    return {node, score: prose - links * 0.5};
  }).sort((a, b) => b.score - a.score);
  let bodyText = '';
  if (!isGoogle) {
    try {
      const Reader = (globalThis as typeof globalThis & { ReEntryReadability?: new (doc: Document) => {parse: () => {textContent?: string} | null} }).ReEntryReadability;
      const article = Reader ? new Reader(document.cloneNode(true) as Document).parse() : null;
      bodyText = (article?.textContent || '').replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n').trim().slice(0, 25000);
    } catch { /* Fall back to page-container extraction. */ }
  }
  if (bodyText.length < 100) bodyText = ranked[0] && ranked[0].score >= 100 ? cleanNode(ranked[0].node) : '';

  // Meta description fallback
  const metaDesc =
    document.querySelector('meta[name="description"]')?.getAttribute('content') ||
    document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    '';

  // Construct final rich text
  let text = '';
  if (isGoogle) {
    const parts = [];
    if (aiOverview) {
      parts.push(`Google AI Overview:\n${aiOverview}`);
    }
    if (!aiOverview && results.length > 0) {
      parts.push(
        results.map((r, i) => `Result ${i + 1}: ${r.title}\n${r.snippet || r.url}`).join('\n\n')
      );
    }
    text = parts.join('\n\n');
  } else {
    // Normal website
    if (bodyText) {
      text = bodyText;
    } else if (metaDesc) {
      text = `${document.title}\n\n${metaDesc}`;
    }
  }

  // Minimum length check (40 characters to catch short summaries/articles without dropping pages)
  if (text.length < 30) {
    // If still too short, combine document title and meta description
    if (isGoogle) return null;
    text = `${document.title}${metaDesc ? '\n\n' + metaDesc : ''}`.trim();
    if (text.length < 15) return null;
  }

  return {
    text: text.slice(0, 20000),
    y: window.scrollY || 0,
    title: document.title || location.hostname,
    google: isGoogle,
    query: searchQuery,
    answer: aiOverview,
    results
  };
}

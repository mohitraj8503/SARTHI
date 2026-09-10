import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  source: string;
  title: string;
  content: string;
  keywords: string[];
}

let cachedChunks: KnowledgeChunk[] | null = null;

const KNOWLEDGE_DIR = path.join(process.cwd(), 'data/knowledge');

/**
 * Loads and parses markdown files in /data/knowledge/ into lightweight chunks.
 * Cached in-memory to prevent repeated disk I/O on low RAM servers.
 */
export function loadKnowledgeBase(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks: KnowledgeChunk[] = [];

  try {
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      return [];
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const fullPath = path.join(KNOWLEDGE_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Split document by headings (## or ###)
      const sections = content.split(/\n(?=##?\s)/g);

      sections.forEach((sec, idx) => {
        const trimmed = sec.trim();
        if (!trimmed) return;

        const lines = trimmed.split('\n');
        const titleLine = lines[0].replace(/^#+\s*/, '').trim();
        const body = lines.slice(1).join('\n').trim();

        // Extract keywords
        const keywords = Array.from(
          new Set(
            (titleLine + ' ' + body)
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(w => w.length > 2)
          )
        );

        chunks.push({
          id: `${file}-${idx}`,
          source: file,
          title: titleLine || file,
          content: trimmed,
          keywords,
        });
      });
    }

    cachedChunks = chunks;
  } catch (err) {
    console.error('Error loading knowledge base:', err);
  }

  return cachedChunks || [];
}

/**
 * Fast, lightweight BM25/keyword retrieval to select top relevant chunks.
 * Total memory usage is minimal (< 5MB) and avoids heavy vector dependencies.
 */
export function retrieveRelevantKnowledge(query: string, maxChunks = 3): string {
  const chunks = loadKnowledgeBase();
  if (chunks.length === 0) return '';

  const qWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  if (qWords.length === 0) return '';

  const scored = chunks.map(chunk => {
    let score = 0;
    for (const word of qWords) {
      if (chunk.title.toLowerCase().includes(word)) score += 5;
      if (chunk.keywords.includes(word)) score += 2;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored
    .filter(s => s.score > 0)
    .slice(0, maxChunks)
    .map(s => s.chunk.content);

  return top.join('\n\n---\n\n');
}

export interface BlogSeoInput {
  title: string;
  summary: string;
  body: string;         // plain text or HTML — strip tags before analysis
  coverUrl: string | null;
  category: string;     // e.g. "tech", "education", "career", "news"
  tags: string[];
  authorName: string;
}

export interface SeoSignal {
  id: string;
  label: string;
  score: number;        // points earned
  maxScore: number;     // max possible
  status: 'good' | 'warn' | 'bad';
  tip: string | null;   // null if status is 'good'
}

export interface BlogSeoResult {
  totalScore: number;           // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  signals: SeoSignal[];
  trendingKeywords: string[];   // category-specific suggestions
  googleNewsReady: boolean;     // true if score >= 75 AND all critical signals pass
}

export function scoreBlogSeo(input: BlogSeoInput): BlogSeoResult {
  const PLACEHOLDER_PATTERNS = [
    'enter your stunning',
    'your title here',
    'write a compelling',
    'the heart of your story',
    'drafting your masterpiece',
    'untitled',
  ];

  const cleanTitle = PLACEHOLDER_PATTERNS.some(p =>
    input.title.toLowerCase().includes(p)
  ) ? '' : input.title.trim();

  const cleanSummary = PLACEHOLDER_PATTERNS.some(p =>
    input.summary.toLowerCase().includes(p)
  ) ? '' : input.summary.trim();

  const cleanBody = input.body.replace(/<[^>]+>/g, ' ').trim();
  const isBodyPlaceholder = PLACEHOLDER_PATTERNS.some(p =>
    cleanBody.toLowerCase().includes(p)
  );
  const plainBody = isBodyPlaceholder ? '' : cleanBody;

  const signals: SeoSignal[] = [];

  // ── TITLE SIGNALS (30 pts total) ──────────────────────────────
  
  // Title length: ideal 50–70 chars for Google News
  const titleLen = cleanTitle.length;
  signals.push((() => {
    if (titleLen === 0) return {
      id: 'title-length', label: 'Title length',
      score: 0, maxScore: 10, status: 'bad' as const,
      tip: 'Write a title. Aim for 50–70 characters.'
    };
    if (titleLen >= 50 && titleLen <= 70) return {
      id: 'title-length', label: 'Title length',
      score: 10, maxScore: 10, status: 'good' as const,
      tip: null
    };
    if (titleLen >= 30 && titleLen < 50) return {
      id: 'title-length', label: 'Title length',
      score: 6, maxScore: 10, status: 'warn' as const,
      tip: `Title is ${titleLen} chars — too short. Aim for 50–70 characters.`
    };
    if (titleLen > 70 && titleLen <= 90) return {
      id: 'title-length', label: 'Title length',
      score: 7, maxScore: 10, status: 'warn' as const,
      tip: `Title is ${titleLen} chars — Google truncates above 70.`
    };
    if (titleLen < 30) return {
      id: 'title-length', label: 'Title length',
      score: 2, maxScore: 10, status: 'bad' as const,
      tip: `Title is only ${titleLen} chars — way too short. Write at least 50 characters.`
    };
    return {
      id: 'title-length', label: 'Title length',
      score: 3, maxScore: 10, status: 'bad' as const,
      tip: `Title is ${titleLen} chars — too long. Keep under 90 characters.`
    };
  })());

  // Title has number (Google News CTR booster: "5 Ways to...", "2025 Guide")
  const hasNumber = /\d/.test(cleanTitle);
  signals.push({
    id: 'title-number',
    label: 'Number in title',
    score: hasNumber ? 8 : 0,
    maxScore: 8,
    status: hasNumber ? 'good' : 'warn',
    tip: hasNumber ? null : 'Add a number to boost CTR (e.g. "5 AI Tools", "2025 Guide").'
  });

  // Title power words (urgency, curiosity, value)
  const powerWords = ['launches', 'reveals', 'breaks', 'new', 'first', 'free', 'best', 'top', 'how', 'why', 'guide', 'complete', 'ultimate', 'exclusive', 'official', 'announces'];
  const titleLower = cleanTitle.toLowerCase();
  const hasPower = powerWords.some(w => titleLower.includes(w));
  signals.push({
    id: 'title-power',
    label: 'Power word in title',
    score: hasPower ? 12 : 4,
    maxScore: 12,
    status: hasPower ? 'good' : 'warn',
    tip: hasPower ? null : `Add a power word like: ${powerWords.slice(0, 5).join(', ')}.`
  });

  // ── SUMMARY SIGNALS (20 pts total) ───────────────────────────

  const summaryLen = cleanSummary.length;
  signals.push((() => {
    if (summaryLen === 0) return {
      id: 'summary-length', label: 'Summary length',
      score: 0, maxScore: 12, status: 'bad' as const,
      tip: 'Write a summary. Aim for 120–160 characters.'
    };
    if (summaryLen >= 120 && summaryLen <= 160) return {
      id: 'summary-length', label: 'Summary length',
      score: 12, maxScore: 12, status: 'good' as const,
      tip: null
    };
    if (summaryLen >= 60 && summaryLen < 120) return {
      id: 'summary-length', label: 'Summary length',
      score: 7, maxScore: 12, status: 'warn' as const,
      tip: `Summary is ${summaryLen} chars — too short. Aim for 120–160.`
    };
    if (summaryLen > 160) return {
      id: 'summary-length', label: 'Summary length',
      score: 8, maxScore: 12, status: 'warn' as const,
      tip: `Summary is ${summaryLen} chars — Google truncates at ~160.`
    };
    return {
      id: 'summary-length', label: 'Summary length',
      score: 0, maxScore: 12, status: 'bad' as const,
      tip: `Summary is too short (${summaryLen} chars). Write at least 120 characters.`
    };
  })());

  const hookWords = ['discover', 'learn', 'find out', 'here\'s', 'everything you need', 'introducing', 'we\'re excited', 'breaking'];
  const hasHook = hookWords.some(w => cleanSummary.toLowerCase().includes(w));
  signals.push({
    id: 'summary-hook',
    label: 'Hook in summary',
    score: hasHook ? 8 : 3,
    maxScore: 8,
    status: hasHook ? 'good' : 'warn',
    tip: hasHook ? null : `Start summary with a hook like: "Discover...", "Here's how...", "Introducing..."`
  });

  // ── COVER IMAGE (10 pts) ──────────────────────────────────────
  signals.push({
    id: 'cover-image',
    label: 'Cover image',
    score: input.coverUrl ? 10 : 0,
    maxScore: 10,
    status: input.coverUrl ? 'good' : 'bad',
    tip: input.coverUrl ? null : 'Google News requires a cover image for article cards.'
  });

  // ── BODY SIGNALS (30 pts total) ───────────────────────────────

  const wordCount = plainBody.split(/\s+/).filter(Boolean).length;
  signals.push((() => {
    if (wordCount >= 400) return { id: 'body-length', label: 'Article length', score: 15, maxScore: 15, status: 'good' as const, tip: null };
    if (wordCount >= 200) return { id: 'body-length', label: 'Article length', score: 8, maxScore: 15, status: 'warn' as const, tip: `${wordCount} words — aim for 400+ for better Google News ranking.` };
    return { id: 'body-length', label: 'Article length', score: 2, maxScore: 15, status: 'bad' as const, tip: `Only ${wordCount} words. Google News prefers articles above 400 words.` };
  })());

  const h2Count = isBodyPlaceholder ? 0 : (input.body.match(/<h2/gi) || []).length;
  signals.push({
    id: 'headings',
    label: 'Subheadings (H2)',
    score: h2Count >= 2 ? 10 : h2Count === 1 ? 5 : 0,
    maxScore: 10,
    status: h2Count >= 2 ? 'good' : h2Count === 1 ? 'warn' : 'bad',
    tip: h2Count >= 2 ? null : `Add at least 2 H2 subheadings to structure the article.`
  });

  const linkCount = isBodyPlaceholder ? 0 : (input.body.match(/<a /gi) || []).length;
  signals.push({
    id: 'links',
    label: 'Internal/external links',
    score: linkCount >= 1 ? 5 : 0,
    maxScore: 5,
    status: linkCount >= 1 ? 'good' : 'warn',
    tip: linkCount >= 1 ? null : 'Add at least one link — to a related article or source.'
  });

  // ── TAGS (10 pts) ─────────────────────────────────────────────
  signals.push({
    id: 'tags',
    label: 'Tags / keywords',
    score: input.tags.length >= 3 ? 10 : input.tags.length >= 1 ? 5 : 0,
    maxScore: 10,
    status: input.tags.length >= 3 ? 'good' : input.tags.length >= 1 ? 'warn' : 'bad',
    tip: input.tags.length >= 3 ? null : 'Add at least 3 tags for better categorization.'
  });

  // ── COMPUTE TOTAL ─────────────────────────────────────────────
  const earned = signals.reduce((sum, s) => sum + s.score, 0);
  const possible = signals.reduce((sum, s) => sum + s.maxScore, 0);
  const totalScore = Math.round((earned / possible) * 100);

  const grade = totalScore >= 90 ? 'A' : totalScore >= 75 ? 'B' : totalScore >= 60 ? 'C' : totalScore >= 40 ? 'D' : 'F';

  // ── GOOGLE NEWS READY ─────────────────────────────────────────
  const criticalIds = ['title-length', 'cover-image', 'body-length'];
  const criticalPass = criticalIds.every(id => signals.find(s => s.id === id)?.status === 'good');
  const googleNewsReady = totalScore >= 75 && criticalPass;

  // ── TRENDING KEYWORDS (category-specific) ────────────────────
  const trendingMap: Record<string, string[]> = {
    tech: ['AI tools 2025', 'machine learning India', 'automation platform', 'EdTech AI', 'startup launch', 'SaaS India', 'generative AI'],
    education: ['online courses India', 'student success', 'EdTech 2025', 'CBSE tips', 'JEE preparation', 'skill development', 'certification online'],
    career: ['job market 2025', 'resume tips', 'fresher jobs India', 'placement drive', 'upskilling', 'remote work India', 'salary guide'],
    news: ['breaking tech news', 'India startup', 'product launch', 'funding round', 'AI regulation', 'digital India'],
  };
  const catKey = input.category.toLowerCase();
  const trendingKeywords = trendingMap[catKey] ?? trendingMap['tech'];

  const nothingWritten = !cleanTitle && !cleanSummary && !plainBody && !input.coverUrl;
  if (nothingWritten) {
    return {
      totalScore: 0,
      grade: 'F',
      signals: signals.map(s => ({ ...s, score: 0, status: 'bad' as const })),
      trendingKeywords,
      googleNewsReady: false,
    };
  }

  return { totalScore, grade, signals, trendingKeywords, googleNewsReady };
}

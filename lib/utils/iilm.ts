/**
 * Utility helper to determine if an applicant's college/university name
 * corresponds to IILM University, accounting for case variations, abbreviations,
 * location suffixes, missing spaces/dots, and common spelling typos.
 */
export function isIilmUniversity(college?: string | null | any): boolean {
  if (!college || typeof college !== 'string') return false;
  
  const raw = college.trim().toLowerCase();
  if (!raw) return false;

  // 1. Remove all non-alphanumeric characters (dots, hyphens, slashes, extra spaces)
  // e.g. "I.I.L.M. University" -> "iilmuniversity", "IILM-Noida" -> "iilmnoida"
  const cleaned = raw.replace(/[^a-z0-9]/g, '');

  // 2. Direct match for cleaned string containing "iilm"
  if (cleaned.includes('iilm')) {
    return true;
  }

  // 3. Handle common typos like "ilm university", "ilm univ", "ilm college"
  // e.g. cleaned starts with "ilm" followed by university/univ/campus/noida/etc.
  if (
    cleaned.startsWith('ilm') ||
    cleaned.includes('ilmuniv') ||
    cleaned.includes('ilmuniev') ||
    cleaned.includes('ilmunivarsity')
  ) {
    return true;
  }

  // 4. Token boundary check for "iilm", "i.i.l.m", "i-i-l-m", "ilm"
  const regex = /\b(i\.?i\.?l\.?m\.?|ilm)\b/i;
  if (regex.test(raw)) {
    return true;
  }

  return false;
}

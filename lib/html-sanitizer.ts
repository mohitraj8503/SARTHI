import DOMPurify from 'isomorphic-dompurify';

export function sanitizeRichHtml(input: string | null | undefined): string {
  if (!input) return "";

  // Configure DOMPurify to allow standard rich text formats but strip scripting/traversal payloads
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'span', 'div', 'blockquote', 'a', 'img', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ADD_ATTR: ['target'],
  });
}

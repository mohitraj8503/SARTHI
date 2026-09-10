/**
 * Google News & NewsArticle Structured Data Generator
 * Generates valid schema.org/NewsArticle JSON-LD objects for Google News, Top Stories & Discover
 */

export interface NewsArticleSchemaInput {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  thumbnail?: string;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  category?: string;
  author?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
    role?: string | null;
  };
}

export function generateNewsArticleSchema(input: NewsArticleSchemaInput) {
  const baseUrl = 'https://sarthi-woad.vercel.app';
  const articleUrl = `${baseUrl}/blogs/${input.slug}`;
  const publisherLogo = `${baseUrl}/sarthi-logo.png`;

  const datePublished = input.publishedAt
    ? new Date(input.publishedAt).toISOString()
    : new Date().toISOString();

  const dateModified = input.updatedAt
    ? new Date(input.updatedAt).toISOString()
    : datePublished;

  const images: string[] = [];
  if (input.thumbnail) {
    images.push(input.thumbnail.startsWith('http') ? input.thumbnail : `${baseUrl}${input.thumbnail}`);
  } else {
    images.push(`${baseUrl}/og-default.png`);
  }

  const authorName = input.author?.name || 'SARTHI Editorial';
  const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const authorUrl = `${baseUrl}/blogs/authors/${authorSlug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    'headline': input.title,
    'description': input.excerpt,
    'image': images,
    'datePublished': datePublished,
    'dateModified': dateModified,
    'articleSection': input.category || 'Technology',
    'author': {
      '@type': 'Person',
      'name': authorName,
      'url': authorUrl,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'SARTHI',
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': publisherLogo,
      },
    },
    'isAccessibleForFree': 'true',
  };
}

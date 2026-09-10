export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * GET /news-sitemap.xml
 * Dedicated Google News Sitemap serving articles published within the last 48 hours
 */
export async function GET() {
  try {
    const baseUrl = 'https://sarthi-woad.vercel.app';
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const recentNewsArticles = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        publishedAt: {
          gte: twoDaysAgo
        }
      },
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        category: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 1000
    });

    const urlEntries = recentNewsArticles.map(article => {
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : new Date().toISOString();

      return `
    <url>
      <loc>${baseUrl}/blogs/${escapeXml(article.slug)}</loc>
      <news:news>
        <news:publication>
          <news:name>SARTHI</news:name>
          <news:language>en</news:language>
        </news:publication>
        <news:publication_date>${pubDate}</news:publication_date>
        <news:title>${escapeXml(article.title)}</news:title>
      </news:news>
    </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

    return new NextResponse(xml.trim(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating Google News sitemap:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: { 'Content-Type': 'application/xml' } }
    );
  }
}

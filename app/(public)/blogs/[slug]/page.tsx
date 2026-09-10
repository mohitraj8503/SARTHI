import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlogDetailClient from './BlogDetailClient';
import { generateNewsArticleSchema } from '@/lib/blog/newsSchema';

export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

async function getBlogPost(slug: string) {
  if (isAuditPlaceholder(slug)) return null;

  try {
    const blog = await prisma.blogPost.findUnique({
      where: { slug: slug },
      include: {
        author: true
      }
    });
    return blog;
  } catch {
    return null;
  }
}

async function getRelatedStories(category: string, currentId: string) {
  try {
    const related = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        category: category,
        NOT: { id: currentId }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        publishedAt: true,
        readTime: true,
        author: {
          select: {
            name: true,
            image: true,
            avatar_url: true,
          }
        }
      },
      take: 4,
      orderBy: { publishedAt: 'desc' }
    });
    return related;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogPost(slug);
  if (!blog) return { title: 'Article Not Found | SARTHI' };

  const pageTitle = blog.seoTitle || blog.metaTitle || `${blog.title} | SARTHI`;
  const metaDesc = blog.metaDescription || blog.excerpt || (blog.content ? blog.content.substring(0, 160).replace(/<[^>]*>/g, '') : 'SARTHI News');

  return {
    title: pageTitle,
    description: metaDesc,
    alternates: {
      canonical: blog.canonicalUrl || `https://sarthi-woad.vercel.app/blogs/${blog.slug}`,
    },
    robots: {
      index: blog.robotsIndex ?? true,
      follow: blog.robotsFollow ?? true,
    },
    openGraph: {
      title: blog.ogTitle || pageTitle,
      description: blog.ogDescription || metaDesc,
      images: [blog.ogImage || blog.thumbnail || '/og-blog.jpg'],
      type: 'article',
      publishedTime: blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date(blog.createdAt).toISOString(),
      modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      authors: [blog?.author?.name || 'SARTHI Editorial'],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.ogTitle || pageTitle,
      description: blog.ogDescription || metaDesc,
      images: [blog.ogImage || blog.thumbnail || '/og-blog.jpg'],
    }
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogPost(slug);

  if (!blog && slug !== 'sample-blog') {
    return notFound();
  }

  let authorName = blog?.author?.name || 'SARTHI Editorial';
  let isMukul = false;
  if (blog) {
    const isOfficial = blog.adminNote === 'SARTHI_OFFICIAL';
    if (authorName.toLowerCase() === 'mukul pandey' || authorName.toLowerCase().includes('mukul pandey') || isOfficial) {
      authorName = 'Dr. Mukul Pandey';
      isMukul = true;
    }
  }

  const formattedBlog = blog ? {
    ...blog,
    author: {
      name: authorName,
      avatar: isMukul ? '/images/profiles/mukul-pandey.png' : (blog.author?.avatar_url || blog.author?.image || '/sarthi-logo.png'),
    },
    tags: blog.tags ? blog.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
  } : null;

  const relatedStories = blog ? await getRelatedStories(blog.category, blog.id) : [];

  const jsonLd = formattedBlog ? generateNewsArticleSchema({
    title: formattedBlog.title,
    excerpt: formattedBlog.excerpt,
    content: formattedBlog.content,
    slug: formattedBlog.slug,
    thumbnail: formattedBlog.thumbnail || undefined,
    publishedAt: formattedBlog.publishedAt || formattedBlog.createdAt,
    updatedAt: formattedBlog.updatedAt,
    category: formattedBlog.category,
    author: formattedBlog.author,
  }) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogDetailClient initialBlog={formattedBlog as any} relatedStories={relatedStories as any} />
    </>
  );
}

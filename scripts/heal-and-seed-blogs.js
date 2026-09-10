const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Reassign any orphaned blog posts to a valid admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.error("No administrative account found to bind blogs to!");
      return;
    }

    console.log(`Using admin user: ${admin.name} (${admin.id}) as fallback blog author.`);

    // Fetch all current blogs
    const currentBlogs = await prisma.blogPost.findMany({
      select: { id: true, authorId: true }
    });

    for (const blog of currentBlogs) {
      const userExists = await prisma.user.count({ where: { id: blog.authorId } });
      if (userExists === 0) {
        console.log(`Healed blog post ${blog.id}: Reassigned orphaned authorId ${blog.authorId} to admin ${admin.id}`);
        await prisma.blogPost.update({
          where: { id: blog.id },
          data: { authorId: admin.id }
        });
      }
    }

    // 2. Seed premium tech blog posts to make it active and lively!
    const blogsToSeed = [
      {
        slug: 'nextjs-15-deep-dive-performance',
        title: 'Next.js 15 Deep Dive: Optimizing Startup Performance',
        content: 'Next.js 15 introduces revolutionary changes in compilation speed, server-side caching defaults, and partial pre-rendering (PPR). In this deep dive, we explore how to configure your startups Next.js bundle for maximum performance, reducing Largest Contentful Paint (LCP) by up to 40% with smart component lazy-loading, optimized Google Font integration, and advanced Tailwind compilation switches.',
        excerpt: 'Explore the performance breakthroughs in Next.js 15, from compiler speedups to smart caching strategy defaults.',
        category: 'Development',
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=60',
        status: 'published',
        tags: 'Next.js, WebDev, JavaScript, Performance',
        readTime: 6,
        featured: true,
        publishedAt: new Date(),
        adminNote: 'SARTHI_OFFICIAL'
      },
      {
        slug: 'scaling-postgresql-database-resilience',
        title: 'Scaling PostgreSQL: Database Resilience at Startup Load',
        content: 'As a startup gains traction, database queries often become the primary bottleneck. We walk through advanced connection pooling, dynamic read-replicas configuration in Prisma, indexes optimization for high-write tables, and setting up automated pgBouncer pools to prevent transaction locking under peak loads.',
        excerpt: 'Step-by-step architectural guide to tuning PostgreSQL pools and indexing strategies for heavy startup traffic.',
        category: 'Database',
        thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60',
        status: 'published',
        tags: 'PostgreSQL, Database, Scaling, Prisma',
        readTime: 8,
        featured: false,
        publishedAt: new Date(),
        adminNote: 'SARTHI_OFFICIAL'
      },
      {
        slug: 'artificial-intelligence-curriculum-integration',
        title: 'Integrating Artificial Intelligence into Modern E-Learning Platforms',
        content: 'E-learning is undergoing a tectonic shift with custom LLM integrations. We examine how SARTHI is building personalized AI study assistants, dynamic curriculum generation models, and customized student learning paths using vector databases and automated retrieval-augmented generation (RAG) pipelines.',
        excerpt: 'How AI tutors and retrieval-augmented generation are redefining personalization in learning curriculum dashboards.',
        category: 'AI & ML',
        thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=60',
        status: 'published',
        tags: 'AI, Machine Learning, RAG, E-Learning',
        readTime: 5,
        featured: true,
        publishedAt: new Date(),
        adminNote: 'SARTHI_OFFICIAL'
      },
      {
        slug: 'building-secure-jwks-jwt-authentication',
        title: 'Building Secure JWKS & JWT Token Verification Systems',
        content: 'Security is paramount for any administrative dashboard ecosystem. In this guide, we analyze secure JSON Web Key Sets (JWKS) token validation strategies, session cookie rotation, rate-limiting malicious API routes, and designing absolute protection against cross-site scripting (XSS) in Next.js middleware.',
        excerpt: 'Deep-dive security overview on configuring token rotations, secure cookie scopes, and JWKS audits.',
        category: 'Security',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
        status: 'published',
        tags: 'Security, JWT, Authentication, OAuth',
        readTime: 7,
        featured: false,
        publishedAt: new Date(),
        adminNote: 'SARTHI_OFFICIAL'
      },
      {
        slug: 'ui-ux-design-system-tokens-stripe-notion',
        title: 'UI/UX Design Systems: Designing Premium Interfaces like Stripe',
        content: 'A stunning user interface is a competitive advantage. We dissect the design guidelines for modern dashboard consoles: rich HSL color palettes, responsive typography, subtle bouncing micro-animations, glassmorphic card overlays, and high-contrast, double-action command panels that keep administrators engaged.',
        excerpt: 'How to build curated HSL-tailored design systems, smooth CSS transitions, and glassmorphic card arrays.',
        category: 'UI/UX',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
        status: 'pending_review',
        tags: 'Design, UI/UX, CSS, Glassmorphic',
        readTime: 5,
        featured: false,
        publishedAt: new Date(),
        adminNote: ''
      }
    ];

    for (const blog of blogsToSeed) {
      // Avoid duplicate slug insert
      const exists = await prisma.blogPost.count({
        where: { slug: blog.slug }
      });

      if (exists === 0) {
        await prisma.blogPost.create({
          data: {
            ...blog,
            authorId: admin.id
          }
        });
        console.log(`Successfully seeded blog: ${blog.title}`);
      } else {
        console.log(`Blog with slug ${blog.slug} already exists. Skipping.`);
      }
    }

    console.log("Seeding and healing successfully finalized!");
  } catch (error) {
    console.error("Heal and Seed Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

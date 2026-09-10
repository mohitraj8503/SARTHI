import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { ArrowRight, Tag, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog Categories | SARTHI',
  description: 'Browse articles by topics, programming languages, software engineering tags, and technology stacks.',
};

export const dynamic = 'force-dynamic';

async function getCategoriesData() {
  return withResiliency(
    async () => {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { category: true }
      });

      const counts: Record<string, number> = {};
      posts.forEach(p => {
        const cat = p.category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
      });

      const categoriesList = Object.entries(counts).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count);

      return { categories: categoriesList };
    },
    'public-blogs-categories-list'
  );
}

export default async function CategoriesPage() {
  const res = await getCategoriesData();
  const data = res.data;

  if (!res.success || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C2E] mb-4">Temporarily Unavailable</h2>
        <p className="text-[#5D705C] max-w-md">We&apos;re updating our categories list. Please try again in a few minutes.</p>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = {
    'Creative Writing': '✍️',
    'Research and Development': '🔬',
    'Business Analysis': '📊',
    'Content Creation': '🎬',
    'Editor': '✂️',
    'Python': '🐍',
    'AI': '🤖',
    'Software Engineering': '💻',
    'Web Development': '🌐',
    'Default': '📁'
  };

  return (
    <div className="blogs-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .blogs-page-wrapper {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #FDFBF7;
          color: #1F2937;
          min-height: 120vh;
          position: relative;
          overflow-x: hidden;
        }

        .blogs-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .blogs-orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: blogs-orb-drift 20s infinite ease-in-out;
        }
        .orb-1 { width: 600px; height: 600px; background: #1B4332; top: -100px; right: -100px; }
        .orb-2 { width: 500px; height: 500px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes blogs-orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 30px) scale(0.95); }
        }

        .blogs-shell {
          position: relative; z-index: 10;
          max-width: 1600px; margin: 0 auto;
          padding: 10rem 2rem 25rem;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.625rem;
          padding: 0.75rem 1.25rem; background: rgba(27, 67, 50, 0.08);
          color: #1B4332; border-radius: 50px; font-weight: 700;
          font-size: 0.85rem; letter-spacing: 0.5px; margin-bottom: 2rem;
          text-transform: uppercase;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800;
          color: #1B4332; line-height: 1.1; letter-spacing: -1px;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.2rem; color: #6B7280; max-width: 600px;
          line-height: 1.6; margin-bottom: 4rem; opacity: 0.9;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .category-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 24px;
          padding: 2.5rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 200px;
          cursor: pointer;
        }

        .category-card:hover {
          transform: translateY(-8px);
          border-color: #1B4332;
          box-shadow: 0 20px 40px rgba(27, 67, 50, 0.05);
        }

        .category-emoji {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .category-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1B4332;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
        }

        .category-count {
          font-size: 0.85rem;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="blogs-orbs">
        <div className="blogs-orb orb-1"></div>
        <div className="blogs-orb orb-2"></div>
      </div>

      <main className="blogs-shell">
        <header className="hero-header">
          <div className="hero-badge">
            <Tag className="w-4 h-4" />
            <span>Archive Index</span>
          </div>
          <h1 className="hero-title">Browse by Category</h1>
          <p className="hero-subtitle">
            Navigate through our diverse tech disciplines, editorial sections, and engineering streams.
          </p>
        </header>

        <div className="categories-grid">
          {data.categories.map(cat => {
            const emoji = categoryEmoji[cat.name] || categoryEmoji[cat.name.split(' ')[0]] || categoryEmoji['Default'];
            return (
              <Link key={cat.name} href={`/blogs?category=${encodeURIComponent(cat.name)}`}>
                <div className="category-card group">
                  <div>
                    <div className="category-emoji">{emoji}</div>
                    <h3 className="category-name group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <span className="category-count">{cat.count} {cat.count === 1 ? 'Article' : 'Articles'}</span>
                    <ArrowRight className="w-5 h-5 text-[#1B4332] group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

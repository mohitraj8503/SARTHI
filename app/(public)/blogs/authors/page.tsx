import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { Users, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Featured Contributors | SARTHI',
  description: 'Meet the engineers, student builders, and technical mentors writing guides and articles for SARTHI.',
};

export const dynamic = 'force-dynamic';

async function getAuthorsData() {
  return withResiliency(
    async () => {
      const authors = await prisma.user.findMany({
        where: {
          blogPosts: {
            some: { status: 'published' }
          }
        },
        select: {
          id: true,
          name: true,
          avatar_url: true,
          image: true,
          blogTrustScore: true,
          _count: {
            select: {
              blogPosts: {
                where: { status: 'published' }
              }
            }
          }
        }
      });

      const formattedAuthors = authors.map(author => {
        let name = author.name || 'Anonymous Writer';
        return {
          id: author.id,
          name,
          avatar: author.avatar_url || author.image || '/sarthi-logo.png',
          trustScore: author.blogTrustScore || 0,
          postCount: author._count.blogPosts
        };
      }).sort((a, b) => b.postCount - a.postCount);

      return { authors: formattedAuthors };
    },
    'public-blogs-authors-list'
  );
}

export default async function AuthorsPage() {
  const res = await getAuthorsData();
  const data = res.data;

  if (!res.success || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#1A3C2E] mb-4">Temporarily Unavailable</h2>
        <p className="text-[#5D705C] max-w-md">We&apos;re updating our contributors list. Please try again in a few minutes.</p>
      </div>
    );
  }

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

        .authors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .author-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 28px;
          padding: 2rem;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .author-card:hover {
          transform: translateY(-6px);
          border-color: #1B4332;
          box-shadow: 0 20px 40px rgba(27, 67, 50, 0.05);
        }

        .author-avatar-wrapper {
          position: relative;
          width: 88px;
          height: 88px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 1.25rem;
          border: 3px solid #F3F4F6;
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .author-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1B4332;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
        }

        .author-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #10B981;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .author-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-t: 1px solid #F3F4F6;
          width: 100%;
          justify-content: center;
        }

        .meta-item {
          text-align: center;
        }

        .meta-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1B4332;
        }

        .meta-lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 0.15rem;
        }
      `}</style>

      <div className="blogs-orbs">
        <div className="blogs-orb orb-1"></div>
        <div className="blogs-orb orb-2"></div>
      </div>

      <main className="blogs-shell">
        <header className="hero-header">
          <div className="hero-badge">
            <Users className="w-4 h-4" />
            <span>SARTHI Guild</span>
          </div>
          <h1 className="hero-title">Meet our Authors</h1>
          <p className="hero-subtitle">
            Discover articles, tech briefs, and guides authored by contributors in the developer ecosystem.
          </p>
        </header>

        <div className="authors-grid">
          {data.authors.map(author => (
            <div key={author.id} className="author-card">
              <div className="author-avatar-wrapper">
                <Image 
                  src={author.avatar} 
                  alt={author.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <h3 className="author-name">{author.name}</h3>
              <p className="author-title">Contributor</p>
              
              <div className="author-meta">
                <div className="meta-item">
                  <div className="meta-val">{author.postCount}</div>
                  <div className="meta-lbl">Articles</div>
                </div>
                <div className="meta-item">
                  <div className="meta-val">{author.trustScore}</div>
                  <div className="meta-lbl">Trust Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

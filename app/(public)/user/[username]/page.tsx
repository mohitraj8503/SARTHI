import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  MapPin,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Award,
  BookOpen,
  Calendar,
  Mail,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

async function getUser(username: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    // Try finding by username or ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { id: username }],
      } as any, // Cast to any because TS might not see the new 'username' field yet
      include: {
        enrollments: {
          where: { status: 'active' },
          include: { course: true },
        },
        achievements: { include: { achievement: true } },
        certificates: { include: { course: true } },
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export async function generateMetadata(
  props: {
    params: Promise<{ username: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const user = await getUser(decodeURIComponent(params.username));
  if (!user) return { title: 'User Not Found' };

  return {
    title: `${user.name} | SARTHI`,
    description: user.bio || `Check out ${user.name}'s profile on SARTHI`,
    openGraph: {
      images: [user.image || '/og-default.png'],
    },
  };
}

export default async function PublicProfilePage(props: { params: Promise<{ username: string }> }) {
  const params = await props.params;
  const user = await getUser(decodeURIComponent(params.username));

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you&apos;re looking for doesn&apos;t exist or has a private profile.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Parse JSON fields safely
  const socialLinks =
    user.socialLinks && user.socialLinks !== 'null' ? JSON.parse(user.socialLinks) : {};
  const privacySettings =
    user.privacySettings && user.privacySettings !== 'null'
      ? JSON.parse(user.privacySettings)
      : {
        showEmail: false,
        showCourses: true,
        showBadges: true,
      };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Cover */}
      <div className="h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 md:p-10 pb-0 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-24 mb-4 md:mb-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-4xl font-bold">
                    {(user.name?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 pt-2 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                  <p className="text-lg text-indigo-600 font-medium">
                    {user.headline || user.company || 'Student'}
                  </p>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full text-sm transition-colors flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Profile
                </button>
              </div>

              {user.bio && <p className="text-gray-600 leading-relaxed max-w-2xl">{user.bio}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                {privacySettings.showEmail && user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(socialLinks.twitter ||
                socialLinks.github ||
                socialLinks.linkedin ||
                socialLinks.website) && (
                  <div className="flex gap-3 pt-2">
                    {socialLinks.website && (
                      <a
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.github && (
                      <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Stats Divider */}
          <div className="border-t border-gray-100 my-8 mx-8" />

          {/* Content Sections */}
          <div className="px-8 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Achievements/Badges */}
            <div className="lg:col-span-1 space-y-8">
              {privacySettings.showBadges && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> Achievements
                  </h3>
                  {user.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {user.achievements.map((ach: any) => (
                        <div
                          key={ach.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <div className="text-2xl">{ach.achievement.icon}</div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">
                              {ach.achievement.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {ach.achievement.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No badges earned yet.</p>
                  )}
                </section>
              )}

              {user.certificates.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Certificates
                  </h3>
                  <div className="space-y-3">
                    {user.certificates.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl"
                      >
                        <div className="text-sm font-bold text-indigo-900">{cert.course.title}</div>
                        <div className="text-xs text-indigo-600 mt-1">
                          Issued {new Date(cert.issuedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Courses */}
            <div className="lg:col-span-2">
              {privacySettings.showCourses && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" /> Courses Taken
                  </h3>
                  {user.enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.enrollments.map((enrollment: any) => (
                        <Link
                          href={`/courses/${enrollment.course.id}`}
                          key={enrollment.id}
                          className="group block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-blue-200"
                        >
                          <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            {enrollment.course.thumbnail ? (
                              <Image
                                src={enrollment.course.thumbnail}
                                alt=""
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {enrollment.course.title}
                          </h4>
                          <div className="text-xs text-gray-500 mt-2 flex justify-between">
                            <span>
                              {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                            {enrollment.progressPercentage > 0 && (
                              <span>{enrollment.progressPercentage}%</span>
                            )}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">No active courses visible.</p>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

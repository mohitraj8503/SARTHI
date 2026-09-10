import { PrismaClient } from '@prisma/client';
import { 
  MOCK_USERS, MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_BLOGS, createMockProxy, 
  MOCK_CERTIFICATIONS, MOCK_CERT_ATTEMPTS, MOCK_ISSUED_CERTIFICATES, MOCK_CERT_PAYMENTS,
  MOCK_MODULES, MOCK_LESSONS, MOCK_SYSTEM_COUNTERS, MOCK_PROGRESS, MOCK_TEACHERS,
  MOCK_INTERNSHIP_APPLICATIONS, MOCK_INTERNSHIP_BATCHES, MOCK_BATCH_MEMBERS
} from './mock-data';

const prismaClientSingleton = () => {
  const mode = process.env.DATABASE_MODE || 'remote';
  const appMode = process.env.APP_MODE || 'production';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  let dbUrl = process.env.DATABASE_URL;
  
  console.log(`[PRISMA_INIT] Mode: ${mode}, AppMode: ${appMode}, BuildPhase: ${isBuildPhase}`);
  console.log(`[PRISMA_INIT] DB_URL found: ${!!dbUrl}`);

  // Use mock mode ONLY if explicitly requested OR during build without DB
  const createMockClient = () => {
    console.log(`🧪 Using in-memory mock data client`);
    const mockClient = {
      $connect: async () => {},
      $disconnect: async () => {},
      $transaction: async (fn: any) => {
        if (typeof fn === 'function') return fn(mockClient);
        return fn;
      },
      $on: () => {},
      $use: () => {},
      $extends: () => mockClient,
    };

    return new Proxy(mockClient as any, {
      get: (target, prop: string) => {
        if (prop in target) return (target as any)[prop];
        
        // Mock specific models
        if (prop === 'user' || prop === 'users') return createMockProxy(MOCK_USERS);
        if (prop === 'course' || prop === 'courses') return createMockProxy(MOCK_COURSES);
        if (prop === 'enrollment' || prop === 'enrollments') return createMockProxy(MOCK_ENROLLMENTS);
        if (prop === 'module' || prop === 'modules') return createMockProxy(MOCK_MODULES);
        if (prop === 'lesson' || prop === 'lessons') return createMockProxy(MOCK_LESSONS);
        if (prop === 'systemCounter' || prop === 'systemCounters') return createMockProxy(MOCK_SYSTEM_COUNTERS);
        if (prop === 'progress' || prop === 'progresses') return createMockProxy(MOCK_PROGRESS);
        if (prop === 'blogPost' || prop === 'blogPosts') return createMockProxy(MOCK_BLOGS);
        if (prop === 'certification' || prop === 'certifications') return createMockProxy(MOCK_CERTIFICATIONS);
        if (prop === 'certificationAttempt' || prop === 'certificationAttempts') return createMockProxy(MOCK_CERT_ATTEMPTS);
        if (prop === 'issuedCertificate' || prop === 'issuedCertificates') return createMockProxy(MOCK_ISSUED_CERTIFICATES);
        if (prop === 'certificationPayment' || prop === 'certificationPayments') return createMockProxy(MOCK_CERT_PAYMENTS);
        if (prop === 'internshipApplication' || prop === 'internshipApplications') return createMockProxy(MOCK_INTERNSHIP_APPLICATIONS);
        if (prop === 'internshipBatch' || prop === 'internshipBatches') return createMockProxy(MOCK_INTERNSHIP_BATCHES);
        if (prop === 'batchMember' || prop === 'batchMembers') return createMockProxy(MOCK_BATCH_MEMBERS);
        if (prop === 'teacher' || prop === 'teachers') {
          const baseProxy = createMockProxy(MOCK_TEACHERS);
          return {
            ...baseProxy,
            findUnique: async (args: any) => {
              const userId = args?.where?.userId;
              if (userId) {
                const existing = MOCK_TEACHERS.find(t => t.userId === userId);
                if (!existing) {
                  const newTeacher = {
                    id: `teacher_${userId}`,
                    userId,
                    title: 'Expert Instructor',
                    status: 'APPROVED',
                    canCreateCourses: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  MOCK_TEACHERS.push(newTeacher);
                }
              }
              return baseProxy.findUnique(args);
            },
            findFirst: async (args: any) => {
              const userId = args?.where?.userId;
              if (userId) {
                const existing = MOCK_TEACHERS.find(t => t.userId === userId);
                if (!existing) {
                  const newTeacher = {
                    id: `teacher_${userId}`,
                    userId,
                    title: 'Expert Instructor',
                    status: 'APPROVED',
                    canCreateCourses: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  MOCK_TEACHERS.push(newTeacher);
                }
              }
              return baseProxy.findFirst(args);
            }
          };
        }
        
        // Handle common Prisma internal/metadata props
        if (prop.startsWith('$') || prop === 'then' || prop === 'constructor') {
          return undefined;
        }

        // Fallback for other models - return a generic empty proxy
        return createMockProxy([]);
      }
    }) as PrismaClient;
  };

  const hasPlaceholderDb = !dbUrl || dbUrl.includes('[YOUR-PASSWORD]');

  // Use mock mode ONLY if explicitly requested OR during build without DB OR placeholder DB URL
  if (mode === 'mock' || (isBuildPhase && !dbUrl) || hasPlaceholderDb) {
    if (hasPlaceholderDb && mode !== 'mock') {
      console.log(`🧪 DATABASE_URL contains placeholder password or is missing - Using mock client`);
    }
    return createMockClient();
  }

  if (mode === 'local') {
    console.log('🏠 DATABASE_MODE="local" - Connecting to local database');
    dbUrl = process.env.DATABASE_URL || '';
  }

  if (!dbUrl) {
    console.warn('⚠️ DATABASE_URL is missing but mode is not mock. Next.js might fail during build if courses are fetched statically.');
  }

  try {
    const configuredDbUrl = dbUrl
      ? (() => {
          const url = new URL(dbUrl);
          url.searchParams.set(
            'connection_limit',
            process.env.DB_CONNECTION_LIMIT || url.searchParams.get('connection_limit') || '10'
          );
          url.searchParams.set(
            'pool_timeout',
            process.env.DB_POOL_TIMEOUT || url.searchParams.get('pool_timeout') || '30'
          );
          url.searchParams.set(
            'connect_timeout',
            process.env.DB_CONNECT_TIMEOUT || url.searchParams.get('connect_timeout') || '30'
          );
          return url.toString();
        })()
      : undefined;

    return new PrismaClient({
      datasources: configuredDbUrl ? {
        db: { url: configuredDbUrl }
      } : undefined,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.warn('⚠️ PrismaClient instantiation failed, falling back to mock client:', error);
    return createMockClient();
  }
};

const globalForPrisma = global;
const basePrisma = globalForPrisma.prisma || prismaClientSingleton();

// Proxy handler to map 'user' and 'users' property accesses dynamically
export const prisma = new Proxy(basePrisma, {
  get: (target, prop) => {
    if (prop === 'user' || prop === 'users') {
      return (target as any).user || (target as any).users;
    }
    const val = (target as any)[prop];
    if (typeof val === 'function') {
      return val.bind(target);
    }
    return val;
  }
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

// Ensure graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    try {
      if (process.env.DATABASE_MODE !== 'mock') {
        await prisma.$disconnect();
      }
    } catch (e) {
      console.error('Error during Prisma disconnect:', e);
    }
  });
}

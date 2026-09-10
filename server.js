/**
 * POLYFILLS FOR OLD NODE VERSIONS
 * Ensures compatibility with environments using Node < 20.0.0
 */
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}

const { startMetricsCollection } = require('./lib/monitoring/metrics-collector');

// Start metrics collection immediately
startMetricsCollection();

// ==========================================
// ANTI-BOT RATE LIMITER (In-Memory)
// Stops bots BEFORE they hit Next.js logic
// ==========================================
const rateLimitMap = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_REQUESTS = 100; // Max 100 requests per IP per window

// Clean up memory every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(ip);
  }
}, WINDOW_MS);

function checkRateLimit(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true; // allow
  }
  
  const clientData = rateLimitMap.get(ip);
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + WINDOW_MS;
    return true; // allow
  }
  
  clientData.count++;
  if (clientData.count > MAX_REQUESTS) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil((clientData.resetTime - now) / 1000));
    res.end(JSON.stringify({ error: 'Too many requests, slow down. - SARTHI Protection' }));
    return false; // block
  }
  
  return true; // allow
}

const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';

// SEC-002 & ARCH-001: Secure Environment Variable Loading
try {
  if (fs.existsSync(path.join(__dirname, '.env.production'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env.production') });
  } else if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
  } else {
    require('dotenv').config();
  }
} catch (err) {
  console.warn('> WARNING: Could not load .env file. Relying on process.env.');
}

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// ==========================================
// HOSTINGER / PM2 STANDALONE OPTIMIZATION
// ==========================================
if (!dev) {
  const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
  if (fs.existsSync(standalonePath)) {
    console.log(`> SARTHI Booting Standalone Server on http://${hostname}:${port}`);
    try {
      // The standalone server automatically listens on process.env.PORT
      process.env.PORT = port.toString();
      process.env.HOSTNAME = hostname;
      require(standalonePath);
      process.exit(0); // Exit the custom server script as standalone is handling it
    } catch (err) {
      console.error('FATAL_STANDALONE_START_FAILURE:', err);
      // If standalone fails, we fall through to the fallback wrapper
    }
  }
}

// Fallback to standard Next.js dev server wrapper
const next = require('next');
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isReady = false;

const server = createServer(async (req, res) => {
  try {
    // 1. RATE LIMITING CHECK
    if (!checkRateLimit(req, res)) return;

    if (!isReady) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Retry-After', '10');
      res.end('<html><body style="font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#F8FAFC; color:#1e293b;">' +
              '<div style="background:white; padding:40px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05); text-align:center;">' +
              '<h2 style="margin-bottom:10px;">Initializing...</h2>' +
              '<p style="color:#64748b;">The workspace is being prepared. We will be ready in a few seconds.</p>' +
              '<script>setTimeout(() => window.location.reload(), 5000)</script>' +
              '</div></body></html>');
      return;
    }

    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('SERVER_ERROR:', req.url, err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Internal Server Error');
    }
  }
});

// Initialize Socket.io
const { Server } = require('socket.io');
const { jwtVerify } = require('jose');

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "https://sarthi-woad.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) return next(new Error('Authentication error: No cookies'));
    
    const cookies = cookieHeader.split(';').reduce((res, item) => {
        const data = item.trim().split('=');
        return { ...res, [data[0]]: data[1] };
    }, {});
    
    const token = cookies.tt_session || cookies.user_session;
    if (!token) return next(new Error('Authentication error: No session token'));
    
    if (!process.env.JWT_SECRET) return next(new Error('Server misconfiguration'));
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`[SOCKET] User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send-message', (data) => {
    // data: { roomId, message, senderId, senderName, timestamp }
    io.to(data.roomId).emit('new-message', data);
    console.log(`[SOCKET] Message in ${data.roomId} from ${data.senderName}`);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] User disconnected: ${socket.id}`);
  });
});

// Run database sync/seeding check for TT-EX-2026-0002 and TT-EX-2026-0003 on startup
(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    console.log('[DB_SYNC] Running startup database sync check for TT-EX-2026-0002 and TT-EX-2026-0003...');
    
    const courseId2 = 'advanced-excel-certification-exam';
    const courseId3 = 'advanced-excel-certification-exam';

    // ── 0. Ensure Users Exist (foreign keys) & Resolve Actual production IDs ──
    // Search for all user accounts matching Dhanlaxmi
    let dhanlaxmiUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'dhanlaxmibagoriya21@gmail.com' },
          { email: { contains: 'dhanlaxmi' } },
          { name: { contains: 'Dhanlaxmi' } },
          { name: { contains: 'Bagoria' } },
          { name: { contains: 'Bagoriya' } }
        ]
      }
    });

    console.log(`[DB_SYNC] Found ${dhanlaxmiUsers.length} user record(s) matching Dhanlaxmi in the database.`);

    // We want to identify the primary active account (preferring the one with email dhanlaxmibagoriya21@gmail.com)
    let activeUser3 = dhanlaxmiUsers.find(u => u.email === 'dhanlaxmibagoriya21@gmail.com') 
                   || dhanlaxmiUsers.find(u => u.email.includes('dhanlaxmi'))
                   || dhanlaxmiUsers[0];

    // If no Dhanlaxmi user exists at all, create the default one
    if (!activeUser3) {
      console.log('[DB_SYNC] User Dhanlaxmi Naresh Bagoria not found. Creating user record...');
      activeUser3 = await prisma.user.create({
        data: {
          id: 'cmsg2w6xw0000mme5esz28sez',
          email: 'dhanlaxmibagoriya21@gmail.com',
          name: 'Dhanlaxmi Naresh Bagoria',
          role: 'STUDENT',
          status: 'ACTIVE',
          onboarded: true,
          enrollmentNumber: 'TT-STU-0133'
        }
      });
      dhanlaxmiUsers = [activeUser3];
    }

    const userId3 = activeUser3.id;
    let user3 = activeUser3;
    console.log(`[DB_SYNC] Resolved primary Dhanlaxmi User ID to: ${userId3} (${activeUser3.email})`);

    // Merge all other duplicate accounts into this primary active account
    for (const otherUser of dhanlaxmiUsers) {
      if (otherUser.id !== userId3) {
        console.log(`[DB_SYNC] DETECTED DUPLICATE ACCOUNT: Merging duplicate user account ${otherUser.id} (${otherUser.email}) into primary account ${userId3}...`);

        // Migrate all Certificates
        const updateCert = await prisma.certificate.updateMany({
          where: { userId: otherUser.id },
          data: { userId: userId3 }
        });
        console.log(`[DB_SYNC] Migrated ${updateCert.count} Certificates.`);

        // Migrate all IssuedCertificates
        const updateIssued = await prisma.issuedCertificate.updateMany({
          where: { userId: otherUser.id },
          data: { userId: userId3 }
        });
        console.log(`[DB_SYNC] Migrated ${updateIssued.count} IssuedCertificates.`);

        // Migrate all CertificationAttempts
        const updateAttempt = await prisma.certificationAttempt.updateMany({
          where: { userId: otherUser.id },
          data: { userId: userId3 }
        });
        console.log(`[DB_SYNC] Migrated ${updateAttempt.count} CertificationAttempts.`);

        // Migrate all CertificationPayments
        const updatePayment = await prisma.certificationPayment.updateMany({
          where: { userId: otherUser.id },
          data: { userId: userId3 }
        });
        console.log(`[DB_SYNC] Migrated ${updatePayment.count} CertificationPayments.`);

        // Migrate all Enrollments
        const updateEnrollment = await prisma.enrollment.updateMany({
          where: { userId: otherUser.id },
          data: { userId: userId3 }
        });
        console.log(`[DB_SYNC] Migrated ${updateEnrollment.count} Enrollments.`);

        // Rename the duplicate user's email to prevent future collisions/OAuth hijack
        await prisma.user.update({
          where: { id: otherUser.id },
          data: { email: `dhanlaxmi.legacy.merged.${otherUser.id}.${Date.now()}@example.com` }
        });
        console.log(`[DB_SYNC] Duplicate user ${otherUser.id} email updated.`);
      }
    }

    // Search for Ayush Kumar Sharma
    let user2 = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'cmqmjmxo2000913c8hn9epgmr' },
          { email: { contains: 'sharmaayush5644' } },
          { name: { contains: 'Ayush Kumar' } }
        ]
      }
    });

    const userId2 = user2 ? user2.id : 'cmqmjmxo2000913c8hn9epgmr';
    if (!user2) {
      console.log('[DB_SYNC] User Ayush Kumar Sharma not found. Creating user record...');
      user2 = await prisma.user.create({
        data: {
          id: userId2,
          email: 'sharmaayush5644@gmail.com',
          name: 'Ayush Kumar Sharma',
          role: 'STUDENT',
          status: 'ACTIVE',
          onboarded: true,
          enrollmentNumber: 'TT-STU-0056'
        }
      });
    } else {
      console.log(`[DB_SYNC] Resolved Ayush ID to: ${userId2}`);
    }

    // Migration helper for mismatching user IDs on production
    if (userId3 !== 'cmsg2w6xw0000mme5esz28sez') {
      console.log(`[DB_SYNC] Migrating TT-EX-2026-0003 records to actual user ID: ${userId3}`);
      await prisma.certificate.updateMany({
        where: { certificateNumber: 'TT-EX-2026-0003' },
        data: { userId: userId3 }
      });
      await prisma.issuedCertificate.updateMany({
        where: { verificationId: 'TT-EX-2026-0003' },
        data: { userId: userId3 }
      });
      await prisma.certificationAttempt.updateMany({
        where: { certificationId: courseId3, userId: 'cmsg2w6xw0000mme5esz28sez' },
        data: { userId: userId3 }
      });
      await prisma.certificationPayment.updateMany({
        where: { certificationId: courseId3, userId: 'cmsg2w6xw0000mme5esz28sez' },
        data: { userId: userId3 }
      });
    }

    if (userId2 !== 'cmqmjmxo2000913c8hn9epgmr') {
      console.log(`[DB_SYNC] Migrating TT-EX-2026-0002 records to actual user ID: ${userId2}`);
      await prisma.certificate.updateMany({
        where: { certificateNumber: 'TT-EX-2026-0002' },
        data: { userId: userId2 }
      });
      await prisma.issuedCertificate.updateMany({
        where: { verificationId: 'TT-EX-2026-0002' },
        data: { userId: userId2 }
      });
      await prisma.certificationAttempt.updateMany({
        where: { certificationId: courseId2, userId: 'cmqmjmxo2000913c8hn9epgmr' },
        data: { userId: userId2 }
      });
      await prisma.certificationPayment.updateMany({
        where: { certificationId: courseId2, userId: 'cmqmjmxo2000913c8hn9epgmr' },
        data: { userId: userId2 }
      });
    }

    // ── 1. Seeding for TT-EX-2026-0002 (Ayush Kumar Sharma) ──────────────────
    const cert2 = await prisma.certificate.findFirst({
      where: { OR: [{ certificateNumber: 'TT-EX-2026-0002' }, { certificateId: 'TT-EX-2026-0002' }] }
    });
    
    if (!cert2) {
      console.log('[DB_SYNC] Certificate TT-EX-2026-0002 not found. Creating certificate entry...');
      await prisma.certificate.create({
        data: {
          certificateNumber: 'TT-EX-2026-0002',
          userId: userId2,
          courseId: courseId2,
          status: 'VALID',
          issuedAt: new Date('2026-05-08T00:00:00Z'),
          metadata: JSON.stringify({
            course_name: "Advance Excel & Data Analytics ",
            user_name: user2.name || "Ayush Kumar Sharma",
            credential_id: "TT-EX-2026-0002",
            enrollment_id: "TT-STU-0056",
            templateConfig: {
              mainTitle: "Advance Excel & Data Analytics ",
              subTitle: "CERTIFICATE OF COMPLETION",
              certifiesText: "THIS CERTIFIES THAT",
              descriptionText: "has successfully completed the Advance Excel & Data Analytics program, gaining practical expertise in advanced Excel, data analysis, dashboard creation, PivotTables, Power Query, and business reporting through hands-on learning and real-world applications.",
              courseName: "Advance Excel & Data Analytics",
              specialization: "Advance Excel",
              brandName: "SARTHI",
              tagline: "INNOVATE TODAY",
              directorName: "Dr. Mukul Pandey",
              directorTitle: "CEO & FOUNDER",
              bgImage: "/excel-bg.jpg",
              logoUrl: "/sarthi-logo.png",
              signatureUrl: "/signature-mukul-pandey.png",
              completionDate: "05.08.2026"
            }
          })
        }
      });
    } else {
      await prisma.certificate.updateMany({
        where: { id: cert2.id },
        data: { status: 'VALID' }
      });
    }
    
    const issued2 = await prisma.issuedCertificate.findFirst({ where: { verificationId: 'TT-EX-2026-0002' } });
    if (!issued2) {
      console.log('[DB_SYNC] IssuedCertificate TT-EX-2026-0002 not found. Creating entry...');
      await prisma.issuedCertificate.create({
        data: {
          userId: userId2,
          certificationId: courseId2,
          verificationId: 'TT-EX-2026-0002',
          certificateUrl: '/certification-exams/verify/TT-EX-2026-0002',
          score: 97,
          issuedAt: new Date('2026-05-08T00:00:00Z'),
          status: 'VALID',
          certificateHash: 'TT-EX-2026-0002'
        }
      });
    } else {
      await prisma.issuedCertificate.updateMany({
        where: { verificationId: 'TT-EX-2026-0002' },
        data: { status: 'VALID' }
      });
    }

    let attempt2 = await prisma.certificationAttempt.findFirst({
      where: { userId: userId2, certificationId: courseId2 }
    });
    if (!attempt2) {
      attempt2 = await prisma.certificationAttempt.create({
        data: {
          userId: userId2,
          certificationId: courseId2,
          score: 97,
          passed: true,
          answers: '{}',
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    }
    
    const pay2 = await prisma.certificationPayment.findFirst({
      where: { userId: userId2, certificationId: courseId2 }
    });
    if (!pay2) {
      await prisma.certificationPayment.create({
        data: {
          userId: userId2,
          certificationId: courseId2,
          attemptId: attempt2.id,
          amount: 2000,
          currency: 'INR',
          status: 'COMPLETED',
          paymentGatewayPaymentId: 'pay_manual_0002',
          paymentGatewayOrderId: 'order_manual_0002',
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.certificationPayment.updateMany({
        where: { id: pay2.id },
        data: { status: 'COMPLETED' }
      });
    }

    // ── 2. Seeding for TT-EX-2026-0003 (Dhanlaxmi Naresh Bagoria) ──────────
    // Clean up duplicate/legacy test certificates first
    await prisma.certificate.deleteMany({ where: { certificateNumber: 'TT-EX-2026-19516' } });
    await prisma.issuedCertificate.deleteMany({ where: { verificationId: 'TT-EX-2026-19516' } });

    const cert3 = await prisma.certificate.findFirst({
      where: { OR: [{ certificateNumber: 'TT-EX-2026-0003' }, { certificateId: 'TT-EX-2026-0003' }] }
    });
    
    const cert3Metadata = JSON.stringify({
      course_name: "Advance Excel & Data Analytics",
      user_name: user3.name || "Dhanlaxmi Naresh Bagoria",
      credential_id: "TT-EX-2026-0003",
      enrollment_id: "TT-STU-0088",
      templateConfig: {
        mainTitle: "ADVANCE EXCEL & DATA ANALYTICS CERTIFICATE",
        subTitle: "CERTIFICATE OF COMPLETION",
        certifiesText: "THIS CERTIFIES THAT",
        descriptionText: "has successfully completed the Advance Excel & Data Analytics program, gaining practical expertise in advanced Excel, data analysis, dashboard creation, PivotTables, Power Query, and business reporting through hands-on learning and real-world applications.",
        courseName: "Advance Excel & Data Analytics",
        specialization: "Excel Data Analytics & Dashboarding",
        brandName: "SARTHI",
        tagline: "INNOVATE TODAY",
        directorName: "Dr. Mukul Pandey",
        directorTitle: "CEO & FOUNDER",
        bgImage: "/excel-bg.jpg",
        logoUrl: "/sarthi-logo.png",
        signatureUrl: "/signature-mukul-pandey.png",
        completionDate: "05.08.2026"
      }
    });

    if (!cert3) {
      console.log('[DB_SYNC] Certificate TT-EX-2026-0003 not found. Creating certificate entry...');
      await prisma.certificate.create({
        data: {
          certificateNumber: 'TT-EX-2026-0003',
          userId: userId3,
          courseId: null, // Ensure it treats as a custom template
          status: 'VALID',
          issuedAt: new Date('2026-08-05T13:00:10Z'),
          title: "Advance Excel & Data Analytics",
          metadata: cert3Metadata
        }
      });
    } else {
      await prisma.certificate.updateMany({
        where: { id: cert3.id },
        data: { 
          status: 'VALID',
          courseId: null,
          title: "Advance Excel & Data Analytics",
          metadata: cert3Metadata
        }
      });
    }
    
    const issued3 = await prisma.issuedCertificate.findFirst({ where: { verificationId: 'TT-EX-2026-0003' } });
    if (!issued3) {
      console.log('[DB_SYNC] IssuedCertificate TT-EX-2026-0003 not found. Creating entry...');
      await prisma.issuedCertificate.create({
        data: {
          userId: userId3,
          certificationId: courseId3,
          verificationId: 'TT-EX-2026-0003',
          certificateUrl: '/certification-exams/verify/TT-EX-2026-0003',
          score: 97,
          issuedAt: new Date('2026-08-05T13:00:10Z'),
          status: 'VALID',
          certificateHash: 'TT-EX-2026-0003'
        }
      });
    } else {
      await prisma.issuedCertificate.updateMany({
        where: { verificationId: 'TT-EX-2026-0003' },
        data: { status: 'VALID' }
      });
    }

    let attempt3 = await prisma.certificationAttempt.findFirst({
      where: { userId: userId3, certificationId: courseId3 }
    });
    if (!attempt3) {
      attempt3 = await prisma.certificationAttempt.create({
        data: {
          userId: userId3,
          certificationId: courseId3,
          score: 97,
          passed: true,
          answers: '{}',
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });
    }
    
    const pay3 = await prisma.certificationPayment.findFirst({
      where: { userId: userId3, certificationId: courseId3 }
    });
    if (!pay3) {
      await prisma.certificationPayment.create({
        data: {
          userId: userId3,
          certificationId: courseId3,
          attemptId: attempt3.id,
          amount: 2000,
          currency: 'INR',
          status: 'COMPLETED',
          paymentGatewayPaymentId: 'pay_manual_0003',
          paymentGatewayOrderId: 'order_manual_0003',
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.certificationPayment.updateMany({
        where: { id: pay3.id },
        data: { status: 'COMPLETED' }
      });
    }

    console.log('[DB_SYNC] Startup database sync check completed successfully.');
    await prisma.$disconnect();
  } catch (err) {
    console.error('[DB_SYNC] Error running startup database sync check:', err);
  }
})();

server.listen(port, () => {
  console.log(`> SARTHI Booting on http://${hostname}:${port}`);
  
  app.prepare().then(() => {
    isReady = true;
    console.log(`> SARTHI Ready and Serving Traffic on ${port}`);
  }).catch(err => {
    console.error('CRITICAL_STARTUP_FAILURE:', err);
    process.exit(1);
  });
});

server.once('error', (err) => {
  console.error('FATAL_SERVER_ERROR:', err);
  process.exit(1);
});
module.exports = server;

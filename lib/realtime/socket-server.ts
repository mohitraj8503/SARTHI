import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { eventBus, RealtimeEvent } from './event-bus';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { AnomalyDetector } from '@/lib/monitoring/anomaly-detector';
import { IncidentResponseSystem } from '@/lib/monitoring/incident-response';

let io: SocketIOServer | null = null;
const isProd = process.env.NODE_ENV === 'production';

function getAllowedSocketOrigins(): string[] {
  const configuredOrigins = (process.env.NEXT_PUBLIC_APP_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaults = ['https://sarthi-woad.vercel.app', 'https://www.sarthi-woad.vercel.app'];
  if (!isProd) defaults.push('http://localhost:3000');

  return [...new Set([...configuredOrigins, ...defaults])];
}

function redactUserId(userId?: string): string {
  if (!userId) return 'unknown';
  if (userId.length <= 6) return '***';
  return `${userId.slice(0, 3)}***${userId.slice(-2)}`;
}

function redactIp(ip?: string): string {
  if (!ip) return 'unknown';
  if (!ip.includes('.')) return '***';
  const parts = ip.split('.');
  if (parts.length !== 4) return '***';
  return `${parts[0]}.${parts[1]}.*.*`;
}

function logSocketDebug(message: string) {
  if (!isProd) {
    console.log(message);
  }
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userData?: Record<string, unknown>;
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const pairs = cookieHeader.split(';');
  const cookies: Record<string, string> = {};
  for (const pair of pairs) {
    const index = pair.indexOf('=');
    if (index === -1) continue;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!key) continue;
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

/**
 * Get session from JWT cookie and validate against DB
 */
async function getSessionFromSocket(socket: Socket) {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const parsed = parseCookies(cookieHeader);
    const token = parsed['tt_session'];
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload?.sessionId) return null;

    const session = await validateSession(payload.sessionId);
    if (!session) return null;

    return {
      id: session.id,
      userId: session.userId,
      role: session.user?.role || payload.role,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error('[Socket] Session parse error:', error);
    return null;
  }
}

/**
 * Initialize Socket.IO server with production-grade features:
 * - Session-based authentication (matching existing auth pattern)
 * - Room isolation (students only receive their own updates)
 * - Transport fallback (websocket → polling)
 * - Connection monitoring
 */
export const initSocketServer = (server: HttpServer): SocketIOServer => {
  if (io) return io;
  const allowedOrigins = getAllowedSocketOrigins();

  io = new SocketIOServer(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('CORS origin not allowed'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Enable transport fallback for networks that block websockets
    transports: ['websocket', 'polling'],
    // Connection settings
    pingInterval: 25000,
    pingTimeout: 20000,
    connectTimeout: 10000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Get session from cookie (matching existing auth pattern)
      const session = await getSessionFromSocket(socket);

      if (!session?.userId) {
        if (isProd) {
          console.warn('[Socket] Unauthorized connection attempt');
        } else {
          console.warn(`[Socket] Unauthorized connection attempt from ${redactIp(socket.handshake.address)}`);
        }
        return next(new Error('Unauthorized'));
      }

      // Attach user info to socket
      socket.userId = session.userId;
      socket.userRole = (session.role || 'student').toString();
      socket.userData = {
        id: session.userId,
        role: session.role || 'student',
        email: session.email,
        name: session.name,
      };

      logSocketDebug(`[Socket] User ${redactUserId(socket.userId)} authenticated as ${socket.userRole}`);
      next();
    } catch (error) {
      console.error('[Socket] Auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const { userId, userRole } = socket;

    logSocketDebug(`[Socket] Client connected: ${redactUserId(userId)} (${userRole})`);

    // Join user-specific room for targeted updates
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(`student:${userId}`);
    }

    // Join role-based rooms for broadcasts
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      socket.join('admin_dashboard');
      socket.join('role:admin');
    }

    // Join course-specific rooms for synchronization
    const joinCourseRooms = async () => {
      try {
        if (userRole === 'INSTRUCTOR' || userRole === 'TEACHER') {
          socket.join('role:teacher');
          // Join rooms for courses they teach
          const teachingCourses = await prisma.course.findMany({
            where: { instructorId: userId },
            select: { id: true }
          });
          teachingCourses.forEach(c => socket.join(`course:${c.id}`));
          logSocketDebug(`[Socket] Teacher ${redactUserId(userId)} joined ${teachingCourses.length} course rooms`);
        } else {
          socket.join('role:student');
          // Join rooms for courses they are enrolled in
          const enrollments = await prisma.enrollment.findMany({
            where: { userId: userId, status: 'active' },
            select: { courseId: true }
          });
          enrollments.forEach(e => socket.join(`course:${e.courseId}`));
          logSocketDebug(`[Socket] Student ${redactUserId(userId)} joined ${enrollments.length} course rooms`);
        }
      } catch (e) {
        console.error('[Socket] Failed to join course rooms:', e);
      }
    };

    joinCourseRooms();

    // Handle room-specific subscriptions with admission control
    socket.on('subscribe', (room: string) => {
      const roomClients = io?.sockets.adapter.rooms.get(room);
      const clientCount = roomClients ? roomClients.size : 0;
      const MAX_ROOM_CAPACITY = 100; // Standard room limit

      // Priority access for teachers/admins
      const isPriorityUser = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'TEACHER' || userRole === 'INSTRUCTOR';

      if (clientCount >= MAX_ROOM_CAPACITY && !isPriorityUser) {
        socket.emit('subscription_error', { 
          room, 
          error: 'ROOM_FULL', 
          message: 'This classroom is currently at full capacity.' 
        });
        logSocketDebug(`[Socket] Subscription denied (Room Full): ${room} for ${redactUserId(userId)}`);
        return;
      }

      socket.join(room);
      logSocketDebug(`[Socket] User ${redactUserId(userId)} subscribed to: ${room} (${clientCount + 1}/${MAX_ROOM_CAPACITY})`);
    });

    socket.on('unsubscribe', (room: string) => {
      socket.leave(room);
      logSocketDebug(`[Socket] User ${redactUserId(userId)} unsubscribed from: ${room}`);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logSocketDebug(`[Socket] Client disconnected: ${redactUserId(userId)} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[Socket] Socket error for user ${redactUserId(userId)}:`, error);
    });
  });

  // Bridge Event Bus to Socket.io
  eventBus.on('db_change', (event: RealtimeEvent) => {
    if (!io) return;

    logSocketDebug(`[Socket] Broadcasting event: ${event.type}`);

    // 1. Always send to Admin dashboard
    io.to('admin_dashboard').emit('sync_event', event);

    // 2. Send to role-based rooms
    if (event.metadata?.actorId) {
      // For role-based broadcasts, we could use a separate event type
    }

    // 3. Targeted user rooms (if applicable)
    // For course enrollment changes, notify the specific student
    if (event.payload.entity === 'enrollment' && event.payload.after?.studentId) {
      io.to(`user:${event.payload.after.studentId}`).emit('sync_event', event);
    }

    // 4. Course-specific broadcasts
    if (event.payload.entity === 'announcement' && event.payload.after?.courseId) {
      io.to(`course:${event.payload.after.courseId}`).emit('sync_event', event);
      io.to(`course:${event.payload.after.courseId}`).emit('notification:new', {
        title: 'New Announcement',
        body: event.payload.after.title,
        type: 'ANNOUNCEMENT',
        href: `/courses/${event.payload.after.courseId}/announcements`
      });
    }

    if (event.payload.entity === 'live_session' && event.payload.after?.courseId) {
      io.to(`course:${event.payload.after.courseId}`).emit('sync_event', event);
      
      const classroomType = event.type;
      if (classroomType === 'class.live') {
        io.to(`course:${event.payload.after.courseId}`).emit('notification:new', {
          title: '🔴 LIVE NOW',
          body: `Your class for ${event.payload.after.lessonTitle || 'the current course'} has started.`,
          type: 'LIVE_CLASS',
          href: `/join/${event.payload.after.roomName}`,
          urgent: true
        });

        // ── Anomaly Scanner: 10 min after class starts ───────────
        if (event.payload.id) {
          setTimeout(async () => {
            try {
              const anomalies = await AnomalyDetector.analyzeSession(event.payload.id);
              if (anomalies.length > 0) {
                AnomalyDetector.emitToAdmins(anomalies);
                IncidentResponseSystem.fromAnomalies(anomalies as any);
                logSocketDebug(`[Anomaly] ${anomalies.length} anomaly(ies) found in session ${event.payload.id}`);
              }
            } catch (e) {
              console.error('[Anomaly Scan Error]', e);
            }
          }, 10 * 60 * 1000); // Run after 10 minutes
        }
      }

      if (classroomType === 'class.ended') {
        io.to(`course:${event.payload.after.courseId}`).emit('class:ended', {
          lessonId: event.payload.id
        });
      }
    }

    if (event.payload.entity === 'assignment' && event.payload.after?.courseId) {
      io.to(`course:${event.payload.after.courseId}`).emit('sync_event', event);
    }

    // 5. Specific entity rooms
    io.to(`${event.payload.entity}:${event.payload.id}`).emit('sync_event', event);
  });

  logSocketDebug('[Socket] Production Socket.IO server initialized');
  return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): SocketIOServer | null => io;

/**
 * Emit dashboard update to specific user
 */
export const emitDashboardUpdate = (userId: string, payload: unknown): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit('dashboard:update', payload);
  logSocketDebug(`[Socket] Dashboard update sent to user ${redactUserId(userId)}`);
};

/**
 * Emit real-time notification to specific user
 */
export const emitNotification = (userId: string, notification: unknown): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit('notification:new', notification);
  logSocketDebug(`[Socket] Notification sent to user ${redactUserId(userId)}`);
};

/**
 * Broadcast to all students
 */
export const broadcastToStudents = (event: string, data: unknown): void => {
  if (!io) return;
  io.to('role:student').emit(event, data);
  logSocketDebug(`[Socket] Broadcast to all students: ${event}`);
};

/**
 * Broadcast to all teachers
 */
export const broadcastToTeachers = (event: string, data: unknown): void => {
  if (!io) return;
  io.to('role:teacher').emit(event, data);
  logSocketDebug(`[Socket] Broadcast to all teachers: ${event}`);
};

/**
 * Broadcast to all admins
 */
export const broadcastToAdmins = (event: string, data: unknown): void => {
  if (!io) return;
  io.to('role:admin').emit(event, data);
  logSocketDebug(`[Socket] Broadcast to all admins: ${event}`);
};

/**
 * Get socket connection statistics
 */
export const getSocketStats = (): { connectedClients: number; rooms: string[] } | null => {
  if (!io) return null;
  return {
    connectedClients: io.engine.clientsCount,
    rooms: Array.from(io.sockets.adapter.rooms.keys()).filter((r) => !r.startsWith('socket_')),
  };
};

const socketService = {
  init: initSocketServer,
  get: getIO,
  emitUpdate: emitDashboardUpdate,
  broadcastStudents: broadcastToStudents,
  broadcastTeachers: broadcastToTeachers,
  broadcastAdmins: broadcastToAdmins,
  getStats: getSocketStats,
};

export default socketService;

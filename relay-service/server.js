const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { spawn, exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Map of active live class sessions
const sessions = new Map();

// Configuration
const RELAY_API_SECRET = process.env.RELAY_API_SECRET || 'fallback_secret_change_in_production';
const MAX_CONCURRENT_STREAMS = parseInt(process.env.MAX_CONCURRENT_STREAMS || '1', 10);

// Resource Monitoring helper
function monitorProcess(pid, liveClassId) {
  const interval = setInterval(() => {
    if (!sessions.has(liveClassId)) {
      clearInterval(interval);
      return;
    }

    // Execute ps to fetch memory (RSS in KB) and CPU %
    exec(`ps -p ${pid} -o %cpu,rss`, (err, stdout) => {
      if (err || !stdout) {
        clearInterval(interval);
        return;
      }
      
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const stats = lines[1].trim().replace(/\s+/g, ' ').split(' ');
        const cpu = stats[0];
        const ramMb = (parseInt(stats[1] || '0', 10) / 1024).toFixed(2);
        console.log(`[Monitor ${liveClassId}] FFmpeg Process (PID ${pid}) -> CPU: ${cpu}%, RAM: ${ramMb}MB`);
      }
    });
  }, 30000); // Check every 30 seconds
}

// API Middleware for Auth
function authenticate(req, res, next) {
  const secret = req.headers['x-relay-secret'];
  if (!secret || secret !== RELAY_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid relay secret' });
  }
  next();
}

// API to start a session
app.post('/api/start', authenticate, (req, res) => {
  const { liveClassId, rtmpUrl } = req.body;

  if (!liveClassId || !rtmpUrl) {
    return res.status(400).json({ error: 'liveClassId and rtmpUrl are required' });
  }

  // Check concurrency limit
  if (sessions.size >= MAX_CONCURRENT_STREAMS && !sessions.has(liveClassId)) {
    console.warn(`[Relay] Start request rejected: Limit of ${MAX_CONCURRENT_STREAMS} active streams reached.`);
    return res.status(429).json({ error: 'MAX_CONCURRENT_STREAMS_REACHED' });
  }

  if (sessions.has(liveClassId)) {
    console.log(`[Relay] Session ${liveClassId} already exists, stopping old one...`);
    stopSession(liveClassId);
  }

  try {
    console.log(`[Relay] Starting FFmpeg for live class: ${liveClassId}`);

    // Setup FFmpeg process to read WebM from stdin and output FLV/RTMP to YouTube
    // Optimized for low CPU/RAM (ultrafast preset)
    const ffmpegArgs = [
      '-i', 'pipe:0',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-tune', 'zerolatency',
      '-maxrate', '3000k',
      '-bufsize', '6000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-c:a', 'aac',
      '-ar', '44100',
      '-b:a', '128k',
      '-f', 'flv',
      rtmpUrl
    ];

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    ffmpegProcess.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('frame=') || message.includes('speed=')) {
        return;
      }
      console.log(`[FFmpeg stderr ${liveClassId}]: ${message.trim()}`);
    });

    ffmpegProcess.on('close', (code) => {
      console.log(`[FFmpeg ${liveClassId}] exited with code ${code}`);
      sessions.delete(liveClassId);
    });

    ffmpegProcess.on('error', (err) => {
      console.error(`[FFmpeg ${liveClassId}] process error:`, err);
    });

    sessions.set(liveClassId, {
      ffmpegProcess,
      wsConnection: null,
      rtmpUrl,
      startedAt: Date.now()
    });

    // Start monitoring the spawned ffmpeg process resource usage
    monitorProcess(ffmpegProcess.pid, liveClassId);

    return res.status(200).json({ status: 'started', liveClassId });
  } catch (error) {
    console.error(`[Relay] Failed to start session ${liveClassId}:`, error);
    return res.status(500).json({ error: error.message });
  }
});

// API to stop a session
app.post('/api/stop', authenticate, (req, res) => {
  const { liveClassId } = req.body;

  if (!liveClassId) {
    return res.status(400).json({ error: 'liveClassId is required' });
  }

  const stopped = stopSession(liveClassId);
  return res.status(200).json({ status: stopped ? 'stopped' : 'not_running', liveClassId });
});

function stopSession(liveClassId) {
  const session = sessions.get(liveClassId);
  if (!session) return false;

  console.log(`[Relay] Stopping session ${liveClassId}...`);

  if (session.wsConnection) {
    try {
      session.wsConnection.close();
    } catch (e) {}
  }

  if (session.ffmpegProcess) {
    try {
      session.ffmpegProcess.stdin.end();
      setTimeout(() => {
        try {
          session.ffmpegProcess.kill('SIGKILL');
        } catch (e) {}
      }, 2000);
    } catch (err) {
      console.error(`Error killing ffmpeg for ${liveClassId}:`, err);
    }
  }

  sessions.delete(liveClassId);
  return true;
}

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const url = request.url;
  const match = url.match(/^\/live\/([^/]+)$/);

  if (match) {
    const liveClassId = match[1];
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, liveClassId);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, request, liveClassId) => {
  console.log(`[WebSocket] Connection request for class: ${liveClassId}`);

  const session = sessions.get(liveClassId);
  if (!session) {
    ws.close(1008, 'Session not pre-started via API');
    return;
  }

  session.wsConnection = ws;

  ws.on('message', (message, isBinary) => {
    if (isBinary && session.ffmpegProcess && !session.ffmpegProcess.killed) {
      try {
        session.ffmpegProcess.stdin.write(message);
      } catch (err) {
        console.error(`[WebSocket] Error writing chunk:`, err);
        ws.close(1011, 'FFmpeg write error');
      }
    }
  });

  ws.on('close', () => {
    console.log(`[WebSocket] Closed for ${liveClassId}`);
    setTimeout(() => {
      const current = sessions.get(liveClassId);
      if (current && current.wsConnection === ws) {
        stopSession(liveClassId);
      }
    }, 5000);
  });

  ws.on('error', (err) => {
    console.error(`[WebSocket] Error:`, err);
    stopSession(liveClassId);
  });
});

const PORT = process.env.RELAY_PORT || 5001;
server.listen(PORT, () => {
  console.log(`[Relay] Relay Service running on port ${PORT}`);
});

const { exec } = require('child_process');

/**
 * Teknor Tomorrow - Graceful Shutdown Manager
 * Ensures that when a Node worker dies or restarts, it takes its 
 * child processes (like FFmpeg) with it.
 */
function setupGracefulShutdown(server) {
  const cleanup = async (signal) => {
    console.log(`\n[Shutdown] Received ${signal}. Starting cleanup...`);
    
    // 1. Stop accepting new connections
    server.close(() => {
      console.log('[Shutdown] HTTP server closed.');
    });

    // 2. Kill zombie FFmpeg processes (Critical for Egress/Recording)
    exec('pkill -f ffmpeg', (err, stdout, stderr) => {
      if (!err) console.log('[Shutdown] Zombie FFmpeg processes terminated.');
    });

    // 3. Close DB connections
    const { prisma } = require('./prisma');
    if (prisma) {
      await prisma.$disconnect();
      console.log('[Shutdown] Database connection closed.');
    }

    // 4. Force exit after timeout if hanging
    setTimeout(() => {
      console.error('[Shutdown] Cleanup timed out, forcing exit.');
      process.exit(1);
    }, 10000);

    console.log('[Shutdown] Cleanup complete. Goodbye.');
    process.exit(0);
  };

  process.on('SIGTERM', () => cleanup('SIGTERM'));
  process.on('SIGINT', () => cleanup('SIGINT'));
}

module.exports = { setupGracefulShutdown };
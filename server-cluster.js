/**
 * Teknor Tomorrow - Clean Entry Point
 * We rely on PM2 for clustering to avoid process saturation.
 */
const { setupGracefulShutdown } = require('./lib/graceful-shutdown');

console.log('🚀 Initializing Host Node...');
const server = require('./server.js');

// If server returns an object with the http server, we use it for shutdown
if (server && server.listen) {
  setupGracefulShutdown(server);
}
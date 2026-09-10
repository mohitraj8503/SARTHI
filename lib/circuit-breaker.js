/**
 * CLUSTERED SERVER FOR PRODUCTION STABILITY
 * Handles PM2 clustering and graceful shutdown
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');

if (cluster.isMaster || cluster.isPrimary) {
  const numCPUs = Math.min(os.cpus().length, 4); // Limit to 4 workers max

  console.log(`🚀 Starting SARTHI Cluster with ${numCPUs} workers`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();

    worker.on('message', (msg) => {
      if (msg.type === 'shutdown') {
        console.log(`Worker ${worker.process.pid} requested shutdown`);
        worker.kill('SIGTERM');
      }
    });
  }

  // Handle worker exits
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} died (Code: ${code}, Signal: ${signal})`);

    // Restart worker unless it's a graceful shutdown
    if (signal !== 'SIGTERM') {
      console.log('🔄 Restarting worker...');
      cluster.fork();
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');

    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGTERM');
    }

    setTimeout(() => {
      console.log('💀 Force killing remaining workers');
      process.exit(0);
    }, 10000);
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

} else {
  // Worker process - run the actual server
  console.log(`👷 Worker ${process.pid} starting server`);

  // Handle worker-specific errors
  process.on('uncaughtException', (err) => {
    console.error(`💥 Worker ${process.pid} uncaught exception:`, err);
    process.send({ type: 'shutdown' });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(`💥 Worker ${process.pid} unhandled rejection:`, reason);
    process.send({ type: 'shutdown' });
    process.exit(1);
  });

  // Start the server
  require('./server.js');
}
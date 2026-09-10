const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Teknor Tomorrow - High-Fidelity Metrics Collector
 * Periodically logs system health to help correlate spikes with user activity.
 */
function startMetricsCollection(intervalMs = 60000) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  
  const logFile = path.join(logDir, 'metrics.log');

  setInterval(() => {
    const memory = process.memoryUsage();
    const systemMemory = {
      free: os.freemem(),
      total: os.totalmem(),
    };
    
    const metric = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
        },
        cpu: process.cpuUsage(),
      },
      system: {
        loadAvg: os.loadavg(),
        freeMemory: Math.round(systemMemory.free / 1024 / 1024) + 'MB',
        percentUsed: Math.round(((systemMemory.total - systemMemory.free) / systemMemory.total) * 100) + '%',
      }
    };

    fs.appendFileSync(logFile, JSON.stringify(metric) + '\n');
    
    // Alert on high memory usage
    if ((systemMemory.total - systemMemory.free) / systemMemory.total > 0.9) {
      console.error('⚠️ [CRITICAL] System Memory Usage exceeds 90%!');
    }
  }, intervalMs);
}

module.exports = { startMetricsCollection };

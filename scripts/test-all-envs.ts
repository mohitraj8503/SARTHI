import * as dotenv from 'dotenv';
import { HealthChecker } from '../lib/health/health-checker';

dotenv.config();

async function runHealthCheck() {
  console.log('🚀 Running System Health Check...\n');
  const checker = new HealthChecker();
  const report = await checker.runHealthChecks();

  console.log('------------------------------------------------');
  console.log(`Overall Status: ${report.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
  console.log(`Total Response Time: ${report.responseTime}ms`);
  console.log('------------------------------------------------\n');

  report.checks.forEach(check => {
    const icon = check.status === 'healthy' ? '✅' : '❌';
    console.log(`${icon} ${check.name.toUpperCase()}`);
    if (check.responseTime) console.log(`   Response Time: ${check.responseTime}ms`);
    if (check.error) console.log(`   Error: ${check.error}`);
    console.log('');
  });

  process.exit(report.status === 'healthy' ? 0 : 1);
}

runHealthCheck().catch(err => {
  console.error('Fatal error during health check:', err);
  process.exit(1);
});

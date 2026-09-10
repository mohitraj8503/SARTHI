import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure we don't cache this too aggressively

export async function getSystemStatus() {
  try {
     const settings = await prisma.settings.findMany({
         where: { 
             key: { in: ['MAINTENANCE_MODE', 'KILL_SWITCH_FRONTEND'] }
         }
     });
     
     const kv = settings.reduce((acc, curr) => {
         acc[curr.key] = curr.value;
         return acc;
     }, {} as Record<string, string>);

     return {
         maintenance: kv['MAINTENANCE_MODE'] === 'true',
         dead: kv['KILL_SWITCH_FRONTEND'] === 'true'
     };
  } catch {
      // If DB is down, we are in trouble anyway, but default to UP to avoid accidental lockout
      return { maintenance: false, dead: false };
  }
}

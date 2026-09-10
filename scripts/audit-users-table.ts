import { prisma } from '/home/mohitraj8503/Documents/SARTHI/lib/prisma';
import fs from 'fs';

function cleanBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(cleanBigInt);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = cleanBigInt(obj[key]);
    }
    return res;
  }
  return obj;
}

async function main() {
  const dbName = 'u402587352_sarthi';

  // 1. Table status & size
  const tableStatus: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      TABLE_NAME, 
      TABLE_ROWS, 
      DATA_LENGTH, 
      INDEX_LENGTH, 
      DATA_FREE,
      AVG_ROW_LENGTH
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME = 'users'
  `);

  // Exact row count
  const countRes: any[] = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM users');
  const exactCount = Number(countRes[0]?.cnt);

  // 2. Roles in users
  const roleCounts: any[] = await prisma.$queryRawUnsafe(`
    SELECT COALESCE(role, 'NULL') as role, COUNT(*) as cnt FROM users GROUP BY role ORDER BY cnt DESC
  `);

  // Check any role containing 'JUNIOR'
  const juniorRoles: any[] = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT role FROM users WHERE UPPER(role) LIKE '%JUNIOR%'
  `);

  // Check junior tables in database
  const juniorTables: any[] = await prisma.$queryRawUnsafe(`
    SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME LIKE '%junior%'
  `);

  // 3. Full column list via DESCRIBE
  const columns: any[] = await prisma.$queryRawUnsafe('DESCRIBE users');

  // 4. Run aggregate query grouped by role for all columns
  const aggClauses = columns.map((c: any) => `COUNT(NULLIF(\`${c.Field}\`, '')) as \`cnt_${c.Field}\``).join(',\n      ');
  const groupStats: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      COALESCE(role, 'NULL') as role,
      COUNT(*) as totalRoleUsers,
      ${aggClauses}
    FROM users
    GROUP BY role
  `);

  // Total across all roles
  const totalStatsRow: any[] = await prisma.$queryRawUnsafe(`
    SELECT 
      COUNT(*) as totalUsers,
      ${aggClauses}
    FROM users
  `);

  const totalRow = totalStatsRow[0];

  const columnStats: any[] = [];
  for (const col of columns) {
    const colName = col.Field;
    const overallNonNull = Number(totalRow[`cnt_${colName}`] || 0);
    const stat: any = {
      column: colName,
      type: col.Type,
      nullable: col.Null === 'YES',
      overallNonNull,
      overallPercent: ((overallNonNull / exactCount) * 100).toFixed(1) + '%',
      perRole: {}
    };

    for (const rRow of groupStats) {
      const rName = rRow.role;
      const rTotal = Number(rRow.totalRoleUsers);
      const rNonNull = Number(rRow[`cnt_${colName}`] || 0);
      stat.perRole[rName] = {
        nonNull: rNonNull,
        total: rTotal,
        percent: rTotal > 0 ? ((rNonNull / rTotal) * 100).toFixed(1) + '%' : '0%'
      };
    }
    columnStats.push(stat);
  }

  const output = {
    tableMetrics: cleanBigInt(tableStatus[0]),
    exactCount,
    roleCounts: cleanBigInt(roleCounts),
    juniorRoles: cleanBigInt(juniorRoles),
    juniorTables: cleanBigInt(juniorTables),
    columns: cleanBigInt(columns),
    columnStats: cleanBigInt(columnStats)
  };

  fs.writeFileSync(
    '/home/mohitraj8503/.gemini/antigravity/brain/fffdbd3e-9731-43d0-8f74-396f4022a183/scratch/users_audit.json',
    JSON.stringify(output, null, 2)
  );
  console.log('Saved users audit data to scratch/users_audit.json');
}

main().catch(console.error);

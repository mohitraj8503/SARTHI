import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export async function backupTables(tableNames: string[], outputFileName: string): Promise<string> {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) throw new Error('DATABASE_URL not found in env');

  const parsedUrl = new URL(connectionUrl);
  const host = parsedUrl.hostname;
  const port = parseInt(parsedUrl.port || '3306', 10);
  const user = parsedUrl.username;
  const password = decodeURIComponent(parsedUrl.password);
  const database = parsedUrl.pathname.replace(/^\//, '');

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });

  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const outputPath = path.join(backupDir, outputFileName);
  let sqlDump = `-- Backup Created: ${new Date().toISOString()}\n`;
  sqlDump += `-- Database: ${database}\n`;
  sqlDump += `-- Tables: ${tableNames.join(', ')}\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const table of tableNames) {
    console.log(`Dumping table: ${table}...`);
    try {
      // 1. DDL
      const [createRows]: any = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      if (createRows && createRows.length > 0) {
        const createTableSql = createRows[0]['Create Table'];
        sqlDump += `-- --------------------------------------------------------\n`;
        sqlDump += `-- Table structure for table \`${table}\`\n`;
        sqlDump += `-- --------------------------------------------------------\n`;
        sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        sqlDump += `${createTableSql};\n\n`;
      }

      // 2. Data
      const [rows]: any = await connection.query(`SELECT * FROM \`${table}\``);
      if (rows && rows.length > 0) {
        sqlDump += `-- Dumping data for table \`${table}\` (${rows.length} rows)\n`;
        for (const row of rows) {
          const columns = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return connection.escape(val);
          }).join(', ');
          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES (${values});\n`;
        }
        sqlDump += `\n`;
      } else {
        sqlDump += `-- Table \`${table}\` has 0 rows (Empty)\n\n`;
      }
    } catch (err: any) {
      console.warn(`Could not dump table ${table}:`, err.message);
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  fs.writeFileSync(outputPath, sqlDump, 'utf8');
  await connection.end();

  console.log(`Backup saved to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB)`);
  return outputPath;
}

// CLI runner if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const tables = args.slice(0, -1);
  const outFile = args[args.length - 1];
  if (!tables.length || !outFile) {
    console.error('Usage: npx tsx scripts/db-backup-tables.ts <table> [<table2> ...] <output.sql>');
    process.exit(1);
  }
  backupTables(tables, outFile).catch(console.error);
}

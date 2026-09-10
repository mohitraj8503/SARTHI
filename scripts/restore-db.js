const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Error: DATABASE_URL is not defined in .env');
  process.exit(1);
}

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error('Error: Please provide the path to the SQL backup file as an argument.');
  console.error('Usage: node scripts/restore-db.js <path-to-sql-file>');
  process.exit(1);
}

async function main() {
  const resolvedPath = path.resolve(sqlFilePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`Reading SQL file: ${resolvedPath}...`);
  const sqlContent = fs.readFileSync(resolvedPath, 'utf8');

  console.log('Connecting to database...');
  // Parse MySQL URL
  // mysql://user:password@host:port/database
  const connection = await mysql.createConnection(dbUrl);
  console.log('Connected successfully!');

  // Split SQL by statements (handling basic edge cases)
  const statements = sqlContent
    .split(/;\r?\n/)
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0 && !statement.startsWith('--') && !statement.startsWith('/*'));

  console.log(`Found ${statements.length} SQL statements to execute.`);

  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await connection.query(statement);
      successCount++;
    } catch (e) {
      console.error(`❌ Error executing statement ${i + 1}:`, e.message);
      console.error(`Statement: ${statement.substring(0, 100)}...`);
    }
  }

  console.log(`\nRestore complete: ${successCount}/${statements.length} statements executed successfully.`);
  await connection.end();
}

main().catch(async (e) => {
  console.error('❌ Restore failed:', e);
});

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function getMySQLConnection() {
  if (pool) return pool;
  
  pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'sarthi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL Pool connected');
    conn.release();
  } catch (error) {
    console.error('❌ MySQL Pool connection failed:', error);
  }
  
  return pool;
}

export async function query<T>(sql: string, params: any[] = []): Promise<[T, any]> {
  const pool = await getMySQLConnection();
  const [rows, fields] = await pool.execute(sql, params);
  return [rows as T, fields];
}

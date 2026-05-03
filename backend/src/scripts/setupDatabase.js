import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
  const seedPath = path.resolve(__dirname, '../../sql/seed.sql');

  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const seedSql = await fs.readFile(seedPath, 'utf8');

  const client = await pool.connect();

  try {
    await client.query(schemaSql);
    await client.query(seedSql);
    console.log('Database schema and seed data loaded successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});


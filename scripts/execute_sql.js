import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

async function executeSql() {
  const sql = fs.readFileSync('scripts/01_create_schema.sql', 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to the database.');
    await client.query(sql);
    console.log('SQL script executed successfully.');
  } catch (err) {
    console.error('Error executing SQL script:', err);
  } finally {
    await client.end();
    console.log('Connection to the database closed.');
  }
}

executeSql();

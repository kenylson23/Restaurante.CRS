import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use PostgreSQL database connection from Replit
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

console.log('Connecting to PostgreSQL database...');

// Create connection using postgres-js
const sql = postgres(DATABASE_URL, {
  max: 10, // Connection pool size
  prepare: false
});

export const db = drizzle(sql, { schema });
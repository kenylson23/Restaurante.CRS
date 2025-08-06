import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema";
import { getDatabaseUrl } from './supabase';

// Use Supabase database connection
const DATABASE_URL = getDatabaseUrl();

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

console.log('Connecting to Supabase PostgreSQL database...');

// Create connection using postgres-js with optimized settings for Vercel
const sql = postgres(DATABASE_URL, {
  max: 5, // Reduced connection pool for serverless
  prepare: false,
  ssl: 'require',
  connection: {
    application_name: 'las-tortillas-vercel'
  }
});

export const db = drizzle(sql, { schema }); 
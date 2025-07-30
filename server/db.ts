import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Use Supabase database connection
const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// Create Supabase direct connection string - using transaction pooling
const DATABASE_URL = `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

console.log('Connecting to Supabase database...');

// Create connection using postgres-js for Supabase with proper SSL configuration
const sql = postgres(DATABASE_URL, {
  max: 1, // Use 1 connection for transaction pooling
  ssl: 'require',
  prepare: false
});

export const db = drizzle(sql, { schema });
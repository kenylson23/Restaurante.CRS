import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for frontend operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database URL configuration for Drizzle ORM using Supabase connection
export const getDatabaseUrl = () => {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is required');
  }
  
  // Extract project reference from Supabase URL
  // Format: https://xyz.supabase.co -> xyz
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  // Create direct database connection string for Supabase
  // Use pooler connection for better compatibility
  return `postgresql://postgres.${projectRef}:${supabaseServiceRoleKey}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
};
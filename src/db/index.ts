import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = import.meta.env.VITE_SUPABASE_DB_URL;

if (!databaseUrl) {
  throw new Error('VITE_SUPABASE_DB_URL is not set in environment variables');
}

// Create the database connection
const queryClient = postgres(databaseUrl);

// Create the Drizzle client
export const db = drizzle(queryClient, { schema });

export * from './schema';

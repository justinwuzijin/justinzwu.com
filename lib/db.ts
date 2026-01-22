import { Pool } from 'pg'

// Validate DATABASE_URL is set (check both DATABASE_URL and Vercel's STORAGE_DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_DATABASE_URL
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL is not set. Database operations will fail.')
  console.warn('   Please create .env.local with: DATABASE_URL=postgresql://...')
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  // For local development, you can also use individual env vars:
  // host: process.env.DB_HOST,
  // port: parseInt(process.env.DB_PORT || '5432'),
  // database: process.env.DB_NAME,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
})

// Set search_path to public schema for all connections
pool.on('connect', async (client) => {
  await client.query('SET search_path TO public')
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to PostgreSQL database')
  }
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err.message)
  // Don't exit in production - let the app handle it
  if (process.env.NODE_ENV === 'development') {
    console.error('Full error:', err)
  }
})

export default pool

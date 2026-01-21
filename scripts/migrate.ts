import pool from '../lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function runMigrations() {
  try {
    console.log('Running database migrations...')
    
    // Read the migration file
    const migrationSQL = readFileSync(
      join(process.cwd(), 'lib', 'migrations', '001_create_books_table.sql'),
      'utf-8'
    )
    
    // Execute the migration
    await pool.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()

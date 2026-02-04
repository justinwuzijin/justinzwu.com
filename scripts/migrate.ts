import pool from '../lib/db'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

async function runMigrations() {
  try {
    console.log('Running database migrations...\n')
    
    const migrationsDir = join(process.cwd(), 'lib', 'migrations')
    
    // Get all SQL files and sort them alphabetically (001_, 002_, 003_, etc.)
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`Found ${migrationFiles.length} migration(s):\n`)
    
    for (const file of migrationFiles) {
      console.log(`📄 Running: ${file}`)
      
      const migrationSQL = readFileSync(
        join(migrationsDir, file),
        'utf-8'
      )
      
      await pool.query(migrationSQL)
      console.log(`   ✅ Completed\n`)
    }
    
    console.log('🎉 All migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()

import pool from '../lib/db'

/**
 * Script to add my_review column to books table if it doesn't exist
 */

async function addMyReviewColumn() {
  try {
    console.log('Checking if my_review column exists...\n')

    // Check if column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'books' AND column_name = 'my_review'
    `)

    if (checkResult.rows.length > 0) {
      console.log('✅ Column my_review already exists!\n')
      await pool.end()
      process.exit(0)
    }

    console.log('Column my_review does not exist. Adding it...\n')

    // Add the column
    await pool.query(`
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS my_review TEXT
    `)

    console.log('✅ Successfully added my_review column to books table!\n')
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to add column:', error.message)
    console.error('Error details:', error)
    await pool.end()
    process.exit(1)
  }
}

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  console.log('\n📝 Please create .env.local file with:')
  console.log('   DATABASE_URL=postgresql://user:password@host:port/database\n')
  process.exit(1)
}

addMyReviewColumn()

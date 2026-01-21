import pool from '../lib/db'

async function testDatabase() {
  console.log('🔍 Testing database connection...\n')

  // Check environment variable
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set!')
    console.log('\n📝 Please create .env.local file with:')
    console.log('   DATABASE_URL=postgresql://user:password@host:port/database\n')
    process.exit(1)
  }

  console.log('✅ DATABASE_URL is configured')
  console.log(`   Connection string: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`)

  try {
    // Test connection
    console.log('🔌 Testing connection...')
    const testQuery = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Connection successful!')
    console.log(`   Server time: ${testQuery.rows[0].current_time}\n`)

    // Check if books table exists
    console.log('📚 Checking books table...')
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      )
    `)

    if (!tableCheck.rows[0].exists) {
      console.error('❌ Books table does not exist!')
      console.log('\n📝 Please run: bun run migrate\n')
      process.exit(1)
    }

    console.log('✅ Books table exists\n')

    // Count books
    console.log('📖 Counting books...')
    const countResult = await pool.query('SELECT COUNT(*) as count FROM books')
    const bookCount = parseInt(countResult.rows[0].count)
    console.log(`✅ Found ${bookCount} books in database\n`)

    if (bookCount === 0) {
      console.log('⚠️  No books found!')
      console.log('📝 Please run: bun run import-books <path-to-csv>\n')
    } else {
      // Show sample books
      console.log('📚 Sample books:')
      const sampleBooks = await pool.query(`
        SELECT title, author, exclusive_shelf, cover_url IS NOT NULL as has_cover
        FROM books 
        LIMIT 5
      `)
      
      sampleBooks.rows.forEach((book, i) => {
        console.log(`   ${i + 1}. "${book.title}" by ${book.author}`)
        console.log(`      Shelf: ${book.exclusive_shelf}, Cover: ${book.has_cover ? '✅' : '❌'}`)
      })
      console.log()
    }

    // Test shelf queries
    console.log('🔍 Testing shelf queries...')
    const shelves = ['read', 'currently-reading', 'to-read']
    
    for (const shelf of shelves) {
      const shelfResult = await pool.query(
        'SELECT COUNT(*) as count FROM books WHERE exclusive_shelf = $1',
        [shelf]
      )
      const count = parseInt(shelfResult.rows[0].count)
      console.log(`   ${shelf}: ${count} books`)
    }
    console.log()

    console.log('✅ All tests passed!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Database test failed!')
    console.error(`   Error: ${error.message}`)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL server is not running!')
      console.error('   Start it with: brew services start postgresql@18')
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed!')
      console.error('   Check your DATABASE_URL password')
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist!')
      console.error('   Create it in pgAdmin4 or check DATABASE_URL')
    }
    
    console.error('\n📝 Full error details:')
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testDatabase()

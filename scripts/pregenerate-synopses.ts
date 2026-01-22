import pool from '../lib/db'

async function pregenerateSynopses() {
  console.log('🚀 Starting synopsis pre-generation...\n')
  
  try {
    // Get all books without synopses
    const { rows: books } = await pool.query(
      `SELECT id, title, author, exclusive_shelf 
       FROM books 
       WHERE synopsis IS NULL 
       ORDER BY exclusive_shelf, date_added DESC`
    )
    
    if (books.length === 0) {
      console.log('✅ All books already have synopses!')
      process.exit(0)
    }
    
    console.log(`📚 Found ${books.length} books without synopses\n`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < books.length; i++) {
      const book = books[i]
      const progress = `[${i + 1}/${books.length}]`
      
      console.log(`${progress} Generating synopsis for: "${book.title}" by ${book.author}`)
      
      try {
        // Call the synopsis API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const response = await fetch(
          `${baseUrl}/api/book-synopsis?id=${book.id}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.synopsis) {
            console.log(`   ✅ Generated (${data.synopsis.length} chars)`)
            successCount++
          } else {
            console.log(`   ⚠️  No synopsis returned`)
            errorCount++
          }
        } else {
          const errorData = await response.json()
          console.log(`   ❌ Failed: ${errorData.error || response.statusText}`)
          errorCount++
        }
        
        // Add delay to avoid rate limiting (2 seconds between requests)
        if (i < books.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
        errorCount++
      }
      
      console.log('') // Empty line for readability
    }
    
    console.log('\n📊 Summary:')
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log(`   📚 Total: ${books.length}`)
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

pregenerateSynopses()

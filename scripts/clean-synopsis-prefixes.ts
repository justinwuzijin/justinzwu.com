import pool from '../lib/db'

async function cleanSynopsisPrefixes() {
  console.log('🧹 Starting synopsis cleanup...\n')
  
  try {
    // Get all books with synopses
    const { rows: books } = await pool.query(
      `SELECT id, title, author, synopsis 
       FROM books 
       WHERE synopsis IS NOT NULL 
       ORDER BY id`
    )
    
    if (books.length === 0) {
      console.log('✅ No books with synopses found!')
      await pool.end()
      process.exit(0)
    }
    
    console.log(`📚 Found ${books.length} books with synopses\n`)
    
    // Patterns to remove (common AI-generated prefixes)
    const prefixPatterns = [
      // Remove everything up to and including the first occurrence of these phrases
      /^(?:Okay,?\s+)?(?:I have searched the web for information about|after searching the web,|based on (?:web searches|information gathered)|gleaned from web research).+?(?:\.|,)\s*(?:Here'?s?|Alright,? here'?s?)\s+a\s+(?:concise|brief)\s+synopsis(?:\s+of\s+.+?)?:\s*/is,
      /^Okay,?\s+(?:after searching the web,?\s+)?here'?s?\s+a\s+(?:concise|brief)\s+synopsis\s+of\s+.+?(?:,\s+based on information gathered from (?:across )?the web)?\s*:\s*/is,
      /^Okay,?\s+I'?ve\s+searched\s+the\s+web\s+and\s+gathered\s+information\s+about\s+.+?\.\s*(?:Here'?s?\s+a\s+(?:concise|brief)\s+synopsis:\s*)?/is,
      /^Here'?s?\s+a\s+(?:concise|brief)\s+synopsis(?:\s+of\s+.+?)?,?\s+(?:based on|compiled from)\s+(?:information gathered|widely available information|various sources)(?:\s+(?:from\s+)?(?:across|on)\s+the\s+web)?\s*:\s*/is,
      /^Alright,?\s+here'?s?\s+a\s+(?:concise|brief)\s+synopsis\s+of\s+.+?,?\s+based on\s+.+?\s*:\s*/is,
      /^Here'?s?\s+a\s+(?:concise|brief)\s+synopsis:\s*/i,
      /^Here'?s?\s+a\s+summary\s+of\s+.+?:\s*/i,
    ]
    
    let cleanedCount = 0
    let unchangedCount = 0
    
    for (const book of books) {
      let originalSynopsis = book.synopsis
      let cleanedSynopsis = originalSynopsis
      let wasModified = false
      
      // Try each pattern
      for (const pattern of prefixPatterns) {
        const newSynopsis = cleanedSynopsis.replace(pattern, '')
        if (newSynopsis !== cleanedSynopsis) {
          cleanedSynopsis = newSynopsis.trim()
          wasModified = true
        }
      }
      
      if (wasModified && cleanedSynopsis !== originalSynopsis) {
        try {
          await pool.query(
            'UPDATE books SET synopsis = $1 WHERE id = $2',
            [cleanedSynopsis, book.id]
          )
          
          console.log(`✅ Cleaned: "${book.title}" by ${book.author}`)
          console.log(`   Before (${originalSynopsis.length} chars): ${originalSynopsis.substring(0, 100)}...`)
          console.log(`   After (${cleanedSynopsis.length} chars): ${cleanedSynopsis.substring(0, 100)}...\n`)
          cleanedCount++
        } catch (error: any) {
          console.error(`❌ Failed to update book ${book.id}:`, error.message)
        }
      } else {
        unchangedCount++
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`   🧹 Cleaned: ${cleanedCount}`)
    console.log(`   ✨ Already clean: ${unchangedCount}`)
    console.log(`   📚 Total: ${books.length}`)
    
    await pool.end()
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    await pool.end()
    process.exit(1)
  }
}

cleanSynopsisPrefixes()

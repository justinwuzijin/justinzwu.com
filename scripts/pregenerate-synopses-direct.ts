import pool from '../lib/db'

interface GeminiModel {
  model: string
  version: string
  tool: string | null
}

async function generateSynopsis(title: string, author: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found')
  }

  const prompt = `Please search the web and find information about the book "${title}" by ${author}. After gathering the data, provide a brief synopsis in a maximum of 3 sentences. Keep it concise and informative.`

  const modelsToTry: GeminiModel[] = [
    { model: 'gemini-2.0-flash-exp', version: 'v1beta', tool: null },
    { model: 'gemini-1.5-flash-latest', version: 'v1beta', tool: null },
    { model: 'gemini-1.5-flash', version: 'v1beta', tool: null },
    { model: 'gemini-1.5-pro-latest', version: 'v1beta', tool: null },
    { model: 'gemini-pro', version: 'v1beta', tool: null },
  ]

  for (const { model, version, tool } of modelsToTry) {
    try {
      const requestBody: any = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }

      if (tool) {
        requestBody.tools = [{ [tool]: {} }]
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text
        }
      } else {
        const errorText = await response.text()
        console.log(`      ⚠️  Model ${model} failed: ${response.status} - ${errorText.substring(0, 100)}`)
      }
    } catch (error: any) {
      console.log(`      ⚠️  Model ${model} error: ${error.message}`)
      continue
    }
  }

  return null
}

async function pregenerateSynopsesDirect() {
  console.log('🚀 Starting direct synopsis pre-generation...\n')
  
  try {
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
        const synopsis = await generateSynopsis(book.title, book.author)
        
        if (synopsis) {
          // Save to database
          await pool.query(
            'UPDATE books SET synopsis = $1 WHERE id = $2',
            [synopsis, book.id]
          )
          console.log(`   ✅ Generated (${synopsis.length} chars)`)
          successCount++
        } else {
          console.log(`   ⚠️  Failed to generate`)
          errorCount++
        }
        
        // Delay to avoid rate limiting (3 seconds)
        if (i < books.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
        errorCount++
      }
      
      console.log('')
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

pregenerateSynopsesDirect()

import pool from '../lib/db'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { getBookCoverUrl, cleanISBN } from '../lib/bookCovers'

interface GoodReadsBook {
  'Book Id': string
  'Title': string
  'Author': string
  'Author l-f': string
  'Additional Authors': string
  'ISBN': string
  'ISBN13': string
  'My Rating': string
  'Average Rating': string
  'Publisher': string
  'Binding': string
  'Number of Pages': string
  'Year Published': string
  'Original Publication Year': string
  'Date Read': string
  'Date Added': string
  'Bookshelves': string
  'Bookshelves with positions': string
  'Exclusive Shelf': string
  'My Review': string
  'Spoiler': string
  'Private Notes': string
  'Read Count': string
  'Owned Copies': string
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null
  // GoodReads format: YYYY/MM/DD
  const [year, month, day] = dateStr.split('/').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function parseInteger(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

function parseDecimal(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

// cleanISBN is now imported from lib/bookCovers

async function importBooks(csvPath: string) {
  try {
    console.log(`Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records: GoodReadsBook[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
    
    console.log(`Found ${records.length} books to import`)
    
    let imported = 0
    let updated = 0
    let errors = 0
    
    for (const record of records) {
      try {
        const goodreadsId = record['Book Id'].trim()
        if (!goodreadsId) {
          console.warn('Skipping record with no Book Id')
          continue
        }
        
        // Map GoodReads shelf names to our format
        const exclusiveShelf = record['Exclusive Shelf'].trim().toLowerCase()
        if (!['read', 'currently-reading', 'to-read'].includes(exclusiveShelf)) {
          console.warn(`Skipping book with invalid shelf: ${exclusiveShelf}`)
          continue
        }
        
        // Parse rating (0-5, or null if empty)
        const myRating = record['My Rating'] ? parseInteger(record['My Rating']) : null
        
        // Generate cover URL with fallbacks
        const isbn = cleanISBN(record['ISBN'])
        const isbn13 = cleanISBN(record['ISBN13'])
        const coverUrl = getBookCoverUrl({
          isbn,
          isbn13,
          goodreadsId: goodreadsId,
          title: record['Title'].trim(),
          author: record['Author'].trim(),
        })
        
        const insertQuery = `
          INSERT INTO books (
            goodreads_id, title, author, author_lf, additional_authors,
            isbn, isbn13, my_rating, average_rating,
            publisher, binding, number_of_pages, year_published, original_publication_year,
            date_read, date_added, bookshelves, bookshelves_with_positions,
            exclusive_shelf, my_review, spoiler, private_notes,
            read_count, owned_copies, cover_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          ON CONFLICT (goodreads_id) 
          DO UPDATE SET
            title = EXCLUDED.title,
            author = EXCLUDED.author,
            author_lf = EXCLUDED.author_lf,
            additional_authors = EXCLUDED.additional_authors,
            isbn = EXCLUDED.isbn,
            isbn13 = EXCLUDED.isbn13,
            my_rating = EXCLUDED.my_rating,
            average_rating = EXCLUDED.average_rating,
            publisher = EXCLUDED.publisher,
            binding = EXCLUDED.binding,
            number_of_pages = EXCLUDED.number_of_pages,
            year_published = EXCLUDED.year_published,
            original_publication_year = EXCLUDED.original_publication_year,
            date_read = EXCLUDED.date_read,
            date_added = EXCLUDED.date_added,
            bookshelves = EXCLUDED.bookshelves,
            bookshelves_with_positions = EXCLUDED.bookshelves_with_positions,
            exclusive_shelf = EXCLUDED.exclusive_shelf,
            my_review = EXCLUDED.my_review,
            spoiler = EXCLUDED.spoiler,
            private_notes = EXCLUDED.private_notes,
            read_count = EXCLUDED.read_count,
            owned_copies = EXCLUDED.owned_copies,
            cover_url = EXCLUDED.cover_url,
            updated_at = CURRENT_TIMESTAMP
        `
        
        const result = await pool.query(insertQuery, [
          goodreadsId,
          record['Title'].trim(),
          record['Author'].trim() || null,
          record['Author l-f'].trim() || null,
          record['Additional Authors'].trim() || null,
          cleanISBN(record['ISBN']),
          cleanISBN(record['ISBN13']),
          myRating,
          parseDecimal(record['Average Rating']),
          record['Publisher'].trim() || null,
          record['Binding'].trim() || null,
          parseInteger(record['Number of Pages']),
          parseInteger(record['Year Published']),
          parseInteger(record['Original Publication Year']),
          parseDate(record['Date Read']),
          parseDate(record['Date Added']),
          record['Bookshelves'].trim() || null,
          record['Bookshelves with positions'].trim() || null,
          exclusiveShelf,
          record['My Review'].trim() || null,
          record['Spoiler']?.toLowerCase() === 'true',
          record['Private Notes'].trim() || null,
          parseInteger(record['Read Count']) || 0,
          parseInteger(record['Owned Copies']) || 0,
          coverUrl || null,
        ])
        
        if (result.rowCount === 1) {
          // Check if it was an insert or update
          const checkQuery = await pool.query(
            'SELECT created_at, updated_at FROM books WHERE goodreads_id = $1',
            [goodreadsId]
          )
          if (checkQuery.rows[0].created_at.getTime() === checkQuery.rows[0].updated_at.getTime()) {
            imported++
          } else {
            updated++
          }
        }
        
        if ((imported + updated) % 10 === 0) {
          console.log(`Progress: ${imported + updated}/${records.length}`)
        }
      } catch (error) {
        errors++
        console.error(`Error importing book "${record['Title']}":`, error)
      }
    }
    
    console.log('\n✅ Import completed!')
    console.log(`   Imported: ${imported} books`)
    console.log(`   Updated: ${updated} books`)
    console.log(`   Errors: ${errors} books`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Get CSV path from command line argument
const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: bun run scripts/import-books.ts <path-to-csv>')
  process.exit(1)
}

importBooks(csvPath)

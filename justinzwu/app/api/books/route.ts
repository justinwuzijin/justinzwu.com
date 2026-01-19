import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const shelf = searchParams.get('shelf')
    
    // Map shelf names from frontend to database format
    const shelfMap: Record<string, string> = {
      'to read': 'to-read',
      'reading': 'currently-reading',
      'read': 'read',
    }
    
    const dbShelf = shelf ? shelfMap[shelf] : null
    
    let query = 'SELECT * FROM books'
    const params: any[] = []
    
    if (dbShelf) {
      query += ' WHERE exclusive_shelf = $1'
      params.push(dbShelf)
    }
    
    query += ' ORDER BY date_read DESC NULLS LAST, date_added DESC'
    
    const result = await pool.query(query, params)
    
    // Transform database format to frontend format
    const books = result.rows.map((book) => ({
      id: book.id,
      goodreadsId: book.goodreads_id,
      title: book.title,
      author: book.author,
      cover: book.local_cover_path 
        ? `/assets/${book.local_cover_path}` 
        : book.cover_url || `/assets/svg/placeholder-book.jpg`,
      shelf: mapShelfToFrontend(book.exclusive_shelf),
      rating: book.my_rating || undefined,
      dateRead: book.date_read,
      dateAdded: book.date_added,
      isbn: book.isbn13 || book.isbn,
      review: book.my_review,
    }))
    
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

function mapShelfToFrontend(dbShelf: string): 'to read' | 'reading' | 'read' {
  const map: Record<string, 'to read' | 'reading' | 'read'> = {
    'to-read': 'to read',
    'currently-reading': 'reading',
    'read': 'read',
  }
  return map[dbShelf] || 'to read'
}

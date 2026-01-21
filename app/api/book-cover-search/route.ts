import { NextResponse } from "next/server";

/**
 * API endpoint to search for book covers on the web
 * Uses multiple sources: Open Library Search, Google Books (if API key available)
 */

interface SearchResult {
  coverUrl: string | null
  source: string
}

async function searchOpenLibrary(title: string, author: string): Promise<SearchResult | null> {
  try {
    // Open Library Search API (free, no auth required)
    const searchQuery = `${title} ${author}`.trim()
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1`
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.docs && data.docs.length > 0) {
      const book = data.docs[0]
      
      // Try to get cover image
      if (book.isbn && book.isbn.length > 0) {
        // Use first ISBN (prefer ISBN13)
        const isbn = book.isbn[book.isbn.length - 1] 
        const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        return {
          coverUrl: url,
          source: 'openlibrary-search',
        }
      }
      
      // Try cover_i if available
      if (book.cover_i) {
        return {
          coverUrl: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`,
          source: 'openlibrary-id',
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Open Library search error:', error)
    return null
  }
}

async function searchGoogleBooks(title: string, author: string): Promise<SearchResult | null> {
  try {
    const searchQuery = `intitle:${title} inauthor:${author}`.trim()
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1${apiKey ? `&key=${apiKey}` : ''}`
    
    const response = await fetch(searchUrl)

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const book = data.items[0]
      const volumeInfo = book.volumeInfo
      
      if (volumeInfo.imageLinks) {
        // Try to get higher resolution
        const coverUrl = volumeInfo.imageLinks.extraLarge ||
                        volumeInfo.imageLinks.large ||
                        volumeInfo.imageLinks.medium ||
                        volumeInfo.imageLinks.small ||
                        volumeInfo.imageLinks.thumbnail
        
        if (coverUrl) {
          return {
            coverUrl: coverUrl.replace('http:', 'https:').replace('&edge=curl', ''),
            source: 'google-books',
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Google Books search error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')
    const author = searchParams.get('author')
    const isbn = searchParams.get('isbn')
    const isbn13 = searchParams.get('isbn13')

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      )
    }

    // Try multiple sources in order
    let result: SearchResult | null = null

    // 1. Try Google Books first (better quality if available)
    result = await searchGoogleBooks(title, author)
    
    // 2. Try Open Library search
    if (!result) {
      result = await searchOpenLibrary(title, author)
    }

    // 3. If we have ISBN but no result, try direct Open Library ISBN lookup
    if (!result && (isbn13 || isbn)) {
      const isbnToUse = isbn13 || isbn
      result = {
        coverUrl: `https://covers.openlibrary.org/b/isbn/${isbnToUse}-L.jpg`,
        source: 'openlibrary-isbn-direct',
      }
    }

    if (result && result.coverUrl) {
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: "No cover found" },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Book cover search error:', error)
    return NextResponse.json(
      { error: "Failed to search for cover" },
      { status: 500 }
    )
  }
}

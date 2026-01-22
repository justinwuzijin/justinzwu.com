import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shelf = searchParams.get('shelf')

    // Map frontend shelf names to database values
    const shelfMap: Record<string, string> = {
      'to read': 'to-read',
      'reading': 'currently-reading',
      'read': 'read',
    }
    const dbShelf = shelf ? shelfMap[shelf] || shelf : null

    let query = `
      select
        id,
        title,
        author,
        isbn,
        isbn13,
        my_rating,
        exclusive_shelf,
        cover_url,
        date_added,
        my_review
      from books
    `

    const params: any[] = []
    if (dbShelf) {
      query += ` where exclusive_shelf = $1`
      params.push(dbShelf)
    }

    query += ` order by date_added desc nulls last, id desc`

    const { rows } = await pool.query(query, params)

    // Debug: Log query and results for reviews
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 Books query:', query)
      console.log('📚 Query params:', params)
      console.log('📚 Rows returned:', rows.length)
      
      // Check for Birthday Girl specifically
      const birthdayGirl = rows.find((r: any) => 
        r.title && r.title.toLowerCase().includes('birthday girl')
      )
      if (birthdayGirl) {
        console.log('🎂 Found Birthday Girl:', {
          id: birthdayGirl.id,
          title: birthdayGirl.title,
          my_review: birthdayGirl.my_review,
          review_length: birthdayGirl.my_review?.length || 0,
          review_type: typeof birthdayGirl.my_review,
          review_is_null: birthdayGirl.my_review === null,
          review_is_empty: birthdayGirl.my_review === '',
        })
      }
      
      // Count books with reviews
      const booksWithReviews = rows.filter((r: any) => 
        r.my_review && r.my_review.trim().length > 0
      )
      console.log(`📝 Books with reviews: ${booksWithReviews.length} out of ${rows.length}`)
    }

    // Transform to match frontend expectations
    const transformedRows = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      cover: row.cover_url || null, // Map cover_url to cover
      isbn: row.isbn || null,
      isbn13: row.isbn13 || null,
      rating: row.my_rating || undefined,
      review: row.my_review || null,
    }))

    return NextResponse.json(transformedRows)
  } catch (err: any) {
    console.error('Error fetching books:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch books",
        details: err.message || 'Unknown error',
        code: err.code
      },
      { status: 500 }
    );
  }
}
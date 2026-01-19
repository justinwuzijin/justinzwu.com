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
        date_added
      from books
    `

    const params: any[] = []
    if (dbShelf) {
      query += ` where exclusive_shelf = $1`
      params.push(dbShelf)
    }

    query += ` order by date_added desc nulls last, id desc`

    const { rows } = await pool.query(query, params)

    // Transform to match frontend expectations
    const transformedRows = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      cover: row.cover_url || null, // Map cover_url to cover
      isbn: row.isbn || null,
      isbn13: row.isbn13 || null,
      rating: row.my_rating || undefined,
    }))

    return NextResponse.json(transformedRows)
  } catch (err: any) {
    console.error('Error fetching books:', err);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}
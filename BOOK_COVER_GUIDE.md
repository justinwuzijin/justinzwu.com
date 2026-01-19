# Book Cover Image Generation Guide

## Overview

For fetching book cover images for **existing books**, here are the most efficient approaches:

## 🏆 Recommended Approach: Multi-Source Fallback System

**What I've implemented for you:**

1. **Primary**: Open Library API (by ISBN) - Free, no auth required
2. **Secondary**: GoodReads covers (by GoodReads ID) - Free, no auth
3. **Fallback**: Placeholder service

### Why This Works Best:

- ✅ **Free** - No API keys or costs
- ✅ **Fast** - Direct image URLs, no API calls needed
- ✅ **Reliable** - Multiple fallbacks ensure covers always display
- ✅ **Simple** - Works with your existing ISBN/GoodReads data

---

## 📚 Available Book Cover APIs (Ranked by Efficiency)

### 1. **Open Library Covers API** ⭐ (Currently Used)

**URL Format:**
```
https://covers.openlibrary.org/b/isbn/{ISBN}-{SIZE}.jpg
```

**Sizes:** `S` (small), `M` (medium), `L` (large)

**Pros:**
- ✅ Free, no authentication
- ✅ Direct image URLs (no API calls)
- ✅ Fast CDN delivery
- ✅ Good coverage for books with ISBNs

**Cons:**
- ❌ Requires ISBN (some books don't have one)
- ❌ Not all books have covers

**Example:**
```
https://covers.openlibrary.org/b/isbn/9780143127741-L.jpg
```

---

### 2. **Google Books API** (Alternative)

**URL Format:**
```
https://books.google.com/books/content?id={BOOK_ID}&printsec=frontcover&img=1&zoom=1
```

**Or via API:**
```
https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}
```

**Pros:**
- ✅ Excellent coverage
- ✅ High-quality images
- ✅ Free tier available

**Cons:**
- ❌ Requires API key for production use
- ❌ Requires API call to get book ID first
- ❌ More complex implementation

**Setup:**
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Books API
3. Use in your import script

---

### 3. **GoodReads Covers** (Currently Used as Fallback)

**URL Format:**
```
https://images-na.ssl-images-amazon.com/images/P/{GOODREADS_ID}.01.{SIZE}.jpg
```

**Sizes:** `S`, `M`, `L`, `SY75`, `SY150`, `SY300`

**Pros:**
- ✅ Free, no authentication
- ✅ Direct image URLs
- ✅ Works with GoodReads IDs (which you have)

**Cons:**
- ❌ Amazon CDN (may have rate limits)
- ❌ Not all books have covers

**Example:**
```
https://images-na.ssl-images-amazon.com/images/P/1234567890.01.L.jpg
```

---

### 4. **Internet Archive Book Cover Service**

**URL Format:**
```
https://archive.org/services/img/{IDENTIFIER}
```

**Pros:**
- ✅ Free
- ✅ Good for older/public domain books

**Cons:**
- ❌ Requires identifier lookup
- ❌ Limited to books in Archive.org

---

## 🚀 Implementation Details

### Current Implementation

I've created a `lib/bookCovers.ts` utility that:

1. **Tries ISBN13 first** (most reliable)
2. **Falls back to ISBN10**
3. **Falls back to GoodReads ID**
4. **Finally uses placeholder** if all fail

### How It Works:

```typescript
import { getBookCoverUrl } from '@/lib/bookCovers'

const coverUrl = getBookCoverUrl({
  isbn13: '9780143127741',
  isbn: '0143127748',
  goodreadsId: '1234567890',
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald'
})
```

---

## 🔧 Improving Cover Coverage

### Option 1: Re-run Import with Better Logic

Your import script now uses the improved cover generation. To update existing books:

```sql
-- Update covers for books missing them
UPDATE books 
SET cover_url = (
  SELECT getBookCoverUrl(...) -- You'd need a SQL function or do this in Node
)
WHERE cover_url IS NULL OR cover_url = '';
```

**Better approach:** Re-run your import script - it will update covers automatically.

### Option 2: Add Google Books API (Better Coverage)

If you want even better coverage, add Google Books:

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable Books API → Create credentials

2. **Add to `.env.local`:**
   ```env
   GOOGLE_BOOKS_API_KEY=your_api_key_here
   ```

3. **Update `lib/bookCovers.ts`:**
   ```typescript
   async function getGoogleBooksCover(isbn: string): Promise<string | null> {
     const response = await fetch(
       `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
     )
     const data = await response.json()
     if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
       return data.items[0].volumeInfo.imageLinks.thumbnail
     }
     return null
   }
   ```

**Note:** This requires API calls, so it's slower. Use only as a fallback.

### Option 3: Batch Update Missing Covers

Create a script to update books missing covers:

```typescript
// scripts/update-covers.ts
import pool from '../lib/db'
import { getBookCoverUrl } from '../lib/bookCovers'

async function updateMissingCovers() {
  const { rows } = await pool.query(`
    SELECT id, isbn, isbn13, goodreads_id, title, author, cover_url
    FROM books
    WHERE cover_url IS NULL OR cover_url = '' OR cover_url LIKE '%placeholder%'
  `)

  for (const book of rows) {
    const newCoverUrl = getBookCoverUrl({
      isbn: book.isbn,
      isbn13: book.isbn13,
      goodreadsId: book.goodreads_id,
      title: book.title,
      author: book.author,
    })

    await pool.query(
      'UPDATE books SET cover_url = $1 WHERE id = $2',
      [newCoverUrl, book.id]
    )
    
    console.log(`Updated: ${book.title}`)
  }
}

updateMissingCovers()
```

---

## 📊 Performance Comparison

| Method | Speed | Coverage | Cost | Complexity |
|--------|-------|----------|------|------------|
| Open Library (ISBN) | ⚡⚡⚡ Fast | 70-80% | Free | Simple |
| Google Books API | ⚡⚡ Medium | 90%+ | Free* | Medium |
| GoodReads | ⚡⚡⚡ Fast | 60-70% | Free | Simple |
| Placeholder | ⚡⚡⚡ Instant | 100% | Free | Simple |

*Free tier: 1,000 requests/day

---

## ✅ What's Already Done

1. ✅ Created `lib/bookCovers.ts` with fallback logic
2. ✅ Updated import script to use improved cover generation
3. ✅ Updated API to return `cover` field (mapped from `cover_url`)
4. ✅ Updated BookCard component to handle missing covers
5. ✅ Added error handling for failed image loads

---

## 🎯 Next Steps

1. **Re-run your import script** to update covers:
   ```bash
   bun run import-books /path/to/your/goodreads_export.csv
   ```

2. **Test the bookshelf page** - covers should now load!

3. **Optional: Add Google Books API** if you need better coverage

4. **Monitor coverage** - Check how many books have covers vs placeholders

---

## 🐛 Troubleshooting

### Covers Not Showing?

1. **Check database:**
   ```sql
   SELECT title, cover_url FROM books LIMIT 10;
   ```

2. **Check browser console** for image loading errors

3. **Verify ISBNs exist:**
   ```sql
   SELECT COUNT(*) FROM books WHERE isbn13 IS NOT NULL;
   ```

### Improving Coverage

If many books are missing covers:

1. **Check ISBN quality** - Some CSV exports have malformed ISBNs
2. **Add Google Books API** for better coverage
3. **Manually add covers** for important books via pgAdmin4

---

## 💡 Pro Tips

1. **Use `-L.jpg` suffix** for Open Library (large size) - better quality
2. **Cache cover URLs** in database (already done) - faster than generating each time
3. **Lazy load images** - Next.js Image component already does this
4. **Use placeholder** for missing covers - better UX than broken images

---

## 📝 Summary

**Most Efficient Approach:** ✅ **Multi-source fallback** (already implemented)

- Open Library (ISBN) → GoodReads (ID) → Placeholder
- Fast, free, reliable
- Works with your existing data
- No API keys needed

**For Better Coverage:** Add Google Books API as an additional fallback (optional)

**Current Status:** Your system is ready! Just re-run the import script to populate covers.

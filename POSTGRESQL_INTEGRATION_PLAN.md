# PostgreSQL Integration Plan for Bookshelf

## Overview
Integrate PostgreSQL database to store and manage GoodReads book data, replacing the hardcoded book data in the bookshelf page.

## Step-by-Step Implementation Plan

### Step 1: Install Required Dependencies
**Goal**: Install PostgreSQL client library and CSV parser

```bash
bun add pg @types/pg csv-parse
```

**Files to modify**: `package.json`

---

### Step 2: Set Up Database Connection
**Goal**: Create a database client utility for connecting to PostgreSQL

**Create**: `lib/db.ts`
- Use connection pooling for better performance
- Support both local development and production (via environment variables)
- Handle connection errors gracefully

**Environment Variables Needed**:
- `DATABASE_URL` (PostgreSQL connection string)
- Or individual: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

### Step 3: Design Database Schema
**Goal**: Create a `books` table that matches GoodReads CSV structure + your app needs

**Create**: `lib/migrations/001_create_books_table.sql`

**Suggested Schema**:
```sql
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  goodreads_id VARCHAR(255) UNIQUE,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500),
  isbn VARCHAR(50),
  isbn13 VARCHAR(50),
  cover_url TEXT,
  local_cover_path VARCHAR(500), -- Path to your local cover images
  shelf VARCHAR(50) NOT NULL CHECK (shelf IN ('to read', 'reading', 'read')),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  date_added DATE,
  date_started DATE,
  date_read DATE,
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_shelf ON books(shelf);
CREATE INDEX idx_books_rating ON books(rating);
```

**Note**: Adjust columns based on your actual GoodReads CSV export structure

---

### Step 4: Create Database Migration Script
**Goal**: Script to run migrations and set up the database

**Create**: `scripts/migrate.ts` or `lib/migrate.ts`
- Run SQL migrations
- Can be executed via `bun run migrate` or similar

**Alternative**: Use a migration tool like `node-pg-migrate` or `db-migrate`

---

### Step 5: Create CSV Import Script
**Goal**: Parse GoodReads CSV and insert data into PostgreSQL

**Create**: `scripts/import-books.ts`
- Read CSV file
- Parse each row
- Map GoodReads columns to your database schema
- Insert books into database (handle duplicates)
- Log progress and errors

**Usage**: `bun run scripts/import-books.ts path/to/goodreads-export.csv`

**Key considerations**:
- Handle missing/optional fields
- Map shelf names (GoodReads uses "read", "currently-reading", "to-read")
- Extract cover image URLs or download them
- Handle duplicate books (use `goodreads_id` as unique identifier)

---

### Step 6: Create API Routes for Books
**Goal**: Create Next.js API routes to fetch books from database

**Create**: `app/api/books/route.ts`
- `GET /api/books` - Get all books (with optional query params for filtering)
- Query params: `?shelf=read` to filter by shelf
- Return JSON array of books

**Create**: `app/api/books/[id]/route.ts` (optional)
- `GET /api/books/[id]` - Get single book by ID

**Response format**:
```typescript
{
  id: number;
  title: string;
  author: string;
  cover: string; // URL or local path
  shelf: 'to read' | 'reading' | 'read';
  rating?: number;
  // ... other fields
}
```

---

### Step 7: Update Bookshelf Page to Fetch from API
**Goal**: Replace hardcoded data with API calls

**Modify**: `app/bookshelf/page.tsx`
- Add `useEffect` to fetch books on component mount
- Fetch books for each shelf type
- Handle loading states
- Handle errors
- Group books by shelf client-side or fetch per shelf

**Considerations**:
- Server-side rendering: Could use Server Components (Next.js 13+)
- Or client-side fetching with loading states
- Cache data appropriately

---

### Step 8: Handle Cover Images
**Goal**: Ensure book cover images are accessible

**Options**:
1. **Use GoodReads cover URLs directly** (easiest, but depends on external service)
2. **Download and store locally** (more reliable, requires storage)
3. **Use a book cover API** (Open Library, Google Books, etc.)

**If storing locally**:
- Download covers during CSV import
- Store in `public/assets/book-covers/`
- Update database with local paths

---

### Step 9: Add Environment Configuration
**Goal**: Set up environment variables for different environments

**Create/Update**: `.env.local` (for local development)
```
DATABASE_URL=postgresql://user:password@localhost:5432/justinzwu_books
```

**For Production** (Vercel/other hosting):
- Set environment variables in hosting platform
- Use connection pooling (e.g., Vercel Postgres, Supabase, Neon)

---

### Step 10: Testing & Validation
**Goal**: Ensure everything works correctly

**Test checklist**:
- [ ] Database connection works
- [ ] CSV import successfully inserts books
- [ ] API routes return correct data
- [ ] Bookshelf page displays books correctly
- [ ] Filtering by shelf works
- [ ] Star ratings display for "read" shelf
- [ ] Cover images load correctly
- [ ] Error handling works (no DB connection, empty results, etc.)

---

## Recommended Database Hosting Options

### For Development:
- **Local PostgreSQL**: Install PostgreSQL locally
- **Docker**: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

### For Production:
1. **Vercel Postgres** (if hosting on Vercel) - Easy integration
2. **Supabase** - Free tier, good for small projects
3. **Neon** - Serverless Postgres, good performance
4. **Railway** - Simple setup
5. **AWS RDS** - More complex, but scalable

---

## File Structure After Implementation

```
justinzwu/
├── lib/
│   ├── db.ts                    # Database connection
│   ├── migrations/
│   │   └── 001_create_books_table.sql
│   └── migrate.ts               # Migration runner
├── scripts/
│   └── import-books.ts          # CSV import script
├── app/
│   ├── api/
│   │   └── books/
│   │       ├── route.ts         # GET /api/books
│   │       └── [id]/
│   │           └── route.ts     # GET /api/books/[id] (optional)
│   └── bookshelf/
│       └── page.tsx             # Updated to fetch from API
├── .env.local                   # Local environment variables
└── .env.example                 # Example env file
```

---

## Next Steps After Basic Implementation

1. **Add search/filter functionality** (by author, title, rating)
2. **Add pagination** for large book collections
3. **Add book details page** (click on book to see full details)
4. **Add ability to update ratings** from the UI
5. **Add ability to move books between shelves** from the UI
6. **Add statistics** (total books read, average rating, etc.)

---

## Questions to Consider

1. **What columns does your GoodReads CSV export contain?**
   - This will determine the exact schema mapping

2. **Do you want to store cover images locally or use URLs?**
   - Local storage is more reliable but requires more setup

3. **How many books are in your GoodReads library?**
   - This affects pagination needs

4. **Do you want to sync with GoodReads periodically, or one-time import?**
   - One-time is simpler, periodic sync requires more work

5. **Where are you hosting the site?**
   - This determines which database hosting option is best

---

## Quick Start Commands

Once you have PostgreSQL set up:

```bash
# 1. Install dependencies (already done)
# bun add pg @types/pg csv-parse

# 2. Set up environment variables
# Create .env.local in the justinzwu/ directory with:
# DATABASE_URL=postgresql://user:password@localhost:5432/justinzwu_books

# 3. Run migrations
bun run migrate

# 4. Import CSV
bun run import-books /path/to/goodreads_library_export.csv

# 5. Start dev server
bun run dev
```

## Implementation Status

✅ **Completed:**
1. ✅ Installed dependencies (`pg`, `csv-parse`, `@types/pg`)
2. ✅ Created database connection utility (`lib/db.ts`)
3. ✅ Created database schema (`lib/migrations/001_create_books_table.sql`)
4. ✅ Created migration script (`scripts/migrate.ts`)
5. ✅ Created CSV import script (`scripts/import-books.ts`)
6. ✅ Created API route (`app/api/books/route.ts`)
7. ✅ Updated bookshelf page to fetch from API (`app/bookshelf/page.tsx`)
8. ✅ Added npm scripts for migrations and imports

## Next Steps for You

1. **Set up PostgreSQL database:**
   - Install PostgreSQL locally, OR
   - Use a cloud service (Supabase, Neon, Railway, Vercel Postgres)
   - Create a database named `justinzwu_books` (or your preferred name)

2. **Configure environment variables:**
   - Create `.env.local` in the `justinzwu/` directory
   - Add: `DATABASE_URL=postgresql://user:password@localhost:5432/justinzwu_books`
   - Replace with your actual database credentials

3. **Run the migration:**
   ```bash
   cd justinzwu
   bun run migrate
   ```

4. **Import your GoodReads CSV:**
   ```bash
   bun run import-books /Users/justinwu/Desktop/goodreads_library_export.csv
   ```

5. **Test the bookshelf page:**
   - Start the dev server: `bun run dev`
   - Navigate to `/bookshelf`
   - Click on a shelf tab to see books load from the database

## Notes

- The import script automatically generates cover URLs using Open Library API based on ISBN
- Books are stored with their GoodReads ID as a unique identifier
- Shelf names are mapped: `to-read` → `to read`, `currently-reading` → `reading`, `read` → `read`
- The API route supports filtering by shelf: `/api/books?shelf=read`
- Books are cached per shelf in the frontend to avoid unnecessary API calls

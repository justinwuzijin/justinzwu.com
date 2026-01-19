# Troubleshooting: Books API Failed to Load

## Quick Fixes

### 1. Check if `.env.local` exists and has DATABASE_URL

**Location:** `/Users/justinwu/Cursor/justinzwu.com/justinzwu/.env.local`

**Required content:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/justinzwu_books
```

**To create it:**
1. Navigate to the `justinzwu` folder
2. Create a file named `.env.local` (starts with a dot!)
3. Add your DATABASE_URL (see PostgreSQL tutorial for how to find it)

### 2. Verify Database Connection

**Test in pgAdmin4:**
1. Open pgAdmin4
2. Connect to your PostgreSQL server
3. Expand `Databases` → `justinzwu_books`
4. Right-click `books` table → **View/Edit Data** → **All Rows**
5. You should see your books!

**Test via terminal:**
```bash
cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
bun run migrate
```

If this works, your connection is good!

### 3. Check if Books Table Exists

**In pgAdmin4:**
1. Expand `justinzwu_books` → `Schemas` → `public` → `Tables`
2. You should see a `books` table
3. If not, run: `bun run migrate`

### 4. Check if Books Were Imported

**In pgAdmin4 Query Tool:**
```sql
SELECT COUNT(*) FROM books;
```

If this returns 0, you need to import your books:
```bash
bun run import-books /path/to/your/goodreads_export.csv
```

### 5. Restart Dev Server

After creating/updating `.env.local`:
```bash
# Stop the server (Ctrl+C)
# Then restart:
cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
bun run dev
```

**Important:** Next.js only reads `.env.local` on startup!

### 6. Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for specific error messages
- Check Network tab → see if `/api/books` request failed
- Check the error response for details

### 7. Check Server Logs

In your terminal where `bun run dev` is running:
- Look for error messages
- Check for "DATABASE_URL is not configured" message
- Look for PostgreSQL connection errors

## Common Errors

### Error: "Database connection not configured"
**Cause:** `.env.local` file missing or DATABASE_URL not set
**Fix:** Create `.env.local` with DATABASE_URL (see step 1)

### Error: "password authentication failed"
**Cause:** Wrong password in DATABASE_URL
**Fix:** Update password in `.env.local` to match your PostgreSQL password

### Error: "relation 'books' does not exist"
**Cause:** Migration not run
**Fix:** Run `bun run migrate`

### Error: "could not connect to server"
**Cause:** PostgreSQL not running
**Fix:** 
- macOS: `brew services start postgresql@18`
- Check pgAdmin4 can connect

### Error: "port 5432" or "port 5433"
**Cause:** Wrong port in DATABASE_URL
**Fix:** 
- PostgreSQL 18 might use port 5433
- Check in pgAdmin4: Server Properties → Connection → Port
- Update DATABASE_URL accordingly

## Step-by-Step Debugging

1. **Verify `.env.local` exists:**
   ```bash
   ls -la justinzwu/.env.local
   ```

2. **Check DATABASE_URL format:**
   ```bash
   cat justinzwu/.env.local
   ```
   Should look like: `DATABASE_URL=postgresql://user:pass@host:port/db`

3. **Test database connection:**
   ```bash
   cd justinzwu
   bun run migrate
   ```

4. **Check if books exist:**
   - In pgAdmin4, query: `SELECT COUNT(*) FROM books;`

5. **Test API directly:**
   ```bash
   # Start dev server
   bun run dev
   
   # In another terminal, test API:
   curl http://localhost:3000/api/books?shelf=read
   ```

6. **Check API response:**
   - Should return JSON array of books
   - If error, check the error message

## Still Not Working?

1. **Check PostgreSQL is running:**
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Should show "started" status
   ```

2. **Verify database name matches:**
   - In pgAdmin4, check your database name
   - Make sure it matches DATABASE_URL in `.env.local`

3. **Check user permissions:**
   - In pgAdmin4, verify your PostgreSQL user can access the database
   - Right-click database → Properties → Security

4. **Try connecting directly:**
   ```bash
   psql -U postgres -d justinzwu_books
   # If this works, your connection is good
   ```

## Quick Test Script

Create `test-db.ts` in `justinzwu/scripts/`:

```typescript
import pool from '../lib/db'

async function test() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM books')
    console.log('✅ Connection successful!')
    console.log(`📚 Books in database: ${result.rows[0].count}`)
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    process.exit(1)
  }
}

test()
```

Run: `bun run scripts/test-db.ts`

## Need More Help?

Check:
1. PostgreSQL tutorial: `POSTGRESQL_TUTORIAL.md`
2. Book cover guide: `BOOK_COVER_GUIDE.md`
3. Server logs for specific error messages
4. Browser console for frontend errors

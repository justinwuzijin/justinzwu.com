# PostgreSQL Setup Tutorial with pgAdmin4

This tutorial will guide you through setting up PostgreSQL for your bookshelf project using pgAdmin4.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installing PostgreSQL and pgAdmin4](#installing-postgresql-and-pgadmin4)
3. [Setting Up Your Database](#setting-up-your-database)
4. [Creating the Database Connection](#creating-the-database-connection)
5. [Running Migrations](#running-migrations)
6. [Importing Your GoodReads CSV](#importing-your-goodreads-csv)
7. [Testing the Connection](#testing-the-connection)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- PostgreSQL installed on your system
- pgAdmin4 installed and running
- Your GoodReads CSV export file ready
- Terminal/Command line access

---

## Step 1: Installing PostgreSQL and pgAdmin4

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# pgAdmin4 is usually installed with PostgreSQL, or download from:
# https://www.pgadmin.org/download/
```

### Windows

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, make sure to install pgAdmin4
4. Remember the password you set for the `postgres` user (you'll need this!)

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo apt install pgadmin4
```

---

## Step 2: Setting Up Your Database

### 2.1 Launch pgAdmin4

1. Open pgAdmin4 from your applications
2. You'll be prompted to set a master password (save this securely)
3. pgAdmin4 will open in your browser

### 2.2 Connect to PostgreSQL Server

1. In the left sidebar, you'll see **Servers**
2. Click on **Servers** → **PostgreSQL 16** (or your version)
3. If it asks for a password, enter the password you set during PostgreSQL installation
4. The server should expand showing **Databases**, **Login/Group Roles**, etc.

### 2.3 Create a New Database

1. Right-click on **Databases** in the left sidebar
2. Select **Create** → **Database...**
3. In the **Create - Database** dialog:
   - **Database name**: `justinzwu_books` (or your preferred name)
   - **Owner**: Leave as `postgres` (or select your user)
   - **Encoding**: `UTF8` (default)
   - Click **Save**

4. You should now see `justinzwu_books` in your Databases list!

---

## Step 3: Creating the Database Connection

### 3.1 Get Your Connection Details

In pgAdmin4:

1. Right-click on your `justinzwu_books` database
2. Select **Properties**
3. Note down:
   - **Host**: Usually `localhost` or `127.0.0.1`
   - **Port**: Usually `5432` (default PostgreSQL port)
   - **Database**: `justinzwu_books`
   - **Username**: Usually `postgres` (or your PostgreSQL username)
   - **Password**: The password you set during PostgreSQL installation

### 3.2 Create Environment Variable File

1. Navigate to your project directory:
   ```bash
   cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
   ```

2. Create a `.env.local` file:
   ```bash
   touch .env.local
   ```

3. Open `.env.local` in your editor and add:

   ```env
   # PostgreSQL Database Connection
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/justinzwu_books
   ```

   **Replace:**
   - `postgres` with your PostgreSQL username (if different)
   - `YOUR_PASSWORD` with your actual PostgreSQL password
   - `localhost` with your host (if different)
   - `5432` with your port (if different)
   - `justinzwu_books` with your database name (if different)

   **Example:**
   ```env
   DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/justinzwu_books
   ```

### 3.3 Security Note

⚠️ **Important**: Never commit `.env.local` to git! It contains sensitive credentials.

Make sure `.env.local` is in your `.gitignore` file.

---

## Step 4: Running Migrations

Migrations create the database tables and structure needed for your books.

### 4.1 Verify Your Connection

First, let's test that your connection works:

1. In pgAdmin4, expand your `justinzwu_books` database
2. Expand **Schemas** → **public**
3. You should see **Tables** (currently empty)

### 4.2 Run the Migration Script

1. Open your terminal
2. Navigate to your project:
   ```bash
   cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
   ```

3. Run the migration:
   ```bash
   bun run migrate
   ```

   You should see:
   ```
   Running database migrations...
   ✅ Migration completed successfully!
   ```

### 4.3 Verify Tables Were Created

1. In pgAdmin4, refresh your database (right-click → **Refresh**)
2. Expand **Schemas** → **public** → **Tables**
3. You should now see a `books` table!

4. Right-click on `books` → **View/Edit Data** → **All Rows**
   - It should be empty for now (we'll import data next)

---

## Step 5: Importing Your GoodReads CSV

### 5.1 Prepare Your CSV File

Make sure your GoodReads CSV export is accessible. The file should be named something like:
- `goodreads_library_export.csv`
- Located at: `/Users/justinwu/Desktop/goodreads_library_export.csv`

### 5.2 Run the Import Script

1. In your terminal, navigate to your project:
   ```bash
   cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
   ```

2. Run the import script:
   ```bash
   bun run import-books /Users/justinwu/Desktop/goodreads_library_export.csv
   ```

   You should see progress output like:
   ```
   Reading CSV file: /Users/justinwu/Desktop/goodreads_library_export.csv
   Found 123 books to import
   Progress: 10/123
   Progress: 20/123
   ...
   ✅ Import completed!
      Imported: 120 books
      Updated: 3 books
      Errors: 0 books
   ```

### 5.3 Verify Data Was Imported

1. In pgAdmin4, right-click on the `books` table
2. Select **View/Edit Data** → **All Rows**
3. You should see all your books with their data!

4. You can also run a query to check:
   - Click on **Tools** → **Query Tool**
   - Enter:
     ```sql
     SELECT COUNT(*) FROM books;
     ```
   - Click the execute button (▶️) or press F5
   - You should see the total number of books

5. Try filtering by shelf:
   ```sql
   SELECT title, author, exclusive_shelf, my_rating 
   FROM books 
   WHERE exclusive_shelf = 'read' 
   LIMIT 10;
   ```

---

## Step 6: Testing the Connection

### 6.1 Test via API

1. Start your Next.js dev server:
   ```bash
   cd /Users/justinwu/Cursor/justinzwu.com/justinzwu
   bun run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api/books?shelf=read
   ```

3. You should see JSON data with your books!

### 6.2 Test on Bookshelf Page

1. Navigate to:
   ```
   http://localhost:3000/bookshelf
   ```

2. Click on a shelf tab (e.g., "read")
3. Your books should load from the database!

---

## Step 7: Common Operations in pgAdmin4

### Viewing Data

- **View all rows**: Right-click table → **View/Edit Data** → **All Rows**
- **Filter rows**: Use the filter icon in the data viewer
- **Sort**: Click column headers to sort

### Running Queries

1. Click **Tools** → **Query Tool**
2. Enter your SQL query
3. Press F5 or click the execute button (▶️)

**Useful Queries:**

```sql
-- Count books by shelf
SELECT exclusive_shelf, COUNT(*) 
FROM books 
GROUP BY exclusive_shelf;

-- Find books with ratings
SELECT title, author, my_rating 
FROM books 
WHERE my_rating IS NOT NULL 
ORDER BY my_rating DESC;

-- Find recently read books
SELECT title, author, date_read 
FROM books 
WHERE date_read IS NOT NULL 
ORDER BY date_read DESC 
LIMIT 10;
```

### Editing Data

1. Right-click table → **View/Edit Data** → **All Rows**
2. Click on any cell to edit
3. Press Enter to save
4. Click the save icon (💾) to commit changes

### Backing Up Your Database

1. Right-click on `justinzwu_books` database
2. Select **Backup...**
3. Choose:
   - **Filename**: `justinzwu_books_backup.sql`
   - **Format**: `Plain` or `Custom`
   - Click **Backup**

### Restoring from Backup

1. Right-click on `justinzwu_books` database
2. Select **Restore...**
3. Choose your backup file
4. Click **Restore**

---

## Troubleshooting

### Connection Issues

**Error: "password authentication failed"**
- Double-check your password in `.env.local`
- Try resetting PostgreSQL password:
  ```bash
  # macOS/Linux
  psql postgres
  ALTER USER postgres PASSWORD 'newpassword';
  ```

**Error: "could not connect to server"**
- Make sure PostgreSQL is running:
  ```bash
  # macOS
  brew services list
  brew services start postgresql@16
  
  # Linux
  sudo systemctl status postgresql
  sudo systemctl start postgresql
  ```

**Error: "database does not exist"**
- Verify the database name in pgAdmin4
- Check your `.env.local` file matches exactly

### Migration Issues

**Error: "relation already exists"**
- The table already exists. You can either:
  1. Drop and recreate (⚠️ deletes all data):
     ```sql
     DROP TABLE IF EXISTS books CASCADE;
     ```
     Then run `bun run migrate` again
  
  2. Or skip migration if table structure is correct

**Error: "permission denied"**
- Make sure your PostgreSQL user has proper permissions
- In pgAdmin4: Right-click database → **Properties** → **Security** → Grant privileges

### Import Issues

**Error: "duplicate key value violates unique constraint"**
- This means books already exist. The script handles this by updating existing records.
- If you want to start fresh:
  ```sql
  TRUNCATE TABLE books;
  ```
  Then run import again

**Error: "invalid date format"**
- Check your CSV date format (should be YYYY/MM/DD)
- The script handles empty dates, but malformed dates might cause issues

**Cover images not showing**
- The script generates cover URLs from ISBN using Open Library
- Some books might not have ISBNs, so covers won't be available
- You can manually update cover URLs in pgAdmin4 if needed

### API Issues

**Error: "Failed to fetch books"**
- Check that your `.env.local` file exists and has correct `DATABASE_URL`
- Restart your dev server after changing `.env.local`
- Check terminal for database connection errors

**Empty results**
- Verify data exists in pgAdmin4
- Check the shelf parameter matches database values:
  - `to-read` (not `to read`)
  - `currently-reading` (not `reading`)
  - `read`

---

## Quick Reference: Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/justinzwu_books
```

**Breaking it down:**
- `postgresql://` - Protocol
- `postgres` - Username
- `mypassword` - Password
- `localhost` - Host (server address)
- `5432` - Port
- `justinzwu_books` - Database name

---

## Next Steps

Once everything is working:

1. ✅ Your bookshelf page should load books from the database
2. ✅ Books are organized by shelf (to read, reading, read)
3. ✅ Ratings show for books you've read
4. ✅ Cover images load from Open Library

**Future Enhancements:**
- Add search functionality
- Add ability to update ratings from the UI
- Add ability to move books between shelves
- Add statistics (total books read, average rating, etc.)

---

## Getting Help

If you encounter issues:

1. Check the terminal/console for error messages
2. Verify your `.env.local` file is correct
3. Test the connection in pgAdmin4 first
4. Check that PostgreSQL is running
5. Review the Troubleshooting section above

**Useful Resources:**
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin4 Documentation: https://www.pgadmin.org/docs/
- Node.js pg library: https://node-postgres.com/

---

## Summary Checklist

- [ ] PostgreSQL and pgAdmin4 installed
- [ ] Database `justinzwu_books` created
- [ ] `.env.local` file created with `DATABASE_URL`
- [ ] Migration run successfully (`bun run migrate`)
- [ ] Books imported from CSV (`bun run import-books`)
- [ ] Data verified in pgAdmin4
- [ ] API endpoint tested (`/api/books?shelf=read`)
- [ ] Bookshelf page displays books correctly

Once all checkboxes are complete, you're all set! 🎉

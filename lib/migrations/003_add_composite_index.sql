-- Add composite index for optimized querying by shelf and date
-- This improves performance when filtering by exclusive_shelf and ordering by date_added

CREATE INDEX IF NOT EXISTS idx_books_shelf_date_id 
ON books(exclusive_shelf, date_added DESC NULLS LAST, id DESC);

-- This index supports queries like:
-- SELECT * FROM books WHERE exclusive_shelf = 'read' ORDER BY date_added DESC NULLS LAST, id DESC;

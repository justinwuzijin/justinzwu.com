-- Set schema
SET search_path TO public;

-- Add synopsis column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS synopsis TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_books_synopsis ON books(id) WHERE synopsis IS NOT NULL;

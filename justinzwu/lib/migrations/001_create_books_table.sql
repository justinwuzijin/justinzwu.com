-- Create books table matching GoodReads CSV structure
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500),
  author_lf VARCHAR(500),
  additional_authors TEXT,
  isbn VARCHAR(50),
  isbn13 VARCHAR(50),
  my_rating INTEGER CHECK (my_rating >= 0 AND my_rating <= 5),
  average_rating DECIMAL(3, 2),
  publisher VARCHAR(500),
  binding VARCHAR(100),
  number_of_pages INTEGER,
  year_published INTEGER,
  original_publication_year INTEGER,
  date_read DATE,
  date_added DATE,
  bookshelves TEXT,
  bookshelves_with_positions TEXT,
  exclusive_shelf VARCHAR(50) NOT NULL CHECK (exclusive_shelf IN ('read', 'currently-reading', 'to-read')),
  my_review TEXT,
  spoiler BOOLEAN DEFAULT FALSE,
  private_notes TEXT,
  read_count INTEGER DEFAULT 0,
  owned_copies INTEGER DEFAULT 0,
  cover_url TEXT,
  local_cover_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add goodreads_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'goodreads_id') THEN
    ALTER TABLE books ADD COLUMN goodreads_id VARCHAR(255);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_books_goodreads_id_unique ON books(goodreads_id) WHERE goodreads_id IS NOT NULL;
  END IF;
END $$;

-- Create indexes for better query performance (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'exclusive_shelf') THEN
    CREATE INDEX IF NOT EXISTS idx_books_exclusive_shelf ON books(exclusive_shelf);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'my_rating') THEN
    CREATE INDEX IF NOT EXISTS idx_books_my_rating ON books(my_rating);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'date_read') THEN
    CREATE INDEX IF NOT EXISTS idx_books_date_read ON books(date_read);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'date_added') THEN
    CREATE INDEX IF NOT EXISTS idx_books_date_added ON books(date_added);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'goodreads_id') THEN
    CREATE INDEX IF NOT EXISTS idx_books_goodreads_id ON books(goodreads_id);
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

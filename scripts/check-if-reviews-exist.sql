-- Quick check: Do any reviews exist?
SELECT 
  COUNT(*) FILTER (WHERE my_review IS NOT NULL AND my_review != '') as books_with_reviews
FROM books;

-- See all books that HAVE reviews
SELECT id, title, author, 
       LENGTH(my_review) as review_length,
       LEFT(my_review, 100) as review_preview
FROM books
WHERE my_review IS NOT NULL AND my_review != ''
ORDER BY id DESC;

-- Check if "Birthday Girl" has a review
SELECT 
  title,
  CASE 
    WHEN my_review IS NULL THEN 'NO REVIEW (NULL)'
    WHEN my_review = '' THEN 'NO REVIEW (EMPTY STRING)'
    ELSE CONCAT('HAS REVIEW (', LENGTH(my_review), ' characters)')
  END as review_status,
  LEFT(my_review, 200) as review_preview
FROM books
WHERE LOWER(title) LIKE '%birthday girl%';

-- Count reviews by shelf
SELECT 
  exclusive_shelf,
  COUNT(*) as total_books,
  COUNT(*) FILTER (WHERE my_review IS NOT NULL AND my_review != '') as books_with_reviews
FROM books
GROUP BY exclusive_shelf
ORDER BY exclusive_shelf;

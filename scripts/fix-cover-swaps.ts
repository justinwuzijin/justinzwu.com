import pool from '../lib/db'

async function fixCoverSwaps() {
  try {
    console.log('🔄 Fixing book cover mismatches...\n')

    // 1. Get Convenience Store Woman and Psychology of Money
    const swap1Result = await pool.query(`
      SELECT id, title, cover_url FROM books 
      WHERE title IN ('Convenience Store Woman', 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness')
      ORDER BY title
    `)
    
    if (swap1Result.rows.length === 2) {
      const [convenienceStore, psychologyOfMoney] = swap1Result.rows
      console.log('1️⃣ Swapping covers:')
      console.log(`   "${convenienceStore.title}" <-> "${psychologyOfMoney.title}"`)
      
      // Swap the covers
      await pool.query(
        'UPDATE books SET cover_url = $1 WHERE id = $2',
        [psychologyOfMoney.cover_url, convenienceStore.id]
      )
      await pool.query(
        'UPDATE books SET cover_url = $1 WHERE id = $2',
        [convenienceStore.cover_url, psychologyOfMoney.id]
      )
      console.log('   ✅ Swapped!\n')
    }

    // 2. Fix Thus Spoke Zarathustra, Kite Runner, and Golden Son
    const swap2Result = await pool.query(`
      SELECT id, title, cover_url FROM books 
      WHERE title IN ('Thus Spoke Zarathustra', 'The Kite Runner with Myreadinglab Access Code', 'Golden Son (Red Rising Saga, #2)')
      ORDER BY title
    `)
    
    if (swap2Result.rows.length === 3) {
      console.log('2️⃣ Fixing 3-way cover swap:')
      const books = swap2Result.rows
      const golden = books.find(b => b.title.includes('Golden Son'))
      const kite = books.find(b => b.title.includes('Kite Runner'))
      const zarathustra = books.find(b => b.title.includes('Zarathustra'))
      
      if (golden && kite && zarathustra) {
        console.log(`   Found all 3 books:`)
        console.log(`   - "${zarathustra.title}"`)
        console.log(`   - "${golden.title}"`)
        console.log(`   - "${kite.title}"`)
        
        // Current state (from user):
        // - Zarathustra shows Kite Runner cover
        // - Golden Son shows Zarathustra cover
        // - Kite Runner (assumed correct, but actually has Golden's cover)
        
        // Save current covers
        const zarathustraCurrent = zarathustra.cover_url // Has Kite's cover
        const goldenCurrent = golden.cover_url // Has Zarathustra's cover
        const kiteCurrent = kite.cover_url // Has Golden's cover
        
        // Correct rotation:
        // Zarathustra should get Golden's current (which is Zarathustra's real cover)
        // Golden should get Kite's current (which is Golden's real cover)
        // Kite should get Zarathustra's current (which is Kite's real cover)
        
        await pool.query('UPDATE books SET cover_url = $1 WHERE id = $2', [goldenCurrent, zarathustra.id])
        await pool.query('UPDATE books SET cover_url = $1 WHERE id = $2', [kiteCurrent, golden.id])
        await pool.query('UPDATE books SET cover_url = $1 WHERE id = $2', [zarathustraCurrent, kite.id])
        
        console.log('   ✅ Fixed!\n')
      } else {
        console.log('   ⚠️ Could not find all 3 books')
      }
    }

    // 3. Get Braiding Sweetgrass and Kokoro
    const swap3Result = await pool.query(`
      SELECT id, title, cover_url FROM books 
      WHERE title IN ('Braiding Sweetgrass: Indigenous Wisdom, Scientific Knowledge, and the Teachings of Plants', 'Kokoro')
      ORDER BY title
    `)
    
    if (swap3Result.rows.length === 2) {
      const [braiding, kokoro] = swap3Result.rows
      console.log('3️⃣ Swapping covers:')
      console.log(`   "${braiding.title}" <-> "${kokoro.title}"`)
      
      // Swap the covers
      await pool.query(
        'UPDATE books SET cover_url = $1 WHERE id = $2',
        [kokoro.cover_url, braiding.id]
      )
      await pool.query(
        'UPDATE books SET cover_url = $1 WHERE id = $2',
        [braiding.cover_url, kokoro.id]
      )
      console.log('   ✅ Swapped!\n')
    }

    console.log('🎉 All cover swaps completed!')
    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error)
    await pool.end()
    process.exit(1)
  }
}

fixCoverSwaps()

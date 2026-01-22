import { NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API endpoint to generate book synopsis using Google Gemini
 * Caches synopses in database for faster subsequent loads
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('id');
    const title = searchParams.get('title');
    const author = searchParams.get('author');

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    // Check if synopsis already exists in database
    if (bookId) {
      try {
        const { rows } = await pool.query(
          'SELECT synopsis FROM books WHERE id = $1',
          [bookId]
        );
        
        if (rows[0]?.synopsis) {
          console.log(`✅ [Synopsis Cache] Found cached synopsis for book ID ${bookId}`);
          return NextResponse.json({ synopsis: rows[0].synopsis, cached: true });
        }
      } catch (dbError) {
        console.warn('⚠️ [Synopsis Cache] Database check failed:', dbError);
        // Continue to generate if DB check fails
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing from environment variables');
      return NextResponse.json(
        { error: "Gemini API key not configured in .env.local" },
        { status: 500 }
      );
    }

    // Test API key first - try listing models and then test with a simple model
    console.log('🔑 [Gemini API] Testing API key...');
    try {
      // First, try to list available models to verify API key
      const listModelsResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      
      if (listModelsResponse.ok) {
        const modelsData = await listModelsResponse.json();
        console.log('✅ [Gemini API] API key is valid. Available models:', 
          modelsData.models?.map((m: any) => m.name).join(', ') || 'none listed');
      } else {
        const listError = await listModelsResponse.text();
        console.warn('⚠️ [Gemini API] Could not list models:', listError);
      }
      
      // Try a simple test with the most basic model name
      const testModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      let testPassed = false;
      
      for (const testModel of testModels) {
        try {
          const testResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${testModel}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: 'Say "API key works"'
                  }]
                }]
              }),
            }
          );

          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log(`✅ [Gemini API] API key is valid and working with ${testModel}`);
            testPassed = true;
            break;
          }
        } catch (e) {
          // Try next model
          continue;
        }
      }
      
      if (!testPassed) {
        console.warn('⚠️ [Gemini API] Could not test with common models, but API key may still be valid');
      }
    } catch (error: any) {
      console.error('❌ [Gemini API] API key test error:', error.message);
      // Don't fail here - continue and let the actual request try
    }

    // Call Gemini API
    const prompt = `Please search the web and find information about the book "${title}" by ${author}. After gathering the data, provide a brief synopsis in a maximum of 3 sentences. Keep it concise and informative.`;

    // Comprehensive model fallback list - start with basic v1 models, then try v1beta with grounding
    const modelsToTry = [
      // Start with basic models that should definitely work
      { model: 'gemini-pro', version: 'v1', tool: null },
      { model: 'gemini-1.5-pro', version: 'v1', tool: null },
      { model: 'gemini-1.5-flash', version: 'v1', tool: null },
      // Then try v1beta models with grounding support
      { model: 'gemini-2.5-flash', version: 'v1beta', tool: 'google_search' },
      { model: 'gemini-1.5-flash', version: 'v1beta', tool: 'google_search_retrieval' },
      { model: 'gemini-1.5-pro', version: 'v1beta', tool: 'google_search_retrieval' },
    ];

    console.log(`🔍 [Gemini API] Requesting synopsis for: "${title}" by ${author}`);
    
    let lastError: any = null;
    
    for (const { model, version, tool } of modelsToTry) {
      try {
        console.log(`🤖 [Gemini API] Attempting model: ${model} (${version})...`);
        
        // Build request body - include tools only if tool is specified
        const requestBody: any = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        };
        
        // Only add tools if tool is specified (not null)
        if (tool) {
          requestBody.tools = [{
            [tool]: {}
          }];
        }
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let synopsis = data.candidates[0].content.parts[0].text;
            
            // Clean up common AI-generated prefixes
            const prefixPatterns = [
              // Remove everything up to and including the first occurrence of these phrases
              /^(?:Okay,?\s+)?(?:I have searched the web for information about|after searching the web,|based on (?:web searches|information gathered)|gleaned from web research).+?(?:\.|,)\s*(?:Here'?s?|Alright,? here'?s?)\s+a\s+(?:concise|brief)\s+synopsis(?:\s+of\s+.+?)?:\s*/is,
              /^Okay,?\s+(?:after searching the web,?\s+)?here'?s?\s+a\s+(?:concise|brief)\s+synopsis\s+of\s+.+?(?:,\s+based on information gathered from (?:across )?the web)?\s*:\s*/is,
              /^Okay,?\s+I'?ve\s+searched\s+the\s+web\s+and\s+gathered\s+information\s+about\s+.+?\.\s*(?:Here'?s?\s+a\s+(?:concise|brief)\s+synopsis:\s*)?/is,
              /^Here'?s?\s+a\s+(?:concise|brief)\s+synopsis(?:\s+of\s+.+?)?,?\s+(?:based on|compiled from)\s+(?:information gathered|widely available information|various sources)(?:\s+(?:from\s+)?(?:across|on)\s+the\s+web)?\s*:\s*/is,
              /^Alright,?\s+here'?s?\s+a\s+(?:concise|brief)\s+synopsis\s+of\s+.+?,?\s+based on\s+.+?\s*:\s*/is,
              /^Here'?s?\s+a\s+(?:concise|brief)\s+synopsis:\s*/i,
              /^Here'?s?\s+a\s+summary\s+of\s+.+?:\s*/i,
            ];
            
            for (const pattern of prefixPatterns) {
              synopsis = synopsis.replace(pattern, '').trim();
            }
            
            console.log(`✅ [Gemini API] Success using ${model}`);
            
            // Save synopsis to database if bookId is provided
            if (bookId) {
              try {
                await pool.query(
                  'UPDATE books SET synopsis = $1 WHERE id = $2',
                  [synopsis, bookId]
                );
                console.log(`💾 [Synopsis Cache] Saved synopsis for book ID ${bookId}`);
              } catch (saveError) {
                console.warn('⚠️ [Synopsis Cache] Failed to save to database:', saveError);
                // Don't fail the request if save fails
              }
            }
            
            return NextResponse.json({ synopsis, cached: false });
          }
        } else {
          const errorData = await response.text();
          console.warn(`⚠️ [Gemini API] Model ${model} failed with status ${response.status}:`, errorData);
          lastError = errorData;
          continue;
        }
      } catch (error: any) {
        console.error(`❌ [Gemini API] Fetch error for ${model}:`, error.message);
        lastError = error.message;
        continue;
      }
    }

    // If all models failed, return the last error
    console.error('All Gemini models failed. Last error:', lastError);
    let errorMessage = "Failed to generate synopsis";
    try {
      const errorJson = JSON.parse(lastError);
      errorMessage = errorJson.error?.message || errorMessage;
    } catch (e) {
      errorMessage = lastError || errorMessage;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Synopsis generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 }
    );
  }
}

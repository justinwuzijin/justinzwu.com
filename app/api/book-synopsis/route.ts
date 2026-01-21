import { NextResponse } from "next/server";

/**
 * API endpoint to generate book synopsis using Google Gemini
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const author = searchParams.get('author');

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing from environment variables');
      return NextResponse.json(
        { error: "Gemini API key not configured in .env.local" },
        { status: 500 }
      );
    }

    // Call Gemini API
    const prompt = `Write a brief 5-sentence synopsis of the book "${title}" by ${author}. Keep it concise and informative.`;

    // Comprehensive model fallback list - prioritizing v1beta for better model coverage
    const modelsToTry = [
      { model: 'gemini-1.5-flash', version: 'v1beta' },
      { model: 'gemini-1.5-pro', version: 'v1beta' },
      { model: 'gemini-pro', version: 'v1beta' },
      { model: 'gemini-1.5-flash', version: 'v1' },
    ];

    let lastError: any = null;
    
    for (const { model, version } of modelsToTry) {
      try {
        console.log(`🤖 Attempting synopsis with ${model} (${version})...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const synopsis = data.candidates[0].content.parts[0].text;
            console.log(`✅ Synopsis generated successfully using ${model}`);
            return NextResponse.json({ synopsis });
          }
        } else {
          const errorData = await response.text();
          console.warn(`⚠️  Model ${model} failed:`, errorData);
          lastError = errorData;
          continue;
        }
      } catch (error: any) {
        console.warn(`⚠️  Error with model ${model}:`, error.message);
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

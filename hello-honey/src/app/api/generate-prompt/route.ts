import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { traits } = await req.json();

    if (!traits || !Array.isArray(traits) || traits.length === 0) {
      return NextResponse.json(
        { error: 'Traits are required' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `You are a creative AI assistant specializing in character design for the "Hello Honey" universe. 
      Your task is to create vivid, detailed image generation prompts for cute, anime-style bee characters.
      Focus on visual details, clothing, expressions, and magical/fantasy elements that bring the character to life.
      The style should be kawaii/cute anime with bright, cheerful colors.`,
      prompt: `Create a detailed image generation prompt for a Hello Honey bee character with these traits: ${traits.join(', ')}.
      
      The prompt should:
      - Describe a cute anime-style anthropomorphic bee character
      - Include specific visual details about appearance, clothing, and accessories
      - Incorporate the personality traits into the visual design
      - Specify art style (kawaii anime, bright colors, magical elements)
      - Be suitable for image generation AI
      
      Format: Return only the image prompt, no explanations or metadata.`,
    });

    return NextResponse.json({ prompt: text });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
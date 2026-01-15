/**
 * API Route: Generate Business Description
 * 
 * PUT /api/ai/generate-description
 * Generate final business description from all answers
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateDescriptionRequest {
  companyName: string;
  niche: string;
  answers: Record<string, string>;
}

/**
 * PUT /api/ai/generate-description
 * Generate final business description from all answers
 */
export async function PUT(request: NextRequest) {
  try {
    const body: GenerateDescriptionRequest = await request.json();
    const { companyName, niche, answers } = body;

    if (!companyName || !niche || !answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'Company name, niche, and answers are required' },
        { status: 400 }
      );
    }

    // Build prompt for description generation
    let prompt = `Create a compelling, professional business description for ${companyName}, a business in the ${niche} niche.

Based on the following information:\n\n`;

    Object.entries(answers).forEach(([question, answer]) => {
      prompt += `Q: ${question}\nA: ${answer}\n\n`;
    });

    prompt += `\nGenerate a comprehensive business description (150-300 words) that:
1. Clearly explains what ${companyName} offers
2. Highlights unique selling points and value propositions
3. Is engaging and professional
4. Is suitable for a website homepage and marketing materials
5. Uses natural, conversational language

Return ONLY the description text, no additional formatting or labels.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const description = content.text.trim();

    return NextResponse.json({
      description,
    });
  } catch (error: any) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    );
  }
}

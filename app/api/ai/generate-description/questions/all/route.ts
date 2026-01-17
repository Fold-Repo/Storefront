/**
 * API Route: Get All Questions for Business Description
 * 
 * GET /api/ai/generate-description/questions
 * Returns all 5 questions at once for better UX
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Question {
    question: string;
    type: 'text' | 'textarea';
    hint?: string;
}

/**
 * GET /api/ai/generate-description/questions/all
 * Get all 5 questions at once
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyName = searchParams.get('companyName');
        const niche = searchParams.get('niche');

        if (!companyName || !niche) {
            return NextResponse.json(
                { error: 'Company name and niche are required as query params' },
                { status: 400 }
            );
        }

        const contextPrompt = `You are helping ${companyName}, a business in the ${niche} niche, create a compelling business description for their website.

Generate exactly 5 specific, relevant questions that will help create a detailed and engaging business description. The questions should flow logically and cover:
1. What products/services they offer
2. What makes them unique
3. Their target customers
4. Their brand values or mission
5. Any special features or benefits

Return ONLY a JSON array with this structure (no other text):
[
  { "question": "Question 1 text", "type": "text" | "textarea", "hint": "Optional hint" },
  { "question": "Question 2 text", "type": "text" | "textarea", "hint": "Optional hint" },
  { "question": "Question 3 text", "type": "text" | "textarea", "hint": "Optional hint" },
  { "question": "Question 4 text", "type": "text" | "textarea", "hint": "Optional hint" },
  { "question": "Question 5 text", "type": "text" | "textarea", "hint": "Optional hint" }
]`;

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1500,
            messages: [
                {
                    role: 'user',
                    content: contextPrompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
            throw new Error('Unexpected response type from Claude');
        }

        // Parse JSON from response - handle code blocks and markdown
        let jsonText = content.text.trim();
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Find the array in the response
        const jsonStart = jsonText.indexOf('[');
        const jsonEnd = jsonText.lastIndexOf(']') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            console.error('Claude response:', content.text);
            throw new Error('Could not find JSON array in Claude response');
        }

        const jsonString = jsonText.substring(jsonStart, jsonEnd);

        let questions: Question[];
        try {
            questions = JSON.parse(jsonString);
        } catch (parseError: any) {
            console.error('JSON parse error:', parseError);
            console.error('Attempted to parse:', jsonString);
            throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }

        // Ensure we have exactly 5 questions
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Invalid questions format');
        }

        return NextResponse.json({
            success: true,
            questions: questions.slice(0, 5).map((q, i) => ({
                id: i + 1,
                question: q.question,
                type: q.type || 'text',
                hint: q.hint || '',
            })),
            totalQuestions: 5,
        });
    } catch (error: any) {
        console.error('Error generating all questions:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate questions' },
            { status: 500 }
        );
    }
}

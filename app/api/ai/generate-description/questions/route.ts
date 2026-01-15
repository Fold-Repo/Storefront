/**
 * API Route: Generate Questions for Business Description
 * 
 * POST /api/ai/generate-description/questions
 * Generate contextual questions based on company name and niche
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateQuestionsRequest {
  companyName: string;
  niche: string;
  existingAnswers?: Record<string, string>;
}

/**
 * POST /api/ai/generate-description/questions
 * Generate contextual questions based on company name and niche
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await request.json();
    const { companyName, niche, existingAnswers = {} } = body;

    if (!companyName || !niche) {
      return NextResponse.json(
        { error: 'Company name and niche are required' },
        { status: 400 }
      );
    }

    const answeredQuestions = Object.keys(existingAnswers).length;
    const maxQuestions = 5; // Maximum number of questions to ask

    if (answeredQuestions >= maxQuestions) {
      // Generate description instead of more questions
      return NextResponse.json({
        type: 'generate_description',
        message: 'Ready to generate description',
      });
    }

    // Build context for question generation
    let contextPrompt = `You are helping ${companyName}, a business in the ${niche} niche, create a compelling business description for their website.

Generate ${maxQuestions - answeredQuestions} specific, relevant questions that will help create a detailed and engaging business description.`;

    if (answeredQuestions > 0) {
      contextPrompt += `\n\nBased on the answers provided so far:\n`;
      Object.entries(existingAnswers).forEach(([question, answer]) => {
        contextPrompt += `Q: ${question}\nA: ${answer}\n\n`;
      });
      contextPrompt += `\nGenerate the next question that builds on these answers.`;
    } else {
      contextPrompt += `\n\nStart with the most important question that will help understand what ${companyName} offers and what makes them unique.`;
    }

    contextPrompt += `\n\nReturn ONLY a JSON object with this structure:
{
  "question": "The question text",
  "type": "text" | "textarea",
  "hint": "Optional hint to help the user answer"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
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
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Find the first complete JSON object by matching braces
    const jsonStart = jsonText.indexOf('{');
    if (jsonStart === -1) {
      console.error('Claude response:', content.text);
      throw new Error('Could not find JSON object in Claude response');
    }
    
    // Extract JSON by finding matching closing brace
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < jsonText.length; i++) {
      if (jsonText[i] === '{') {
        braceCount++;
      } else if (jsonText[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
    
    if (jsonEnd === -1) {
      console.error('Claude response:', content.text);
      throw new Error('Could not find complete JSON object in Claude response');
    }
    
    const jsonString = jsonText.substring(jsonStart, jsonEnd);

    let questionData;
    try {
      questionData = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Attempted to parse:', jsonString);
      console.error('Full Claude response:', content.text);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }

    return NextResponse.json({
      type: 'question',
      question: questionData.question,
      inputType: questionData.type || 'text',
      hint: questionData.hint || '',
      questionNumber: answeredQuestions + 1,
      totalQuestions: maxQuestions,
    });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

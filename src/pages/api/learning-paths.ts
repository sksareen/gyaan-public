import type { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';
import LearningPath from '../../server/models/LearningPath';
import dbConnect from '../../server/lib/db';

// Initialize Anthropic client outside request handler
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Basic request validation
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { topic } = req.body;
  if (!topic?.trim()) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    // 2. Test database connection first
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connected successfully');

    // 3. Simplified Claude prompt focused on JSON structure
    const prompt = `Generate a learning path for "${topic}" and return it ONLY as a JSON object with this exact structure:
{
  "title": "Learning ${topic}",
  "description": "A brief overview of ${topic}",
  "firstPrinciples": ["principle1", "principle2", "principle3"],
  "modules": [
    {
      "title": "Module 1",
      "description": "Description of module 1",
      "projectDeliverable": "A practical project",
      "feynmanExplanation": "Simple explanation of key concepts",
      "resources": ["resource1", "resource2"]
    }
  ]
}

Return ONLY the JSON object, no other text.`;

    // 4. Make Claude API request
    console.log('Requesting Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    console.log('Claude response received');

    // 5. Parse and validate response
    try {
      const learningPathData = JSON.parse(responseText);
      
      // Basic validation of required fields
      if (!learningPathData.title || !learningPathData.modules) {
        throw new Error('Invalid response structure');
      }

      // 6. Save to database
      const learningPath = await LearningPath.create(learningPathData);
      return res.status(201).json(learningPath);

    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Raw response:', responseText);
      return res.status(500).json({
        message: 'Failed to parse AI response',
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

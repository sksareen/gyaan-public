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

  const { topic, role } = req.body;
  if (!topic?.trim()) {
    return res.status(400).json({ message: 'Topic is required' });
  }
  if (!role?.trim()) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    // Add API key validation
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY is not configured');
      return res.status(500).json({ message: 'API configuration error' });
    }

    // 2. Test database connection first with retry logic
    console.log('Connecting to MongoDB...');
    try {
      await dbConnect();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return res.status(500).json({
        message: 'Database connection error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }

    // Add request timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    // 3. Updated Claude prompt with role-specific speaking style
    const prompt = `Generate a learning path for "${topic}" specifically tailored for someone who is a "${role}". 
Adapt the language and explanations to match how a "${role}" would typically communicate and think about problems.
Return it ONLY as a JSON object with this exact structure:
{
  "title": "Learning ${topic}",
  "description": "A tailored overview of ${topic} for ${role}s, written in a style that resonates with their professional background",
  "firstPrinciples": ["principle1", "principle2", "principle3"],
  "modules": [
    {
      "title": "Module 1",
      "description": "Description using terminology and concepts familiar to ${role}s",
      "projectDeliverable": "A practical project relevant to ${role}s",
      "feynmanExplanation": "Simple explanation using analogies and examples relevant to ${role}s' experience",
      "resources": ["resource1", "resource2"]
    }
  ]
}

Use language, analogies, and examples that would resonate with a ${role}'s background and experience. Return ONLY the JSON object, no other text.`;

    // 4. Make Claude API request with timeout
    console.log('Requesting Claude API...');
    let message;
    try {
      message = await Promise.race([
        anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
        timeoutPromise
      ]);
    } catch (apiError) {
      console.error('Claude API error:', apiError);
      return res.status(500).json({
        message: 'Error calling Claude API',
        error: apiError instanceof Error ? apiError.message : 'Unknown API error'
      });
    }

    if (!message?.content?.[0]?.text) {
      console.error('Invalid Claude API response structure:', message);
      return res.status(500).json({ message: 'Invalid API response structure' });
    }

    const responseText = message.content[0].text;
    console.log('Claude response received:', responseText);

    // 5. Parse and validate response
    try {
      // Clean the response text by removing any potential markdown formatting
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const learningPathData = JSON.parse(cleanedResponse);
      
      // Add more robust validation
      if (!learningPathData || typeof learningPathData !== 'object') {
        throw new Error('Invalid response format');
      }

      const requiredFields = ['title', 'description', 'firstPrinciples', 'modules'];
      for (const field of requiredFields) {
        if (!(field in learningPathData)) {
          throw new Error(`Missing required field: ${field}`);
        }
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

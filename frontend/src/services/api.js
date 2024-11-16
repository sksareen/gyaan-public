import axios from 'axios';

// Update the API_URL to use environment variable if available
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Dummy data
const DUMMY_LEARNING_CARDS = {
  cards: [
    {
      id: 1,
      title: 'Introduction to Dummy Data',
      description: 'Learn how to use dummy data in your applications.',
      type: 'introduction',
    },
    {
      id: 2,
      title: 'Advanced Dummy Techniques',
      description: 'Master the art of dummy data handling.',
      type: 'theory',
    },
    {
      id: 3,
      title: 'Dummy Data in Practice',
      description: 'Discover real-world applications of dummy data.',
      type: 'practice',
    },
  ],
};

const DUMMY_MINI_MODULE_CONTENT = {
  description: 'This is a dummy description of the mini module.',
  fundamentals: 'These are the dummy fundamentals.',
  summary: 'This is a dummy summary.',
};

const DUMMY_GOALS = `1. Understand the basics of dummy data
2. Learn how to implement dummy data in frontend
3. Master bypassing API calls`;

const DUMMY_ROADMAP = `
## Week 1: Introduction
- Learn about dummy data
- Explore use cases

## Week 2: Implementation
- Implement dummy data in frontend
- Mock API calls

## Week 3: Advanced Topics
- Optimize performance
- Handling edge cases
`;

export const generateGoals = async (topic, proficiency) => {
  // Return dummy data
  return { goals: DUMMY_GOALS };
};

export const generateRoadmap = async (topic, goals, proficiency) => {
  // Return dummy data
  return {
    roadmap: DUMMY_ROADMAP,
    resources: [
      { title: 'Dummy Resource 1', url: 'https://example.com/1' },
      { title: 'Dummy Resource 2', url: 'https://example.com/2' },
    ],
  };
};

export const generateModuleContent = async (topic, goals, proficiency) => {
  // Return dummy data
  return DUMMY_MINI_MODULE_CONTENT;
};

export const generateModuleSection = async (topic, goals, proficiency, section) => {
    try {
        const response = await axios.post(`${API_URL}/generate_module_section`, {
            topic,
            goals,
            proficiency,
            section
        });
        
        if (!response.data || !response.data[section]) {
            throw new Error(`Invalid response format for ${section}`);
        }
        
        return response.data;
    } catch (error) {
        console.error('Error in generateModuleSection:', error.response?.data || error.message);
        throw error;
    }
};

export const explainSentence = async (sentence, topic) => {
    const response = await axios.post(`${API_URL}/api/explain-sentence`, {
        sentence,
        topic
    });
    return response.data;
};

export const generateLearningCards = async (topic, proficiency) => {
  // Return dummy data instead of making an API call
  return DUMMY_LEARNING_CARDS;
};

export const generateMiniModule = async (topic) => {
  // Return dummy data instead of making an API call
  return DUMMY_MINI_MODULE_CONTENT;
};

// export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
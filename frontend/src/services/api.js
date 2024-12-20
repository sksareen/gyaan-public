import axios from 'axios';
import { formatMarkdownText } from '../utils/textFormatting';

const baseURL = process.env.NODE_ENV === 'production'
    ? 'https://gyaan-public.onrender.com'
    : 'http://localhost:5001';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const generateGoals = async (topic, proficiency) => {
    try {
        const response = await api.post('/generate_goals', {
            topic,
            proficiency
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateGoals:', error.response?.data || error.message);
        throw error;
    }
};

export const generateRoadmap = async (topic, goals, proficiency) => {
    try {
        const response = await api.post('/generate_roadmap', {
            topic,
            goals,
            proficiency
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateRoadmap:', error.response?.data || error.message);
        throw error;
    }
};

export const generateModuleContent = async (topic, goals, proficiency) => {
    try {
        const response = await api.post('/generate_module_content', {
            topic,
            goals,
            proficiency
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateModuleContent:', error.response?.data || error.message);
        throw error;
    }
};

export const generateModuleSection = async (topic, goals, proficiency, section) => {
    try {
        const response = await api.post('/generate_module_section', {
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
    try {
        const response = await api.post('/explain-sentence', {
            sentence,
            topic
        });
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 
                           error.message || 
                           'Connection to server failed';
        throw new Error(`Explanation failed: ${errorMessage}`);
    }
};

export const generateLearningCards = async (topic, proficiency) => {
    try {
        const response = await api.post('/generate_learning_cards', {
            topic,
            proficiency
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateLearningCards:', error.response?.data || error.message);
        throw error;
    }
};

export const generateMiniModule = async (topic) => {
    try {
        const response = await api.post('/generate_mini_module', {
            topic
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateMiniModule:', error.response?.data || error.message);
        throw error;
    }
};

export const generateQuestions = async (text) => {
    try {
        const response = await api.post('/generate_questions', {
            text
        });
        return response.data;
    } catch (error) {
        console.error('Error in generateQuestions:', error.response?.data || error.message);
        throw error;
    }
};

export const generateExamples = async (text, topic, useCached = true) => {
    try {
        // Validate required parameters
        if (!text || !topic) {
            throw new Error('Missing required parameters: text and topic');
        }

        const storageKey = `examples-${topic}`;
        const savedExamples = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Check localStorage first
        const existingExample = savedExamples.find(ex => ex.text === text);
        if (useCached && existingExample) {
            return { examples: [existingExample] };
        }

        const response = await api.post('/generate_examples', { 
            text: text.trim(),
            topic: topic.trim(),
            useCached 
        });
        
        const exampleData = response.data;
        
        // Add timestamp if not present
        if (exampleData.examples && exampleData.examples[0]) {
            exampleData.examples[0].timestamp = exampleData.examples[0].timestamp || new Date().toISOString();
        }

        // Save to localStorage
        if (exampleData.examples && exampleData.examples[0]) {
            const newExample = {
                ...exampleData.examples[0],
                citations: exampleData.citations || []
            };
            
            const existingIndex = savedExamples.findIndex(ex => ex.text === text);
            if (existingIndex >= 0) {
                savedExamples[existingIndex] = newExample;
            } else {
                savedExamples.push(newExample);
            }
            localStorage.setItem(storageKey, JSON.stringify(savedExamples));
        }

        return exampleData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
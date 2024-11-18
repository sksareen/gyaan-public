import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5001',
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
        console.error('Error in explainSentence:', error.response?.data || error.message);
        throw error;
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


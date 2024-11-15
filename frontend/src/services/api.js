import axios from 'axios';

// Update the API_URL to use environment variable if available
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const generateGoals = async (topic, proficiency) => {
    try {
        const response = await axios.post(`${API_URL}/generate_goals`, {
            topic,
            proficiency
        });
        
        // Get the goals array from response
        const rawGoals = response.data.goals;
        
        // Split each goal string by newlines and flatten
        const goals = rawGoals
            .join('\n')  // Join all goals with newlines
            .split('\n') // Split everything by newlines
            .map(goal => goal.trim()) // Clean up whitespace
            .filter(goal => goal.length > 0); // Remove empty lines
        
        return { goals };
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
};

export const generateRoadmap = async (topic, goals, proficiency) => {
    const response = await axios.post(`${API_URL}/generate_roadmap`, {
        topic,
        goals,
        proficiency
    });
    
    // Add selected goals to the response data
    return {
        ...response.data,
        selectedGoals: goals
    };
};

export const generateModuleContent = async (topic, goals, proficiency) => {
    try {
        const response = await axios.post(`${API_URL}/generate_module_content`, {
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
    const response = await axios.post(`${API_URL}/api/explain_sentence`, {
        sentence,
        topic
    });
    return response.data;
};

export const generateLearningCards = async (topic, proficiency) => {
    try {
        console.log(`Generating cards for topic: ${topic}, proficiency: ${proficiency}`);
        const response = await axios.post(`${API_URL}/api/generate_learning_cards`, {
            topic,
            proficiency
        });
        console.log('Received response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in generateLearningCards:', error.response?.data || error.message);
        throw error;
    }
};

export const generateMiniModule = async (topic) => {
  try {
    const response = await axios.post(`${API_URL}/generate_mini_module`, {
      topic
    });
    return response.data;
  } catch (error) {
    console.error('Error in generateMiniModule:', error.response?.data || error.message);
    throw error;
  }
};
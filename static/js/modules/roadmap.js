// Import required modules for loading states, progress tracking, and shared state
import { setLoading } from './loading.js';
import { updateProgress } from './progress.js';
import { state } from '../main.js';

// Function to generate a learning roadmap based on selected goals
async function generateRoadmap() {
    // Check if user has selected any goals, show alert if not
    if (state.selectedGoals.length === 0) {
        alert('Please select at least one goal');
        return;
    }
    
    const loadingElement = document.getElementById('loading-roadmap');
    if (!loadingElement) {
        console.warn('Loading element not found, continuing without loading indicator');
    }
    
    // Show loading spinner while generating roadmap (only if element exists)
    if (loadingElement) {
        setLoading(true, 'roadmap');
    }
    
    try {
        // Log selected goals for debugging
        console.log('Generating roadmap for goals:', state.selectedGoals);
        
        // Send request to backend to generate roadmap
        const response = await fetch('/generate_roadmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic,
                goals: state.selectedGoals,
                proficiency
            })
        });

        // Handle server errors with detailed error messages
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Unknown server error';
            
            try {
                // Try to parse error as JSON first
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (e) {
                // Use raw error text if JSON parsing fails
                errorMessage = errorText;
            }
            
            // Log detailed error info for debugging
            console.error('Server Error Details:', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: errorMessage
            });
            
            throw new Error(`Server error: ${errorMessage}`);
        }
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        
        // Parse the response data
        const data = await response.json();
        console.log('Received roadmap:', data);
        
        // Show the roadmap section and display the data
        document.getElementById('roadmap-section').classList.remove('hidden');
        displayRoadmap(data);
        
    } catch (error) {
        // Show user-friendly error message if something goes wrong
        console.error('Error:', error);
        alert(`Error generating roadmap: ${error.message}. Please try again.`);
    } finally {
        // Hide loading spinner when done (only if element exists)
        if (loadingElement) {
            setLoading(false, 'roadmap');
        }
    }
}

// Function to display the generated roadmap on the page
function displayRoadmap(data) {
    let totalSections = 0;
    const roadmapContent = document.getElementById('roadmap-content');
    const resourceList = document.getElementById('resource-list');
    
    if (!roadmapContent || !resourceList) {
        console.error('Required DOM elements not found');
        return;
    }

    // Simple markdown converter function
    function convertMarkdown(text) {
        return text
            // Convert headers (### Header)
            .replace(/### (.*$)/gm, '<h3>$1</h3>')
            .replace(/## (.*$)/gm, '<h2>$1</h2>')
            .replace(/# (.*$)/gm, '<h1>$1</h1>')
            // Convert bold (**text**)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convert italic (*text*)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convert bullet points
            .replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>')
            // Convert numbered lists
            .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
            // Convert paragraphs
            .split('\n\n').map(para => `<p>${para}</p>`).join('\n');
    }

    // Use the custom markdown converter instead of marked
    const formattedRoadmap = convertMarkdown(data.roadmap);
    
    // Rest of the function remains the same
    roadmapContent.innerHTML = `
        <div class="roadmap-text">
            ${formattedRoadmap}
        </div>
    `;
    
    // Add resources section with header
    resourceList.innerHTML = `
        <h3 class="resources-header">Recommended Learning Resources</h3>
        <ul class="resources-list"></ul>
    `;
    const resourcesList = resourceList.querySelector('.resources-list');
    
    // Create and display list of learning resources
    data.resources.forEach(resource => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a>`;
        resourcesList.appendChild(li);
    });
    
    // Set up progress tracking by counting roadmap sections
    const sections = data.roadmap.split('\n\n').filter(section => section.trim());
    totalSections = sections.length;
    updateProgress(0);
}

export { generateRoadmap, displayRoadmap };
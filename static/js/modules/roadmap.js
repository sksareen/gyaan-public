// Import required modules for loading states, progress tracking, and shared state
import { setLoading } from './loading.js';
import { updateProgress } from './progress.js';
import { state } from '../main.js';

// Declare totalSections at the top of the file
let totalSections = 0;

// Function to generate a learning roadmap based on selected goals
async function generateRoadmap() {
    // Check if user has selected any goals, show alert if not
    if (state.selectedGoals.length === 0) {
        alert('Please select at least one goal');
        return;
    }
    
    // Always call setLoading - it handles missing elements gracefully
    setLoading(true, 'roadmap');
    
    try {
        // Log selected goals for debugging
        console.log('Generating roadmap for goals:', state.selectedGoals);
        
        const topic = document.getElementById('topic').value;
        const proficiency = document.getElementById('proficiency').value;

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
        
        // After successfully generating the roadmap and displaying it:
        document.getElementById('roadmap-section').classList.remove('hidden');
        document.getElementById('first-module-section').classList.remove('hidden'); // Show the section with the confirm button
        
        // Enable and show the confirm button
        const confirmButton = document.getElementById('confirm-roadmap-btn');
        confirmButton.classList.remove('hidden');
        confirmButton.disabled = false;

    } catch (error) {
        // Show user-friendly error message if something goes wrong
        console.error('Error:', error);
        alert(`Error generating roadmap: ${error.message}. Please try again.`);
    } finally {
        // Always call setLoading false - it handles missing elements gracefully
        setLoading(false, 'roadmap');
    }
}

// Function to display the generated roadmap on the page
function displayRoadmap(data) {
    const roadmapContent = document.getElementById('roadmap-content');
    const resourceList = document.getElementById('resource-list');
    
    if (!roadmapContent || !resourceList) {
        console.error('Required DOM elements not found');
        return;
    }

    // Update marked.js usage to work with version 15.0.0
    const formattedRoadmap = marked.parse(data.roadmap, {
        breaks: true,        // Enable line breaks
        gfm: true,          // Enable GitHub Flavored Markdown
        headerIds: true,    // Enable header IDs
        mangle: false,      // Disable mangling
        sanitize: false     // Disable sanitization (be careful with user input)
    });
    
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
    
    // Calculate total sections based on the roadmap content
    const sections = data.roadmap.split('\n\n').filter(section => section.trim());
    state.totalSections = sections.length;
    updateProgress(0);

    // Scroll to the roadmap section
    document.getElementById('roadmap-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

export { generateRoadmap, displayRoadmap };
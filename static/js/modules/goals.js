import { setLoading } from './loading.js';
import { state } from '../main.js';
import { generateRoadmap } from './roadmap.js';

async function generateGoals() {
    console.log('generateGoals function called');
    
    const topic = document.getElementById('topic').value;
    const proficiency = document.getElementById('proficiency').value;
    
    console.log('Topic:', topic);
    console.log('Proficiency:', proficiency);
    
    if (!topic) {
        alert('Please enter a topic');
        return;
    }
    
    try {
        const generateButton = document.getElementById('generate-goals-btn');
        if (generateButton) {
            setLoading(true, 'goals');
        }
        
        console.log('Generating goals for topic:', topic);
        
        const response = await fetch('/generate_goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topic, proficiency })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = 'Unknown server error';
            
            try {
                // Try to parse the error as JSON
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
            } catch (e) {
                // If parsing fails, use the raw error text
                errorMessage = errorText;
            }
            
            console.error('Server Error Details:', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: errorMessage
            });
            
            throw new Error(`Server error: ${errorMessage}`);
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Received non-JSON response from server");
        }
        
        const data = await response.json();
        console.log('Received goals:', data);
        displayGoals(data.goals);
        
        // Show the goals section and roadmap button
        const goalsSection = document.getElementById('goals-section');
        const roadmapButton = document.getElementById('create-roadmap-btn');
        
        if (goalsSection) {
            goalsSection.classList.remove('hidden');
        }
        
        if (roadmapButton) {
            roadmapButton.disabled = true;
            roadmapButton.onclick = generateRoadmap;
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error generating goals: ${error.message}. Please try again.`);
    } finally {
        setLoading(false, 'goals');
    }
}

function displayGoals(goals) {
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    console.log('Raw goals:', goals);
    
    // Clean and parse the goals text
    let cleanGoals = goals.replace(/\\n/g, '\n').replace(/\[TextBlock\(text=|, ', type='text'\)]/g, '').trim();
    console.log('Cleaned goals:', cleanGoals);
    
    // Split into main goals (numbered 1-3)
    const mainGoals = cleanGoals.split(/\d+\./)
        .filter(Boolean)
        .map(goal => goal.trim())
        .filter(goal => goal.length > 0)
        .slice(1); // Skip the first goal
    console.log('Parsed goals:', mainGoals);
    
    mainGoals.forEach((goal, index) => {
        const goalButton = document.createElement('button');
        goalButton.className = 'goal-button';
        goalButton.setAttribute('data-goal-id', index);
        goalButton.setAttribute('data-goal-text', goal);
        goalButton.textContent = `Goal ${index + 1}: ${goal}`;
        
        // Add click handler
        goalButton.addEventListener('click', () => {
            goalButton.classList.toggle('selected');
            updateSelectedGoals();
        });
        
        goalsList.appendChild(goalButton);
    });
    
    // Reset selected goals
    state.selectedGoals = [];
    
    // Make sure roadmap button starts disabled
    const roadmapButton = document.getElementById('generate-roadmap-btn');
    if (roadmapButton) {
        roadmapButton.disabled = true;
        roadmapButton.style.opacity = '0.5';
        roadmapButton.style.cursor = 'not-allowed';
        roadmapButton.addEventListener('click', generateRoadmap);
    }
    
    // Show the goals section
    document.getElementById('goals-section').classList.remove('hidden');
}

function updateSelectedGoals() {
    const selectedButtons = document.querySelectorAll('.goal-button.selected');
    state.selectedGoals = Array.from(selectedButtons).map(button => button.getAttribute('data-goal-text'));
    
    // Enable/disable the roadmap button based on selection
    const roadmapButton = document.getElementById('generate-roadmap-btn');
    if (roadmapButton) {
        const hasSelectedGoals = state.selectedGoals.length > 0;
        roadmapButton.disabled = !hasSelectedGoals;
        roadmapButton.style.opacity = hasSelectedGoals ? '1' : '0.5';
        roadmapButton.style.cursor = hasSelectedGoals ? 'pointer' : 'not-allowed';
    }
    
    console.log('Selected goals:', state.selectedGoals);
}

export { generateGoals, displayGoals, updateSelectedGoals };
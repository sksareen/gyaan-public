// Import all modules
import { generateGoals } from './modules/goals.js';
import { generateRoadmap } from './modules/roadmap.js';
// import { submitFeedback, showFeedbackSection } from './modules/feedback.js';
// import { updateProgress } from './modules/progress.js';

// Shared state (make it accessible to all modules)
export const state = {
    selectedGoals: [],
    currentProgress: 0,
    currentSection: 0,
    totalSections: 0
};


// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const generateGoalsBtn = document.getElementById('generate-goals-btn');
    // console.log('Found generate goals button:', generateGoalsBtn);
    
    if (generateGoalsBtn) {
        // console.log('Adding click listener to generate goals button');
        generateGoalsBtn.addEventListener('click', (e) => {
            console.log('Generate goals button clicked');
            e.preventDefault();
            generateGoals();
        });
    }
    // Initialize roadmap button
    const roadmapButton = document.getElementById('generate-roadmap-btn');
    if (roadmapButton) {
        roadmapButton.onclick = generateRoadmap;
    }

    // Initialize star rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            document.querySelectorAll('.star').forEach(s => {
                s.classList.toggle('selected', s.dataset.rating <= rating);
            });
        });
    });

});
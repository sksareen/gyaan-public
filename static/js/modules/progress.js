import { state } from '../main.js';

function updateProgress(sectionNumber) {
    state.currentSection = sectionNumber;
    const progressPercentage = (state.currentSection / state.totalSections) * 100;
    
    // Make sure roadmap section is visible first
    const roadmapSection = document.getElementById('roadmap-section');
    if (roadmapSection) {
        roadmapSection.classList.remove('hidden');
    }
    
    const progressBar = document.querySelector('.progress');
    const progressText = document.getElementById('progress-percentage');
    
    // Check if elements exist before updating them
    if (!progressBar || !progressText) {
        console.warn('Progress elements not found');
        return;
    }
    
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${Math.round(progressPercentage)}%`;
}

export { updateProgress };
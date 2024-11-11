import { state } from '../main.js';

function updateProgress(completedSections) {
    const progressBar = document.querySelector('.progress');
    const progressPercentage = document.getElementById('progress-percentage');

    if (state.totalSections && state.totalSections > 0) {
        const progress = (completedSections / state.totalSections) * 100;
        progressBar.style.width = `${progress}%`;
        progressPercentage.textContent = `${Math.round(progress)}%`;
    } else {
        progressBar.style.width = '0%';
        progressPercentage.textContent = '0%';
    }
}

export { updateProgress };
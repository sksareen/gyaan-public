import { state } from '../main.js';

function submitFeedback() {
    const selectedStars = document.querySelectorAll('.star.selected').length;
    // Here you could send the feedback to your backend
    alert(`Thank you for your ${selectedStars}-star feedback!`);
    document.getElementById('feedback-section').classList.add('hidden');
}

// Helper function to show feedback section at the end of each section
function showFeedbackSection() {
    document.getElementById('feedback-section').classList.remove('hidden');
}

export { submitFeedback, showFeedbackSection };
import { setLoading } from './loading.js';

async function generateModuleContent() {
    try {
        console.log('Generating module content...');
        setLoading(true, 'module');
        
        document.getElementById('confirm-roadmap-btn').classList.add('hidden');
        
        const topic = document.getElementById('topic').value;
        const proficiency = document.getElementById('proficiency').value;
        const selectedGoals = Array.from(document.querySelectorAll('.goal-button.selected'))
            .map(button => button.textContent);

        console.log('Sending request with:', { topic, proficiency, selectedGoals });

        const response = await fetch('/generate_module_content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: topic,
                proficiency: proficiency,
                goals: selectedGoals
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`Failed to generate module content: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data);

        const moduleContent = document.getElementById('module-content');
        moduleContent.classList.remove('hidden');

        document.getElementById('first-principles-content').innerHTML = 
            marked.parse(data.firstPrinciples);
        
        document.getElementById('key-info-content').innerHTML = 
            marked.parse(data.keyInformation);
        
        document.getElementById('practice-content').innerHTML = 
            marked.parse(data.practiceExercise);

        // After generating content, make sure parent sections are visible
        document.getElementById('first-module-section').classList.remove('hidden');
        document.getElementById('module-content').classList.remove('hidden');

    } catch (error) {
        console.error('Error generating module content:', error);
        alert('Failed to generate module content. Please try again.');
    } finally {
        setLoading(false, 'module');
    }

    // Scroll to the first module section
    document.getElementById('first-module-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

export { generateModuleContent };



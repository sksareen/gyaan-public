function setLoading(isLoading, type = 'goals') {
    const button = document.getElementById(`generate-${type}-btn`);
    const loader = document.getElementById(`${type}-loader`);
    const loadingText = document.getElementById(`${type}-loading-text`);
    
    // Debug log
    console.log(`Setting loading state for ${type}:`, { isLoading });
    
    // Handle button
    if (button) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    } else {
        console.warn(`Button not found for type '${type}'`);
    }
    
    // Handle loader
    if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
    } else {
        console.warn(`Loader not found for type '${type}'`);
    }
    
    // Handle loading text
    if (loadingText) {
        loadingText.style.display = isLoading ? 'block' : 'none';
    } else {
        console.warn(`Loading text not found for type '${type}'`);
    }
    
    // Debug log
    console.log(`Loading state ${isLoading ? 'activated' : 'deactivated'} for ${type}`);
}

export { setLoading };

function setLoading(isLoading, type = 'goals') {
    const button = document.getElementById(`generate-${type}-btn`);
    const loader = document.getElementById(`${type}-loader`);
    const loadingText = document.getElementById(`${type}-loading-text`);
    
    if (!button || !loader || !loadingText) {
        console.error(`Loading elements not found for type '${type}':`);
        console.error('Button:', button);
        console.error('Loader:', loader);
        console.error('Loading text:', loadingText);
        return;
    }
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        loader.style.display = 'block';
        loadingText.style.display = 'block';
        
        // Debug log
        console.log(`Loading state activated for ${type}`);
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        loader.style.display = 'none';
        loadingText.style.display = 'none';
        
        // Debug log
        console.log(`Loading state deactivated for ${type}`);
    }
}
export { setLoading };

export const formatMarkdownText = (text) => {
    if (!text) return '';
    
    text = typeof text === 'string' ? text : JSON.stringify(text);
    
    const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;
    const match = text.match(regex);
    if (match) {
      text = match[1];
    }
  
    // First, handle bullet points
    text = text
      .replace(/([^\n])\s*•\s*/g, '$1\n\n• ') // Add newlines before bullets
      .replace(/^\s*•\s*/gm, '• ') // Clean up bullet point spacing
      .replace(/\\n/g, '\n')
      .replace(/^#\s*@[^#\n]+/gm, '');

    // Split into lines and clean up
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
};
export const formatMarkdownText = (text) => {
    if (!text) return '';
    
    text = typeof text === 'string' ? text : JSON.stringify(text);
    
    const regex = /^\s*\[?TextBlock\(text="([\s\S]*?)"\s*(?:,\s*type='[^']+')?\)\]?\s*$/;
    const match = text.match(regex);
    if (match) {
      text = match[1];
    }
  
    text = text.replace(/\\n/g, '\n');
  
    text = text
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
  
    return text;
};
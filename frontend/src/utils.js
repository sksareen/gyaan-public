export const parseTextBlock = (content) => {
    if (!content) return '';
    
    // If it's already a string and doesn't contain TextBlock, return as is
    if (typeof content === 'string' && !content.includes('TextBlock')) {
        return content;
    }

    try {
        // If it's a JSON string, parse it
        if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
            content = JSON.parse(content);
        }

        // If it's an array of TextBlocks, handle that
        if (Array.isArray(content)) {
            return content
                .map(item => {
                    if (typeof item === 'string' && item.includes('TextBlock')) {
                        const match = item.match(/text='([\s\S]*?)'/);
                        return match ? match[1] : item;
                    }
                    return item;
                })
                .join('\n');
        }

        // Handle single TextBlock format
        if (typeof content === 'string' && content.includes('TextBlock')) {
            const match = content.match(/text='([\s\S]*?)'/);
            return match ? match[1] : content;
        }

        // Handle object with text property (like TextBlock objects)
        if (content && typeof content === 'object' && content.text) {
            return content.text;
        }

        // If none of the above, return as string
        return String(content);
    } catch (error) {
        console.error('Error parsing content:', error);
        return String(content);
    }
};
from functools import wraps
from flask import jsonify, request
import re

def validate_request(required_fields):
    """
    Decorator to validate request data and handle common errors
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 400
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                return jsonify({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def extract_text_from_response(content):
    """
    Extract clean text from various response formats
    """
    if not content:
        return ""
        
    # Convert to string if it's not already
    content = str(content)
    
    # Handle TextBlock format
    if 'TextBlock' in content:
        match = re.search(r"text='([\s\S]*?)'", content, re.DOTALL)
        if match:
            return match.group(1).strip()
    
    return content.strip()

def parse_goals(content):
    """
    Parse and clean goals from AI response
    """
    text = extract_text_from_response(content)
    
    # Split by newlines and clean each line
    lines = text.split('\n')
    goals = []
    
    for line in lines:
        line = line.strip()
        # Skip empty lines and headers
        if not line or line.startswith('#'):
            continue
            
        # Clean up list markers and numbers
        cleaned = re.sub(r'^\d+\.\s*|-\s*|\*\s*', '', line).strip()
        
        # Only add if it's a substantial goal (more than just a few words)
        if cleaned and len(cleaned.split()) > 3:
            goals.append(cleaned)
    
    return goals

def parse_markdown_content(content):
    """
    Parse and clean markdown content from AI response
    """
    text = extract_text_from_response(content)
    
    # Remove duplicate newlines
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # Ensure headers have space after #
    text = re.sub(r'#([^#\s])', r'# \1', text)
    
    # Ensure list items have space after marker
    text = re.sub(r'^\s*[-*]\s*([^\s])', r'- \1', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*(\d+)\.\s*([^\s])', r'\1. \2', text, flags=re.MULTILINE)
    
    return text.strip()
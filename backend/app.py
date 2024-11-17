from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from exa_py import Exa
import anthropic
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import logging
from functools import wraps
import time
from utils import validate_request, parse_goals, parse_markdown_content

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Validate required environment variables
required_env_vars = ['ANTHROPIC_API_KEY', 'EXA_API_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Your React app's URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize API clients
try:
    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    exa = Exa(api_key=os.getenv('EXA_API_KEY'))
except Exception as e:
    logger.error(f"Error initializing API clients: {str(e)}")
    raise

# Constants
HAIKU_MODEL = "claude-3-haiku-20240307"
SONNET_MODEL = "claude-3-5-sonnet-20241022"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 30

SYSTEM_PROMPT = """You are a clear, concise educational tutor who:

1. Breaks complex topics into fundamentals
2. Builds understanding step-by-step
3. Connects concepts across domains
4. Emphasizes practical problem-solving

Format responses with:
- Core concept first
- Brief, clear explanations
- Targeted examples
- Relevant practice problems

Keep all responses focused and actionable."""

GOALS_PROMPT = """Create 3-5 specific learning goals for {topic} at a {proficiency} level.
Format each goal as a clear, actionable statement.
Return only the numbered goals, one per line."""

ROADMAP_PROMPT = """Create a learning roadmap for {topic} at a {proficiency} level.
Goals:
{goals_text}

Format the response as a markdown document with clear sections and bullet points."""

# Add this constant
ROADMAP_SECTIONS = [
    "Fundamentals & Prerequisites",
    "Core Concepts",
    "Advanced Topics",
    "Practical Applications",
    "Final Projects"
]

class PromptManager:
    _prompts = {}
    
    @classmethod
    def load_prompt(cls, name):
        """Load a prompt from file with caching"""
        if name not in cls._prompts:
            try:
                with open(os.path.join('prompts', f'{name}_prompt.txt'), 'r') as file:
                    cls._prompts[name] = file.read().strip()
            except FileNotFoundError:
                logger.error(f"Prompt file not found: {name}_prompt.txt")
                raise
        return cls._prompts[name]
    
    @classmethod
    def get_prompt(cls, name, **kwargs):
        """Get a formatted prompt"""
        prompt = cls.load_prompt(name)
        try:
            return prompt.format(**kwargs)
        except KeyError as e:
            logger.error(f"Missing prompt parameter: {str(e)}")
            raise ValueError(f"Missing required parameter for {name} prompt: {str(e)}")

# Load all prompts
prompts = PromptManager()

# Error handling decorator for AI requests
def handle_ai_request(retries=MAX_RETRIES):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            last_error = None
            for attempt in range(retries):
                try:
                    return f(*args, **kwargs)
                except anthropic.RateLimitError as e:
                    logger.warning(f"Rate limit hit, attempt {attempt + 1}/{retries}")
                    time.sleep(2 ** attempt)  # Exponential backoff
                    last_error = e
                except Exception as e:
                    logger.error(f"Error in AI request: {str(e)}")
                    raise
            raise last_error
        return decorated_function
    return decorator

# Dummy mode for testing
DUMMY_MODE = False

# Test responses
DUMMY_RESPONSES = {
    "goals": """learn how to:
2. Learn object-oriented programming principles
3. Build simple command-line applications
4. Understand web development basics with Python""",
    
    "roadmap": """## Week 1-2: Fundamentals
- Python installation and setup
- Variables, data types, and operators
- Control flow (if/else, loops)

## Week 3-4: Functions & OOP
- Functions and parameters
- Classes and objects
- Inheritance and polymorphism

## Week 5-6: Practical Skills
- File handling
- Error handling
- Basic web development""",
    
    "resources": [
        {"title": "Python.org", "url": "https://python.org"},
        {"title": "Real Python", "url": "https://realpython.com"},
        {"title": "W3Schools", "url": "https://www.w3schools.com/python"},
        {"title": "Codecademy", "url": "https://www.codecademy.com/learn/learn-python"},
        {"title": "Python Crash Course", "url": "https://nostarch.com/pythoncrashcourse2e"}
    ],

    "module": {
        "firstPrinciples": """## Core Programming Concepts

1. **Variables and Memory**
   - Think of variables as labeled containers that store data
   - The computer allocates memory space to hold different types of data
   - Understanding this helps visualize how programs manage information

2. **Control Flow**
   - Programs execute instructions in sequence
   - Decisions (if/else) and loops allow us to control this flow
   - This creates the logical structure of our programs

3. **Functions and Modularity** 
   - Functions are reusable blocks of code that perform specific tasks
   - They help break down complex problems into smaller, manageable pieces
   - This is fundamental to writing clean, maintainable code""",

        "keyInformation": """## Python Basics

- Python is an interpreted, high-level programming language
- Known for its simple, readable syntax
- Extensive standard library and third-party packages
- Popular for web development, data science, and automation

### Key Concepts to Master:
1. Variables and data types (int, str, list, etc.)
2. Basic operators (+, -, *, /, etc.)
3. Control structures (if/else, while, for)
4. Function definition and calling
5. Basic input/output operations""",

        "practiceExercise": """## Practice Exercise: Temperature Converter

Create a simple program that converts temperatures between Celsius and Fahrenheit.

1. Create a function called `celsius_to_fahrenheit` that:
   - Takes a Celsius temperature as input
   - Returns the equivalent Fahrenheit temperature
   - Formula: F = (C × 9/5) + 32

2. Create a function called `fahrenheit_to_celsius` that:
   - Takes a Fahrenheit temperature as input
   - Returns the equivalent Celsius temperature
   - Formula: C = (F - 32) × 5/9

3. Test your functions with these values:
   - 0°C to Fahrenheit (should be 32°F)
   - 100°C to Fahrenheit (should be 212°F)
   - 98.6F to Celsius (should be 37°C)

Bonus: Add input validation and round results to 1 decimal place."""
    },

    "module_content": {
        "firstPrinciples": "Dummy first principles content",
        "keyInformation": "Dummy key information",
        "practiceExercise": "Dummy practice exercise"
    },

    "roadmap_content": {
        "roadmap": "Dummy roadmap content",
        "resources": [
            {"title": "Dummy Resource 1", "url": "https://example.com/1"},
            {"title": "Dummy Resource 2", "url": "https://example.com/2"}
        ]
    }
}

@app.route('/')
def home():
    print('[app.py] home starting')
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    print('[app.py] favicon starting')
    return app.send_static_file('favicon.ico')

@app.errorhandler(Exception)
def handle_error(error):
    print('[app.py] handle_error starting')
    print(f"Error: {str(error)}")
    return jsonify(error=str(error)), 500

@app.route('/generate_goals', methods=['POST'])
@validate_request(['topic', 'proficiency'])
@handle_ai_request()
def generate_goals():
    """Generate learning goals based on topic and proficiency"""
    logger.info("Generating goals")
    
    if DUMMY_MODE:
        return jsonify({"goals": DUMMY_RESPONSES["goals"]})
        
    data = request.get_json()
    topic = data['topic']
    proficiency = data['proficiency']
    
    logger.debug(f"Generating goals for topic: {topic}, proficiency: {proficiency}")
    
    # Generate goals using Claude
    try:
        prompt = prompts.get_prompt('goals', topic=topic, proficiency=proficiency)
        message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=1000,
            system=prompts.get_prompt('system'),
            messages=[{
                "role": "user", 
                "content": prompt
            }]
        )
        
        # Get response from Claude
        try:
            prompt = GOALS_PROMPT.format(topic=topic, proficiency=proficiency)
            print(f'[DEBUG] Using prompt: {prompt}')
            
            message = client.messages.create(
                model=HAIKU_MODEL,
                max_tokens=1000,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user", 
                    "content": prompt
                }]
            )
            print("[DEBUG] Raw Claude response:", message.content)
        except Exception as e:
            print(f"Error calling Claude API: {str(e)}")
            return jsonify({"error": "Failed to generate goals from AI"}), 500

        # Parse the response content
        goals_text = str(message.content)
        print("[DEBUG] Initial goals text:", goals_text)
        
        def extract_goals(text):
            # Remove any markdown headers
            lines = text.split('\n')
            content_lines = []
            for line in lines:
                line = line.strip()
                # Skip empty lines and headers
                if not line or line.startswith('#'):
                    continue
                # If it's a numbered or bullet point, clean it
                cleaned_line = line.lstrip('- ').lstrip('* ').lstrip('1234567890. ')
                if cleaned_line:
                    content_lines.append(cleaned_line)
            return content_lines

        # Handle TextBlock format first
        if 'TextBlock' in goals_text:
            try:
                import re
                text_match = re.search(r"text='([\s\S]*?)'", goals_text, re.DOTALL)
                if text_match:
                    goals_text = text_match.group(1)
                    print("[DEBUG] Extracted from TextBlock:", goals_text)
            except Exception as e:
                print(f"[DEBUG] Error extracting from TextBlock: {str(e)}")
        
        try:
            # First try to parse as JSON
            goals_array = json.loads(goals_text)
            if isinstance(goals_array, list):
                print("[DEBUG] Successfully parsed JSON array:", goals_array)
                clean_goals = []
                for goal in goals_array:
                    if isinstance(goal, dict) and 'text' in goal:
                        clean_goals.extend(extract_goals(goal['text']))
                    else:
                        clean_goals.extend(extract_goals(str(goal)))
                if clean_goals:
                    return jsonify({"goals": clean_goals})
        except json.JSONDecodeError:
            print("[DEBUG] Not a JSON response, trying direct text parsing")
            
        # If we get here, treat it as plain text
        goals_array = extract_goals(goals_text)
        print("[DEBUG] Extracted goals:", goals_array)
        
        if goals_array:
            return jsonify({"goals": goals_array})
        
        # If we still have no valid goals, try one last parsing attempt
        print("[DEBUG] Final fallback parsing attempt")
        # Split by any obvious goal separators and clean up
        final_attempt = []
        for line in goals_text.split('\n'):
            line = line.strip()
            if line and not line.startswith('#'):
                # Remove common list markers and numbers
                cleaned = line.lstrip('- ').lstrip('* ').lstrip('1234567890. ')
                if cleaned and len(cleaned) > 10:  # Assuming a valid goal has some minimum length
                    final_attempt.append(cleaned)
        
        if final_attempt:
            print("[DEBUG] Final parsed goals:", final_attempt)
            return jsonify({"goals": final_attempt})
            
        print("[DEBUG] Failed to parse any valid goals")
        return jsonify({"error": "Failed to parse goals from AI response"}), 500

    except Exception as e:
        print(f"Unexpected error in generate_goals: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate_roadmap', methods=['POST'])
def generate_roadmap():
    print('[app.py] generate_roadmap starting')
    try:
        if DUMMY_MODE:
            return jsonify(DUMMY_RESPONSES["roadmap_content"])
            
        if not request.is_json:
            print('Request is not JSON')
            return jsonify({"error": "Content-Type must be application/json"}), 400
            
        data = request.get_json()
        print("Received data:", data)  # Debug print
        
        topic = data.get('topic')
        goals = data.get('goals', [])  # Default to empty list if missing
        proficiency = data.get('proficiency')
        
        # Validate inputs
        if not topic or not goals or not proficiency:
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Convert goals list to a formatted string
        # Handle both string and list inputs for goals
        if isinstance(goals, str):
            goals_text = goals
        else:
            goals_text = "\n".join([f"- {goal.strip()}" for goal in goals])
        
        print(f"Generating roadmap for topic: {topic}, goals: {goals_text}")
        
        # Generate roadmap with Claude
        message = client.messages.create(
            model=SONNET_MODEL,  # Using more capable model for better roadmap
            max_tokens=3000,     # Increased token limit
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""Create a comprehensive learning roadmap for {topic} at {proficiency} level.
                Goals: {goals_text}
                
                Your response MUST include ALL of these sections with equal detail:
                {chr(10).join(f'- {section}' for section in ROADMAP_SECTIONS)}
                
                For each section, include:
                1. Clear learning objectives
                2. Core concepts to master
                3. Practical exercises
                4. Time estimates
                5. Success criteria
                
                Format as markdown with clear headers and bullet points."""
            }]
        )
        
        print("Roadmap generated, fetching resources...")
        
        # Get relevant resources from ExaAI
        search_response = exa.search_and_contents(
            query=f"best learning resources and tutorials for {topic}",
            num_results=5,
            use_autoprompt=True
        )
        
        # Access the results from 'search_response'
        resources = []
        for i, result in enumerate(search_response.results):
            resources.append({
                "title": result.title if result.title else f"Resource {i+1}",
                "url": result.url if result.url else ''
            })
        
        roadmap_content = str(message.content)
        
        # Handle TextBlock format
        if 'TextBlock' in roadmap_content:
            try:
                import re
                text_match = re.search(r"text='(.*?)'", roadmap_content, re.DOTALL)
                if text_match:
                    roadmap_content = text_match.group(1)
            except Exception as e:
                print(f"Error extracting from TextBlock: {str(e)}")
        
        response_data = {
            "roadmap": roadmap_content,  # Now cleaned from TextBlock format
            "resources": resources
        }
        
        print("Sending response...")
        return jsonify(response_data)
    except Exception as e:
        print("Error in generate_roadmap:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500

@app.route('/generate_module_content', methods=['POST'])
def generate_module_content():
    print('[app.py] generate_module_content starting')
    try:
        if DUMMY_MODE:
            return jsonify(DUMMY_RESPONSES["module_content"])
            
        if not request.is_json:
            print('Request is not JSON')
            return jsonify({"error": "Content-Type must be application/json"}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        topic = data.get('topic')
        proficiency = data.get('proficiency')
        goals = data.get('goals', [])

        if not all([topic, proficiency, goals]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Format goals into string
        goals_text = "\n".join([f"- {goal}" for goal in goals])

        # Generate first principles content
        first_principles_message = client.messages.create(
            model=SONNET_MODEL,  # Using more capable model for deeper analysis
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": prompts.get_prompt('first_principles', 
                    topic=topic, 
                    proficiency=proficiency,
                    goals=goals_text)
            }]
        )

        # Generate key information content
        key_info_message = client.messages.create(
            model=HAIKU_MODEL, 
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""Generate key information and concepts for learning {topic}.
                Proficiency level: {proficiency}
                Learning goals:
                {goals_text}"""
            }]
        )

        # Generate practice exercise
        practice_message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""Generate a practice exercise for learning {topic}.
                Proficiency level: {proficiency}
                Learning goals:
                {goals_text}"""
            }]
        )

        def clean_text_block(content):
            content_str = str(content)
            if 'TextBlock' in content_str:
                try:
                    import re
                    text_match = re.search(r"text='(.*?)'", content_str, re.DOTALL)
                    if text_match:
                        return text_match.group(1)
                except Exception as e:
                    print(f"Error extracting from TextBlock: {str(e)}")
            return content_str

        response_data = {
            "firstPrinciples": clean_text_block(first_principles_message.content),
            "fundamentalTruths": extract_fundamental_truths(first_principles_message.content),
            "crossDomainConnections": extract_cross_domain_connections(first_principles_message.content),
            "keyInformation": clean_text_block(key_info_message.content),
            "practiceExercise": clean_text_block(practice_message.content)
        }

        return jsonify(response_data)

    except Exception as e:
        print('[app.py] generate_module_content encountered an error')
        print(f"Error generating module content: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.after_request
def add_header(response):
    print('[app.py] add_header starting')
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store'
    return response

@app.route('/api/explain-sentence', methods=['POST', 'OPTIONS'])
def explain_sentence():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json()
    sentence = data.get('sentence', '')
    topic = data.get('topic', '')

    if not sentence or not topic:
        return jsonify({'error': 'Missing sentence or topic'}), 400

    try:
        response = client.messages.create(
            model=SONNET_MODEL,
            max_tokens=1600,
            messages=[{
                "role": "user",
                "content": f"Explain '{sentence}' concisely and precisely as it relates to {topic}. Use short sentences. Focus on key points. use simple english and key words. under 200 words"
            }]
        )
        
        # Convert the response content to a string
        explanation = str(response.content)
        
        # Clean up the TextBlock format if present
        if 'TextBlock' in explanation:
            import re
            text_match = re.search(r"text='(.*?)'", explanation, re.DOTALL)
            if text_match:
                explanation = text_match.group(1)
        
        return jsonify({'explanation': explanation})
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/generate_learning_cards', methods=['POST'])
def generate_learning_cards():
    try:
        data = request.get_json()
        topic = data.get('topic')
        proficiency = data.get('proficiency')
        
        if not topic or not proficiency:
            return jsonify({'error': 'Missing required fields'}), 400

        # Generate cards using Claude
        message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""Generate 3 learning cards for {topic} at {proficiency} level. Each card should be:
1. A real-world success story, achievement, or theoretical breakthrough
2. Inspiring and motivational
3. Related to {topic}
4. Appropriate for {proficiency} level learners

Return the response in this exact JSON format, with no additional text or formatting:
{{
    "cards": [
        {{
            "id": 1,
            "title": "Example Title 1",
            "description": "Example description 1",
            "type": "success-story"
        }},
        {{
            "id": 2,
            "title": "Example Title 2", 
            "description": "Example description 2",
            "type": "achievement"
        }},
        {{
            "id": 3,
            "title": "Example Title 3",
            "description": "Example description 3", 
            "type": "theory"
        }}
    ]
}}"""
            }]
        )

        # Parse the response and ensure it's properly formatted
        try:
            response_content = str(message.content)
            
            # Clean up the response if it contains TextBlock
            if 'TextBlock' in response_content:
                import re
                # Look for JSON object pattern rather than just text
                json_match = re.search(r'\{[\s\S]*\}', response_content)
                if json_match:
                    response_content = json_match.group(0)
            
            # Remove any leading/trailing whitespace and newlines
            response_content = response_content.strip()
            
            # Parse the JSON response
            parsed_content = json.loads(response_content)
            
            # Validate the response structure
            if not isinstance(parsed_content, dict) or 'cards' not in parsed_content:
                raise ValueError('Response missing cards array')
            
            if not isinstance(parsed_content['cards'], list) or len(parsed_content['cards']) != 3:
                raise ValueError('Response must contain exactly 3 cards')
            
            for card in parsed_content['cards']:
                required_fields = ['id', 'title', 'description', 'type']
                if not all(field in card for field in required_fields):
                    raise ValueError('Cards missing required fields')
                
            # Store the descriptions for use in mini module
            descriptions = [card['description'] for card in parsed_content['cards']]
            app.config['last_card_descriptions'] = descriptions
            
            return jsonify(parsed_content)
            
        except Exception as e:
            print(f"Error parsing AI response: {str(e)}")
            print(f"Raw response: {message.content}")
            
            # Fallback to dummy cards if parsing fails
            fallback_cards = {
                "cards": [
                    {
                        "id": 1,
                        "title": f"Getting Started with {topic}",
                        "description": f"Learn the fundamental concepts of {topic} at {proficiency} level.",
                        "type": "introduction"
                    },
                    {
                        "id": 2,
                        "title": f"Core Principles of {topic}",
                        "description": f"Master the essential principles and techniques in {topic}.",
                        "type": "theory"
                    },
                    {
                        "id": 3,
                        "title": f"Real-World Applications of {topic}",
                        "description": f"Discover how {topic} is applied in practical scenarios.",
                        "type": "achievement"
                    }
                ]
            }
            return jsonify(fallback_cards)
            
    except Exception as e:
        print(f"Error in generate_learning_cards: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate_mini_module', methods=['POST'])
@handle_ai_request()
def generate_mini_module():
    try:
        data = request.get_json()
        topic = data.get('topic')
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400

        # Get previously generated card descriptions
        card_descriptions = app.config.get('last_card_descriptions', [])
        context = "\n".join(card_descriptions) if card_descriptions else "No previous context available."

        # Generate content using Claude with added context
        message = client.messages.create(
            model=SONNET_MODEL,
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""
Create a mini learning module about {topic} using the context {context}. Include:

1. A clear description of the concept (5 concise densesentences)
2. The fundamental truths/first principles (3-5 bullet points)
3. A concise summary (<300 words) in simple but conceptually dense language

Format each section in markdown."""
            }]
        )

        # Parse the response into sections
        content = str(message.content)
        sections = content.split('\n\n')

        response_data = {
            "description": sections[0] if len(sections) > 0 else "",
            "fundamentals": sections[1] if len(sections) > 1 else "",
            "summary": sections[2] if len(sections) > 2 else ""
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mini_module/<id>', methods=['GET'])
def get_mini_module(id):
    # Add artificial delay for testing loading state
    time.sleep(1)  # Remove this in production
    # Rest of your endpoint logic...

if __name__ == '__main__':
    print('[app.py] __main__ starting')
    app.run(debug=True, port=5001)
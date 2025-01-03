from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS
from exa_py import Exa
import anthropic
import os
from dotenv import load_dotenv
from datetime import datetime
import json
import re
import logging
from functools import wraps
import time
from utils import validate_request, parse_goals, parse_markdown_content
from anthropic import Anthropic, HUMAN_PROMPT, AI_PROMPT
import openai
import requests

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(override=True)

# Add debug logging for environment variables
logger.debug("ANTHROPIC_API_KEY present: %s", bool(os.getenv('ANTHROPIC_API_KEY')))
logger.debug("EXA_API_KEY present: %s", bool(os.getenv('EXA_API_KEY')))

# Validate required environment variables
required_env_vars = ['ANTHROPIC_API_KEY', 'EXA_API_KEY']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    logger.error(f"Missing environment variables: {', '.join(missing_vars)}")
    logger.error("Please ensure .env file exists and contains required variables")
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# Initialize Flask app
app = Flask(__name__)

# Define allowed origins
allowed_origins = [
    "http://localhost:3000",
    "https://gyaan-app.vercel.app"
]

# Initialize CORS with Flask-CORS
CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        "expose_headers": ["Content-Length", "X-JSON"],
        "supports_credentials": True,
        "max_age": 600
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
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store'
    return response

@app.route('/explain-sentence', methods=['POST', 'OPTIONS'])
def explain_sentence():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        return make_response('', 200)
    
    try:
        data = request.get_json()
        sentence = data.get('sentence')
        topic = data.get('topic')

        if not sentence or not topic:
            return jsonify({'error': 'Missing required parameters'}), 400
        
    except Exception as e:
        print(f"Error in explain_sentence: {str(e)}")
        return jsonify({'error': str(e)}), 500

    try:
        # Get the last conversation for this topic if it exists
        conversation_history = []
        if hasattr(client, 'last_conversation') and client.last_conversation.get('topic') == topic:
            conversation_history = client.last_conversation.get('messages', [])

        # Create the new message
        messages = conversation_history + [{
            "role": "user",
            "content": f"""Explain '{sentence}' in the context of {topic}. Structure your response as a single paragraph under 70 words. Use simple english and key words. Get right to the answer, do not use  phrases like 'in the context of' or 'in relation to'.

Make every word count - pack in meaning while maintaining readability."""
        }]

        response = client.messages.create(
            model=SONNET_MODEL,
            max_tokens=1600,
            system="You are a knowledgeable expert who explains concepts clearly and concisely. Focus on making dense, information-rich explanations that highlight key terminology and relationships.",
            messages=messages
        )

        # Store this conversation for future context
        client.last_conversation = {
            'topic': topic,
            'messages': messages + [{"role": "assistant", "content": str(response.content)}]
        }

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
        logger.error(f"Error in explain_sentence: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/generate_learning_cards', methods=['POST', 'OPTIONS'])
def generate_learning_cards():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response, 200
        
    try:
        data = request.get_json()
        print("Received data:", data)
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

Return the response in this exact JSON format, with no additional text or formatting. max 20 words per card:
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
3. A concise summary under 20 words in simple but conceptually dense language

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

@app.route('/generate_questions', methods=['POST'])
@app.route('/api/generate_questions', methods=['POST'])
def generate_questions():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Missing text'}), 400

    try:
        # Construct the instruction
        instructions = f"""Based on the following text, generate 3 simple comprehension questions that could be used to test understanding. one is practice, one is theoretical, one is historical:

{text}

Provide **only** the JSON response in the following format and nothing else:

{{
  "questions": [
    "Question 1",
    "Question 2", 
    "Question 3"
  ]
}}

Ensure that:
- All property names and string values are enclosed in double quotes.
- There is no additional text, explanation, or code formatting.
- The JSON is valid and can be parsed by standard JSON parsers.

Do not include any extra text before or after the JSON object."""

        # Create message using the new API syntax
        message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=500,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": instructions
                }
            ]
        )

        # Extract the response content
        response_content = message.content[0].text

        # Debug: Log the AI's raw response
        print("[DEBUG] AI response content:")
        print(response_content)

        try:
            # Try to parse the JSON directly first
            questions_data = json.loads(response_content)
            return jsonify(questions_data)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON using regex
            import re
            json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
                
                # Replace single quotes with double quotes
                json_text = json_text.replace("'", '"')
                
                # Remove trailing commas
                json_text = re.sub(r',\s*([}\]])', r'\1', json_text)
                
                try:
                    questions_data = json.loads(json_text)
                    return jsonify(questions_data)
                except json.JSONDecodeError as e:
                    print(f"JSON decoding failed: {e}")
                    print(f"Invalid JSON text: {json_text}")
                    return jsonify({'error': f'Invalid JSON format from AI response: {e}'}), 500
            else:
                print(f"No JSON object found in the AI response: {response_content}")
                return jsonify({'error': 'AI response did not contain a valid JSON object'}), 500

    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add this near your other decorators
def handle_perplexity_request(retries=3, timeout=30):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            last_error = None
            for attempt in range(retries):
                try:
                    return f(*args, **kwargs)
                except requests.exceptions.ReadTimeout:
                    logger.warning(f"Perplexity API timed out, attempt {attempt + 1}/{retries}")
                    time.sleep(2 ** attempt)  # Exponential backoff
                    last_error = "Perplexity API timed out repeatedly"
                except requests.exceptions.RequestException as e:
                    logger.error(f"Perplexity API request failed: {str(e)}")
                    time.sleep(2 ** attempt)
                    last_error = str(e)
                except Exception as e:
                    logger.error(f"Unexpected error in Perplexity request: {str(e)}")
                    raise
            
            # If we've exhausted all retries
            return jsonify({'error': last_error}), 504
        return decorated_function
    return decorator

# Update the generate_examples route
@app.route('/generate_examples', methods=['POST'])
@handle_perplexity_request(retries=3, timeout=45)
def generate_examples():
    try:
        data = request.get_json()
        
        # Validate required parameters
        if not data.get('text') or not data.get('topic'):
            return jsonify({'error': 'Missing required parameters: text and topic'}), 400

        perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        if not perplexity_key:
            return jsonify({'error': 'Perplexity API key not configured'}), 500

        headers = {
            'Authorization': f'Bearer {perplexity_key}',
            'Content-Type': 'application/json',
        }

        data_payload = {
            "model": "llama-3.1-sonar-large-128k-online",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Be precise and concise. You are an expert at finding real-world examples "
                        "with verifiable sources."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Find a specific real-world example of this concept from {data['topic']}: "
                        f"'{data['text']}'. Keep the example under 100 words and include citation "
                        "numbers in the text that match the returned citations. Maximum 3 paragraphs."
                    )
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.2,
            "top_p": 0.9,
            "search_domain_filter": ["perplexity.ai"],
            "return_images": False,
            "return_related_questions": False,
            "search_recency_filter": "month",
            "top_k": 0,
            "stream": False,
            "presence_penalty": 0,
            "frequency_penalty": 1
        }

        logger.debug("Perplexity API Request Payload: %s", data_payload)

        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=data_payload,
            timeout=45  # Match the decorator
        )

        # Log raw response text for debugging
        logger.debug("Perplexity API Raw Response: %s", response.text)

        response_json = response.json()

        # Now parse content and citations as needed.
        # Adjust if Perplexity's response structure differs from typical openAI-like format
        content = ""
        if "choices" in response_json:
            # If Perplexity returns choices array
            content = (
                response_json.get('choices', [{}])[0]
                .get('message', {})
                .get('content', '')
            )
        elif "completions" in response_json:
            # If they return completions array (depends on their final specs)
            content = response_json['completions'][0].get('text', '')

        # If citations exist - adjust if they appear differently.
        citations = response_json.get('citations', [])

        # Format citations
        formatted_citations = []
        from urllib.parse import urlparse
        for url in citations:
            try:
                parsed_url = urlparse(url)
                display_text = parsed_url.netloc.replace('www.', '')
                formatted_citations.append({
                    'text': display_text,
                    'url': url
                })
            except Exception as e:
                logger.error(f"Error formatting citation URL '{url}': {str(e)}")

        # Build final response data
        response_data = {
            'examples': [{
                'description': content or 'No content returned.',
                'type': 'Real-world Example',
                'timestamp': datetime.now().isoformat(),
                'text': data['text'],
                'topic': data['topic']
            }],
            'citations': formatted_citations
        }

        return jsonify(response_data), 200

    except Exception as error:
        logger.error(f"Error in generate_examples: {str(error)}")
        return jsonify({'error': str(error)}), 500

# Add new route to get/set API keys
@app.route('/api/settings', methods=['GET', 'POST'])
def handle_settings():
    if request.method == 'POST':
        data = request.get_json()
        try:
            # Update environment variables with user-provided keys
            if 'claude' in data and data['claude']:
                os.environ['ANTHROPIC_API_KEY'] = data['claude']
                client = anthropic.Anthropic(api_key=data['claude'])
            
            if 'perplexity' in data and data['perplexity']:
                os.environ['PERPLEXITY_API_KEY'] = data['perplexity']
            
            # Don't write to .env file in production
            if os.getenv('FLASK_ENV') != 'production':
                env_path = os.path.join(os.path.dirname(__file__), '.env')
                try:
                    with open(env_path, 'w') as f:
                        f.write(f"ANTHROPIC_API_KEY={os.getenv('ANTHROPIC_API_KEY')}\n")
                        f.write(f"PERPLEXITY_API_KEY={os.getenv('PERPLEXITY_API_KEY')}\n")
                except IOError as e:
                    logger.warning(f"Could not write to .env file: {str(e)}")
            
            return jsonify({"message": "Settings updated successfully"})
            
        except Exception as e:
            logger.error(f"Error updating settings: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'GET':
        # Return masked versions of current keys
        def mask_key(key):
            if not key:
                return ''
            return f"{key[:5]}...{key[-5:]}" if len(key) > 10 else key
        
        return jsonify({
            "claude": mask_key(os.getenv('ANTHROPIC_API_KEY')),
            "perplexity": mask_key(os.getenv('PERPLEXITY_API_KEY'))
        })

# Modify the initialization of API clients
def initialize_api_clients():
    global client, exa
    try:
        anthropic_key = os.getenv('ANTHROPIC_API_KEY')
        perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        
        if anthropic_key:
            client = anthropic.Anthropic(api_key=anthropic_key)
        if perplexity_key:
            # Update headers in generate_examples function
            pass  # The headers are already set in the function
            
    except Exception as e:
        logger.error(f"Error initializing API clients: {str(e)}")
        raise

# Call initialize_api_clients when the app starts
initialize_api_clients()

@app.errorhandler(500)
def handle_500_error(e):
    logging.error(f"Internal server error: {str(e)}")
    return jsonify(error="Internal server error", message=str(e)), 500

if __name__ == '__main__':
    print('[app.py] __main__ starting')
    app.run(debug=True, port=5001)
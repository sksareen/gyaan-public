from flask import Flask, render_template, request, jsonify
from exa_py import Exa
import anthropic
import os
from dotenv import load_dotenv
# import requests
from datetime import datetime

# Move load_dotenv() to the top, before any env var access
load_dotenv()

app = Flask(__name__)
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
exa = Exa(api_key=os.getenv('EXA_API_KEY'))

# Load prompts from files
def load_prompt(filename):
    with open(os.path.join('prompts', filename), 'r') as file:
        return file.read().strip()

SYSTEM_PROMPT = load_prompt('system_prompt.txt')
ROADMAP_PROMPT = load_prompt('roadmap_prompt.txt')
RESOURCES_PROMPT = load_prompt('resources_prompt.txt')
GOALS_PROMPT = load_prompt('goals_prompt.txt')
MODULE_CONTENT_PROMPT = load_prompt('module_content_prompt.txt')

HAIKU_MODEL = "claude-3-haiku-20240307"
SONNET_MODEL = "claude-3-5-sonnet-20241022"

# Add near the top of your file
DUMMY_MODE = False

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
   - 98.6°F to Celsius (should be 37°C)

Bonus: Add input validation and round results to 1 decimal place."""
    }
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

@app.errorhandler(Exception)
def handle_error(error):
    print(f"Error: {str(error)}")
    return jsonify(error=str(error)), 500

@app.route('/generate_goals', methods=['POST'])
def generate_goals():
    if DUMMY_MODE:
        return jsonify({"goals": DUMMY_RESPONSES["goals"]})
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        topic = request.json.get('topic')
        proficiency = request.json.get('proficiency')
        
        if not topic or not proficiency:
            return jsonify({"error": "Missing required fields: topic and proficiency"}), 400
        
        message = client.messages.create(
            model=HAIKU_MODEL,
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user", 
                "content": GOALS_PROMPT.format(topic=topic, proficiency=proficiency)
            }]
        )
        
        goals_text = str(message.content)
        return jsonify({"goals": goals_text})
    except Exception as e:
        print(f"Error in generate_goals: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_roadmap', methods=['POST'])
def generate_roadmap():
    if DUMMY_MODE:
        return jsonify({
            "roadmap": DUMMY_RESPONSES["roadmap"],
            "resources": DUMMY_RESPONSES["resources"]
        })
    try:
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
            model=HAIKU_MODEL,
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": ROADMAP_PROMPT.format(
                    topic=topic,
                    goals_text=goals_text,
                    proficiency=proficiency
                )
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
        
        response_data = {
            "roadmap": str(message.content),  # Ensure roadmap content is a string
            "resources": resources
        }
        
        print("Sending response...")
        return jsonify(response_data)
    except Exception as e:
        print("Error in generate_roadmap:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500


@app.route('/generate_module_content', methods=['POST'])
def generate_module_content():
    if DUMMY_MODE:
        return jsonify(DUMMY_RESPONSES["module"])
    try:
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
            model=HAIKU_MODEL,
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"""Generate first principles content for learning {topic}.
                Proficiency level: {proficiency}
                Learning goals:
                {goals_text}"""
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

        response_data = {
            "firstPrinciples": str(first_principles_message.content),
            "keyInformation": str(key_info_message.content),
            "practiceExercise": str(practice_message.content)
        }

        return jsonify(response_data)

    except Exception as e:
        print(f"Error generating module content: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.after_request
def add_header(response):
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5001)
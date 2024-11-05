from flask import Flask, render_template, request, jsonify
import anthropic
import os
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()

app = Flask(__name__)
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Load prompts from files
def load_prompt(filename):
    with open(os.path.join('prompts', filename), 'r') as file:
        return file.read().strip()

SYSTEM_PROMPT = load_prompt('system_prompt.txt')

# Add near the top of your file
DUMMY_MODE = True

DUMMY_RESPONSES = {
    "goals": """1. Master Python syntax and basic programming concepts
2. Learn object-oriented programming principles
3. Build simple command-line applications
4. Understand web development basics with Python
5. Practice with real-world coding exercises""",
    
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
    ]
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
        
        goals_prompt = load_prompt('goals_prompt.txt')
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user", 
                "content": goals_prompt.format(topic=topic, proficiency=proficiency)
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
        
        system_prompt = load_prompt('system_prompt.txt')
        roadmap_prompt = load_prompt('roadmap_prompt.txt')
        resources_prompt = load_prompt('resources_prompt.txt')
        
        # Generate roadmap with Claude
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2000,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": roadmap_prompt.format(
                    topic=topic,
                    goals_text=goals_text,
                    proficiency=proficiency
                )
            }]
        )
        
        print("Roadmap generated, fetching resources...")
        
        # Get relevant resources from Claude
        resources_message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=resources_prompt,
            messages=[{
                "role": "user",
                "content": f"Please suggest 5 high-quality learning resources with URLs for learning about: {topic}"
            }]
        )
        
        # Parse resources response into a list of dictionaries
        resources_text = str(resources_message.content)  # Convert content to string
        resources_lines = [line for line in resources_text.split('\n') if line.strip()]
        resources = []
        for i, line in enumerate(resources_lines[:5]):
            if line.strip():
                resources.append({
                    "title": f"Resource {i+1}",
                    "url": line.strip()
                })
        
        response_data = {
            "roadmap": str(message.content),  # Also ensure roadmap content is string
            "resources": resources
        }
        
        print("Sending response...")
        return jsonify(response_data)
    except Exception as e:
        print("Error in generate_roadmap:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
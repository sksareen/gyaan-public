# Gyaan Learning App

## Introduction

The Gyaan Learning App is a web application designed to help users learn and understand complex topics by breaking them down into smaller, more manageable parts. It uses a combination of AI and human-curated content to provide a personalized learning experience.

## Instructions

1. Clone the repository
- `git clone https://github.com/gyaan-public.git`

2. Install python (skip if already installed)
- Install python 3.11+
- (Optional) alias python to `python3` e.g. `alias python=python3`
- Install pip

3. Setup python environment
- Install virtualenv `pip install virtualenv`
- Create virtual environment e.g. `python -m venv .venv`
- Activate virtual environment e.g. `source .venv/bin/activate`
- Install python dependencies `pip install -r requirements.txt`

3. Setup the environment variables
- Create `.env` file
- Add environment variables e.g. `ANTHROPIC_API_KEY=<your-anthropic-api-key>`

4. Run the application
- `python -m flask run`
- Open browser and navigate to `http://127.0.0.1:5001/`

# Application Overview

## Key Features

- Modular architecture for better code organization and maintainability
- Clear separation of concerns between UI, state management, and business logic
- Consistent loading state management across different operations
- Progress tracking for roadmap sections
- Error handling and debug logging

## Usage

The modules are imported and used in the main application.

The frontend is built using modular JavaScript components. Each module is responsible for a specific functionality and can be developed independently.

### main.js
The main entry point that initializes the application and manages global state. It coordinates between different modules and handles the core application flow.

### loading.js
Handles loading states and UI feedback during asynchronous operations:
- `setLoading()`: Toggles loading indicators for different operations (goals/roadmap generation)
- Manages button states, spinners, and loading text

### progress.js 
Manages the roadmap progress tracking functionality:
- `updateProgress()`: Updates the progress bar and percentage display
- Tracks current section vs total sections
- Handles visibility of the roadmap section


## Development Guidelines

### Code Style
- Use ES6+ features
- Follow airbnb-style guide
- Maintain consistent naming conventions
- Document all public methods and interfaces

### Testing
- Unit tests for all modules
- Integration tests for module interactions
- E2E tests for critical user flows
- Test coverage minimum: 80%

### Performance
- Lazy loading for non-critical modules
- Bundle optimization and code splitting
- Resource caching strategies
- Performance monitoring and metrics

### Security
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure data storage practices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## Build and Deployment


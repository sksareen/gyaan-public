# Learning Path Generator (React + Flask)

## Introduction

The Learning Path Generator is a web application that helps users learn and understand complex topics by breaking them down into smaller, more manageable parts. It uses AI to generate personalized learning paths, roadmaps, and detailed content. This version features a modern React frontend with a Python Flask backend.

## Project Structure

```
learning_app_react/
├── backend/
│   ├── app.py
│   ├── prompts/
│   ├── requirements.txt
│   └── venv/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LearningForm.js
│   │   │   ├── Roadmap.js
│   │   │   └── ModuleContent.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
│   └── package.json
└── start.sh
```

## Setup Instructions

1. Install Dependencies:

   Backend:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Environment Variables:
   Create a `.env` file in the backend directory:
   ```
   ANTHROPIC_API_KEY=<your-anthropic-api-key>
   EXA_API_KEY=<your-exa-api-key>
   ```

3. Start the Application:
   ```bash
   ./start.sh
   ```
   This will start both the frontend (http://localhost:3000) and backend (http://localhost:5001) servers.

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


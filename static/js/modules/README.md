# Learning from First Principles - Frontend Modules

This directory contains the modular JavaScript components that power the Learning from First Principles application's frontend functionality.

## Module Overview

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

## Key Features

- Modular architecture for better code organization and maintainability
- Clear separation of concerns between UI, state management, and business logic
- Consistent loading state management across different operations
- Progress tracking for roadmap sections
- Error handling and debug logging

## Usage

The modules are imported and used in the main application.



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

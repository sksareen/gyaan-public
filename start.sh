#!/bin/bash

# Start the backend server
cd backend
source venv/bin/activate
python app.py &

# Start the frontend development server
cd ../frontend
npm start
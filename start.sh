#!/bin/bash

# Start the backend server
cd backend
source venv/bin/activate
pip install -r requirements.txt
python app.py &

# Start the frontend development server
cd ../frontend
npm start
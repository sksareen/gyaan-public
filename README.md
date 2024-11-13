# Gyaan Learning

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Gyaan Learning is an AI-powered education platform that generates personalized learning paths and roadmaps. By breaking down complex topics into digestible modules, it helps learners master new subjects efficiently and effectively.

## ✨ Features

- 🤖 AI-generated learning paths tailored to your goals
- 📚 Detailed content and resources for each learning module
- 📊 Progress tracking and learning analytics (coming soon)
- 🎯 Interactive roadmap visualization (coming soon)
- 💡 Smart recommendations based on learning style (coming soon)

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Python (Flask)
- **AI Integration**: Anthropic Claude API
- **Search**: Exa API

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (3.8+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/sksareen/gyaan-public.git
cd gyaan-public
```

2. Set up the backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables
```bash
# Create .env file with:
ANTHROPIC_API_KEY=your_api_key
EXA_API_KEY=your_api_key
```

4. Set up the frontend
```bash
cd frontend
npm install
```

5. Start the application
```bash
# From the root directory
./start.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## 📁 Project Structure

```
gyaan-public/
├── backend/
│   ├── app.py              # Flask application
│   ├── prompts/            # AI prompt templates
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration
│   │   └── App.js         # Main application
│   └── package.json
└── start.sh               # Startup script
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear bug description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for AI capabilities
- [Exa](https://exa.ai/) for search functionality
- All our contributors and supporters

## 📬 Contact

- Project Link: [https://github.com/sksareen/gyaan-public](https://github.com/sksareen/gyaan-public)
- Report Issues: [Issue Tracker](https://github.com/sksareen/gyaan-public/issues)

---

<p align="center">Made with ❤️ for lifelong learners</p>

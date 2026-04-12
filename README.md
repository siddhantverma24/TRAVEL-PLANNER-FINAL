![Jenkins Build Status](http://localhost:8080/buildStatus/icon?job=travel-planner-ci)

# Travel Planner

A full-stack travel planning application with AI-powered features, real-time flight tracking, weather forecasts, currency conversion, and more.

## CI/CD Pipeline

Every push to `main` automatically triggers a Jenkins CI/CD pipeline that:
- **Pulls** the latest code from GitHub
- **Builds** Docker images for the Flask backend and Nginx frontend
- **Starts** both containers and runs a health check on the backend
- **Verifies** that the application is ready for deployment

The pipeline fails fast if anything is broken, ensuring that the `main` branch always remains deployable.

---

## Features

- 🔍 **AI-Powered Search** - powered by Groq API
- ✈️ **Flight Information** - real-time flight tracking
- 🏨 **Hotel Recommendations** - find the best stays
- 🗺️ **Maps Integration** - interactive travel planning
- 💱 **Currency Conversion** - live exchange rates
- 🌤️ **Weather Forecasts** - stay prepared
- 🗣️ **Translation & Phrases** - communicate anywhere
- 📋 **Itinerary Management** - organize your trip
- 🧳 **Packing Guide** - don't forget anything
- 🛂 **Visa Information** - stay compliant
- 🎯 **Travel Quiz** - discover new destinations

---

## Quick Start with Docker

### Prerequisites
- Docker & Docker Compose installed
- `.env` file with API keys (copy from `.env.example`)

### Run the Application

```bash
# Clone the repository
git clone https://github.com/siddhantverma24/TRAVEL-PLANNER-FINAL.git
cd TRAVEL-PLANNER-FINAL

# Copy and configure the environment file
cp .env.example .env
# Edit .env and add your API keys

# Start the application
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

---

## Project Structure

```
.
├── backend/              # Flask API (Python)
│   ├── app.py           # Main application entry point
│   ├── db.py            # Database utilities
│   ├── routes/          # API route blueprints
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile       # Backend container image
├── frontend/            # Nginx web server (HTML/CSS/JS)
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── nginx.conf
│   └── Dockerfile       # Frontend container image
├── jenkins/             # Jenkins CI/CD configuration
│   ├── Dockerfile.jenkins
│   └── docker-compose.jenkins.yml
├── Jenkinsfile          # CI/CD pipeline definition
├── docker-compose.yml   # Multi-container orchestration
└── README.md            # This file
```

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Architecture

### Backend
- **Framework**: Flask (Python)
- **Port**: 5000
- **API Routes**: `/weather`, `/currency`, `/flights`, `/hotels`, `/maps`, `/translate`, `/visa`, `/packing`, `/phrases`, `/quiz`, `/itinerary`

### Frontend
- **Server**: Nginx
- **Port**: 80
- **Type**: Static HTML/CSS/JavaScript with AJAX requests to backend

### CI/CD
- **Pipeline**: Jenkins
- **Build Steps**: Docker image builds, container health checks
- **Deployment**: Automatic on every push to `main`

---

## Environment Variables

Required in `.env`:
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `OPENWEATHER_KEY` - OpenWeather API key
- `EXCHANGE_KEY` - Exchange rate API key
- `AVIATIONSTACK_KEY` - Flight data API key
- `RAPIDAPI_KEY` - RapidAPI master key
- `GROQ_KEY` - Groq API key for AI

See [.env.example](.env.example) for all available options.

---

## Troubleshooting

### Backend crashes with "Could not import 'app'"
This typically occurs when volume mounts interfere with the Docker build in CI environments.
**Solution**: Ensure `docker-compose.yml` has no `volumes:` block for production use.

### Health check fails
- Verify the backend is actually running: `docker logs container_name`
- Check that required Python packages are installed in the container
- Ensure all environment variables are properly set

### Frontend shows blank page
- Check that the backend is running and accessible
- Verify network connectivity between frontend and backend containers
- Check browser console for JavaScript errors

---

## License

[Add your license here]

---

## Contact

For questions or issues, please open a GitHub Issue.

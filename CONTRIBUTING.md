# Contributing to Travel Planner

Thank you for your interest in contributing! This guide explains how to work with our automated CI/CD pipeline.

---

## CI/CD Pipeline Overview

This project uses **Jenkins** for continuous integration and deployment.

### What Happens When You Push to `main`

Every push to the `main` branch automatically triggers a Jenkins pipeline that:

1. **Pulls** the latest code from GitHub
2. **Builds Docker Images**:
   - Flask backend image (Python on port 5000)
   - Nginx frontend image (static files on port 80)
3. **Starts Containers**: Launches both services in a Docker network
4. **Health Check**: Verifies the backend API is live and responding
5. **Validates**: Ensures the frontend can start after the backend is healthy

If any step fails, the pipeline stops immediately and reports the failure. This keeps `main` always deployable.

---

## Before You Push

### Local Testing with Docker Compose

Always verify your changes work locally before pushing:

```bash
# Install dependencies (if needed)
pip install -r backend/requirements.txt

# Build and start containers locally
docker-compose up --build

# Verify both services are running
docker ps

# Test the backend health check
curl http://localhost:5000/

# Test the frontend
open http://localhost
```

### What to Check

- ✅ **Backend starts** without import errors
- ✅ **Frontend serves** on port 80
- ✅ **Services can communicate** across the Docker network
- ✅ **Health check passes**: `curl http://localhost:5000/` returns a response
- ✅ **No Python syntax errors**: Test with `python -m py_compile backend/app.py`

### Environment Variables

Make sure your `.env` file includes required API keys:
- `OPENAI_API_KEY`
- `OPENWEATHER_KEY`
- `EXCHANGE_KEY`
- `AVIATIONSTACK_KEY`
- `RAPIDAPI_KEY`
- `GROQ_KEY`

See [.env.example](.env.example) for details.

---

## Making Changes

### Code Organization

- **Backend**: `backend/routes/*.py` - Add new API endpoints here
- **Frontend**: `frontend/*.html`, `frontend/script.js` - Add UI features here
- **Configuration**: Update `docker-compose.yml`, `Jenkinsfile` for deployment changes

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test locally:
   ```bash
   docker-compose up --build
   # Test your changes thoroughly
   ```

3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```

4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request (PR) to `main`

### Commit Message Convention

Use clear, descriptive commit messages:
- `feat: add new feature` - New feature
- `fix: fix bug description` - Bug fix
- `docs: update documentation` - Documentation only
- `refactor: improve code structure` - Code refactoring
- `test: add test coverage` - Test additions

---

## Jenkins Build Requirements

Your code must satisfy these requirements for the Jenkins build to pass:

### 1. No Import Errors
```bash
# Test this locally
cd backend
python -c "import app"
```

If this fails in Jenkins, the build fails immediately.

### 2. Backend Must Be Reachable
The health check at `http://localhost:5000/` must respond (any HTTP status is acceptable).

### 3. Frontend Must Start
After the backend health check passes, the frontend must start without errors.

### 4. Docker Images Must Build
Both `backend/Dockerfile` and `frontend/Dockerfile` must build successfully.

---

## Troubleshooting CI/CD Failures

### Build Error: "Could not import 'app'"

**Cause**: Python import error in `backend/app.py` or its dependencies.

**Fix**:
```bash
# Test locally
cd backend
python -c "import app"
# This will show the actual import error
```

Common causes:
- Missing package in `requirements.txt`
- Syntax error in Python code
- Circular imports
- Missing environment variables at runtime

### Build Error: "Service backend is not healthy"

**Cause**: Backend starts but health check fails.

**Fix**:
```bash
# Check backend logs
docker logs <backend-container-id>

# Test the health endpoint manually
curl -v http://localhost:5000/
```

### Volume Mount Issues in Jenkins

**Important**: `docker-compose.yml` should have **NO** `volumes:` block because Jenkins workspaces may not align with host paths. For local development, create `docker-compose.override.yml` with volume mounts (this file is `.gitignore`d).

---

## Deployment

Only push to `main` when:
- ✅ All tests pass locally
- ✅ Docker images build successfully
- ✅ Backend health check responds
- ✅ Frontend loads without errors

Once merged to `main`, the Jenkins pipeline automatically validates and prepares your changes for deployment.

---

## Questions or Issues?

1. Check the [README.md](README.md) for project overview
2. Review [QUICKSTART.md](QUICKSTART.md) for setup instructions
3. Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for Docker specifics
4. Open a GitHub Issue if you need help

---

Thank you for contributing!

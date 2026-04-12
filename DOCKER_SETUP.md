# ================================================================================
# Docker Setup Guide - Travel Planner AI Application
# ================================================================================
# Complete guide for building, running, and managing the Dockerized application
# ================================================================================

## 📋 Quick Start (TL;DR)

```bash
# 1. Copy the environment file template
cp .env.example .env

# 2. Edit .env and add your API keys (at minimum: OPENWEATHER_KEY, EXCHANGE_KEY)
# 3. Run everything with one command:
docker-compose up --build

# 4. Access the application:
# Frontend: http://localhost (port 80)
# Backend API: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

## 📁 Files Created

This Docker setup includes the following files (all now created):

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Builds Python Flask API container |
| `frontend/Dockerfile` | Builds Nginx web server container |
| `frontend/nginx.conf` | Nginx configuration (static serving + API proxy) |
| `docker-compose.yml` | Orchestrates both services |
| `.dockerignore` | Excludes unnecessary files from builds |
| `.env.example` | Sample environment variables template |
| `DOCKER_SETUP.md` | This file - comprehensive setup guide |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                            │
│  (travel-planner-network - enables service-to-service DNS)  │
├─────────────────────┬─────────────────────────────────────┤
│                     │                                       │
│  ┌───────────────┐  │  ┌──────────────────────────────┐   │
│  │   Frontend    │  │  │   Backend                    │   │
│  │  (Nginx)      │  │  │   (Flask Python API)         │   │
│  │               │  │  │                              │   │
│  │  - Port 80    │  │  │ - Port 5000                  │   │
│  │  - Serves:    │  │  │ - Handles:                   │   │
│  │    • HTML     │  │  │   • /api/weather             │   │
│  │    • CSS      │  │  │   • /api/flights             │   │
│  │    • JS       │  │  │   • /api/hotels              │   │
│  │    • Videos   │  │  │   • /api/visa                │   │
│  │  - Proxies    │  │  │   • /api/hero-ai             │   │
│  │    /api/* → │  │  │   • ... (other endpoints)    │   │
│  │    backend   │  │  │                              │   │
│  └───────────────┘  │  └──────────────────────────────┘   │
│                     │                                       │
└─────────────────────┴─────────────────────────────────────┘
         ↑                              ↑
    Host Port 80                   Host Port 5000
    (http://localhost)        (http://localhost:5000)
```

### How Components Communicate:
1. **Browser → Frontend**: Browser connects to Nginx on port 80
2. **Frontend → Frontend Assets**: Nginx serves HTML/CSS/JS from `/usr/share/nginx/html`
3. **Frontend → Backend**: Nginx reverse proxy forwards `/api/*` to `http://backend:5000`
4. **Backend ↔ External APIs**: Backend makes requests to OpenWeather, ExchangeRate, etc.

---

## 🚀 Detailed Setup Instructions

### Step 1: Prepare Environment Variables

```bash
# Copy the template
cp .env.example .env

# Edit .env to add your API keys
# At minimum, add (all free tiers available):
# - OPENWEATHER_KEY: https://openweathermap.org/api
# - EXCHANGE_KEY: https://www.exchangerate-api.com
# - (Optional) ANTHROPIC_API_KEY: https://console.anthropic.com

# Tip: Use your favorite editor (VS Code, nano, vim, etc.)
# Linux/macOS: nano .env
# Windows PowerShell: notepad .env
# Windows: Open Explorer and edit in text editor
```

### Step 2: Build and Start Services

```bash
# Build images and start containers (combines docker-compose build + up)
docker-compose up --build

# First run takes longer (downloads base images, installs dependencies)
# Subsequent runs are much faster (uses cached layers)

# Expected output in terminal:
# - "Pulling python:3.11-slim" (first time only)
# - "Pulling nginx:alpine" (first time only)
# - "Building backend" (first time only)
# - "Building frontend" (first time only)
# - "Starting travel-planner-backend"
# - "Starting travel-planner-frontend"
# - No errors = Success! ✅
```

### Step 3: Verify Everything is Running

```bash
# In another terminal, check status:
docker-compose ps

# Expected output:
# NAME                         STATUS              PORTS
# travel-planner-backend       Up (healthy)        0.0.0.0:5000->5000/tcp
# travel-planner-frontend      Up (healthy)        0.0.0.0:80->80/tcp

# Check health endpoints in browser or curl:
# Backend health:
curl http://localhost:5000/api/health

# Frontend loads (should show HTML):
curl http://localhost

# Expected backend output: {"status":"ok","apis":{...}}
# Expected frontend output: HTML content of index.html
```

### Step 4: Access the Application

**Frontend (Static Files + UI):**
```
http://localhost
```
- Open in any browser
- Shows travel planner interface
- Can search destinations, weather, trips

**Backend API (Direct Testing):**
```
http://localhost:5000/api/health
```
- Returns JSON health status with enabled API info
- Useful for debugging and verifying APIs are configured

**Test Individual APIs from Browser Console (F12):**
```javascript
// Test weather API
fetch('http://localhost:5000/api/weather?city=New%20York')
  .then(r => r.json())
  .then(d => console.log(d))

// Test currency API
fetch('http://localhost:5000/api/currency?base=USD&targets=EUR,GBP')
  .then(r => r.json())
  .then(d => console.log(d))

// Test visa API
fetch('http://localhost:5000/api/visa?from=US&to=JP')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🔥 Development Workflow (Hot Reload)

### Active Development with Auto-Reload

The docker-compose setup supports live code changes without rebuilding:

```bash
# Start services (they stay running)
docker-compose up

# While running, edit your code:
# - Backend: Modify backend/app.py or backend/routes/*.py
#   → Flask auto-reloads immediately (FLASK_ENV=development)
# - Frontend: Modify frontend/index.html, script.js, style.css
#   → Changes serve immediately from Nginx volume mount

# No `docker-compose restart` needed - changes appear instantly!
```

### View Logs During Development

```bash
# See logs from all services
docker-compose logs -f

# See logs from specific service only
docker-compose logs -f backend
docker-compose logs -f frontend

# Follow only new logs (ignore past logs)
docker-compose logs -f --tail=50 backend

# Search logs for errors/warnings
docker-compose logs backend | grep -i error
```

### Access Container Shell (Debugging)

```bash
# Get a bash shell inside backend container
docker-compose exec backend bash

# Now you can:
# - Run Python commands
# - Check installed packages: pip list
# - Test imports: python -c "import anthropic"
# - Run Flask CLI: flask db migrate
# - Exit: exit or Ctrl+D

# Get a shell inside frontend (Nginx)
docker-compose exec frontend sh

# Nginx container runs Alpine Linux (sh, not bash)
# Check Nginx config: cat /etc/nginx/conf.d/default.conf
# Reload config: nginx -s reload
```

### Execute Commands Inside Running Containers

```bash
# Run a one-off Python script
docker-compose exec backend python -c "print('Hello from container')"

# Run Flask CLI commands (migrations, shell, etc.)
docker-compose exec backend flask shell

# Install additional Python packages (temporary - persists until rebuild)
docker-compose exec backend pip install package-name

# Check environment variables set in container
docker-compose exec backend env | grep FLASK
```

---

## 🛑 Stopping and Cleaning Up

### Stop Without Removing Containers

```bash
# Stops all containers (can restart them later)
docker-compose stop

# Restart stopped containers
docker-compose start

# Restart (stop + start)
docker-compose restart
```

### Stop and Remove Everything

```bash
# Remove containers and networks (but keep volumes/images)
docker-compose down

# Remove everything including volumes and cached data
docker-compose down -v

# Remove images too (forces rebuild on next 'up')
docker-compose down -v --rmi all
```

---

## 🔍 Troubleshooting

### Issue 1: "Cannot GET /api/health" Error

**Cause:** Backend service isn't running or Flask isn't listening

**Solution:**
```bash
# Check if backend is running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Rebuild and restart
docker-compose down
docker-compose up --build
```

### Issue 2: "Connection refused" When Accessing Frontend

**Cause:** Nginx (frontend) isn't running or port 80 is already in use

**Solution:**
```bash
# Check if port 80 is in use (Windows PowerShell)
Get-NetTcpConnection -LocalPort 80

# Free up the port or use different mapping in docker-compose.yml
# Change: ports: - "8080:80"  (maps host 8080 → container 80)

# Or check Nginx logs
docker-compose logs frontend
```

### Issue 3: CORS Error in Browser Console

**Cause:** Frontend can't reach backend due to cross-origin policy

**Solution:**
```bash
# Verify API_BASE in frontend/api-integration.js is correct
grep -n "API_BASE" frontend/api-integration.js

# Should be: const API_BASE = 'http://localhost:5000'

# Check backend CORS is enabled in app.py
# Should have: from flask_cors import CORS; CORS(app)

# Restart backend
docker-compose restart backend
```

### Issue 4: "Port 5000 already in use"

**Cause:** Another service is using port 5000

**Solution:**
```bash
# Option 1: Stop the other service
# Option 2: Use different port in docker-compose.yml
# Change: ports: - "5001:5000"  (maps host 5001 → container 5000)

docker-compose down  # Kill all containers
docker-compose up --build
```

### Issue 5: "Cannot connect to backend" from frontend

**Cause:** Frontend and backend containers aren't on the same network or backend service name is wrong

**Solution:**
```bash
# Verify docker network exists
docker network ls  # Should show travel-planner-network

# Verify containers are connected to network
docker network inspect travel-planner-network

# Check backend service name in nginx.conf
# Should be: proxy_pass http://backend:5000;
# (backend is the service name from docker-compose.yml)

# Restart services
docker-compose down
docker-compose up --build
```

### Issue 6: "Module not found: anthropic"

**Cause:** Python packages not installed correctly

**Solution:**
```bash
# Rebuild backend (forces pip install)
docker-compose build --no-cache backend
docker-compose up

# Or install manually inside container
docker-compose exec backend pip install -r requirements.txt
```

### Issue 7: "Permission denied" When Writing Files

**Cause:** Containers running as non-root can't write to certain paths

**Solution:**
```bash
# Check volume ownership
docker-compose exec backend ls -la /app

# Ensure backend/Dockerfile creates appuser with proper permissions
# (Already done in our template)

# If database file can't be created, ensure directory is writable
docker-compose exec backend mkdir -p /app/data
```

---

## 📊 Environment Variables Reference

Key variables set in `.env` (loaded by docker-compose):

| Variable | Purpose | Example |
|----------|---------|---------|
| `FLASK_ENV` | Flask mode (development/production) | `development` |
| `FLASK_APP` | Flask app entry point | `app.py` |
| `OPENWEATHER_KEY` | Weather API key | `abc123def456` |
| `EXCHANGE_KEY` | Currency API key | `xyz789uvw` |
| `ANTHROPIC_API_KEY` | Claude AI API key | `sk-ant-...` |
| `DEBUG` | Flask debug mode | `True` (dev only!) |
| `DATABASE_URL` | Database connection string | `sqlite:///travel.db` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost` |
| `BACKEND_URL` | Backend URL for frontend | `http://localhost:5000` |

All variables in `.env` are loaded into container environment automatically!

---

## 🚢 Production Deployment

### Create Production Docker Compose Override

```bash
# Create docker-compose.prod.yml with production settings:
```

Content of `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      FLASK_ENV: production
      DEBUG: 'False'
    # Replace Flask dev server with Gunicorn for production
    command: gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 2 app:app
    # Remove volume mount (immutable container)
    # volumes: []
    # Add resource limits
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  frontend:
    # Remove volume mount in production
    # volumes: []
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### Run Production Deployment

```bash
# Start production stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

---

## 🐳 Docker Commands Cheat Sheet

```bash
# Images
docker images                           # List all images
docker build -t app:v1 .               # Build image
docker image prune                      # Remove unused images
docker image rm image_name              # Delete image

# Containers
docker ps                               # List running containers
docker ps -a                            # List all containers
docker logs container_name              # View container logs
docker exec -it container_name bash     # Access container shell
docker stop container_name              # Stop container
docker rm container_name                # Delete container

# Networks
docker network ls                       # List networks
docker network inspect network_name     # Inspect network

# Volumes
docker volume ls                        # List volumes
docker volume inspect volume_name       # Inspect volume
docker volume rm volume_name            # Delete volume

# Docker Compose
docker-compose up                       # Start services
docker-compose up -d                    # Start in background
docker-compose down                     # Stop and remove services
docker-compose ps                       # List services
docker-compose logs -f                  # Follow logs
docker-compose exec service bash        # Execute in service
docker-compose build                    # Build images
docker-compose pull                     # Pull latest base images
```

---

## 📚 Performance Tips

### Optimize Docker Build Speed
```bash
# Use BuildKit (faster, better caching)
DOCKER_BUILDKIT=1 docker-compose build

# Skip unchanged layers
docker-compose build --no-cache  # Force rebuild everything

# Use alpine/slim variants (smaller images)
# Already using python:3.11-slim and nginx:alpine
```

### Optimize Runtime Performance
```bash
# Limit CPU/memory per container (in docker-compose.yml)
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M

# Use environment-specific configs
FLASK_ENV=production  # Production mode is faster
DEBUG=False          # Disables verbose logging

# Increase Gunicorn workers (production)
gunicorn --workers 4 --threads 2 app:app
```

---

## 🔐 Security Considerations

✅ **What We're Doing Right:**
- Non-root user in backend container (appuser)
- Slim base images (smaller attack surface)
- .env not committed to git
- No hardcoded secrets in code
- Health checks for container monitoring
- Proper CORS configuration

⚠️ **Additional Security for Production:**
- Enable HTTPS/SSL with certificate
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Implement rate limiting on APIs
- Add request validation and sanitization
- Use Web Application Firewall (WAF)
- Regular security scanning of images
- Keep base images updated regularly

---

## 📖 Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Best Practices for Python Docker Images](https://docs.docker.com/language/python/build-images/)

---

## ✅ Success Checklist

- [ ] Copied `.env.example` to `.env`
- [ ] Added API keys to `.env` (at least OPENWEATHER_KEY and EXCHANGE_KEY)
- [ ] Ran `docker-compose up --build`
- [ ] Verified backend health: `curl http://localhost:5000/api/health`
- [ ] Verified frontend loads: `http://localhost` in browser
- [ ] No CORS errors in browser console
- [ ] Weather/currency/visa operations return real data
- [ ] Code changes auto-reload (edit backend/app.py and verify changes appear)

---

## 🆘 Need Help?

1. **Check Docker Logs**: `docker-compose logs -f` shows all output
2. **Check Service Status**: `docker-compose ps` shows if services are running
3. **Read Docker Compose Verbose Output**: Very helpful for debugging
4. **Check .env File**: Verify all required variables are set
5. **Check Ports**: Verify ports 80 and 5000 aren't blocked/in use

---

**You're ready to Dockerize your Travel Planner! 🎉** 

Start with `docker-compose up --build` and have fun! 🚀

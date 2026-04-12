# ✅ Quick Start Checklist - Docker Edition

Follow this checklist to get your Travel Planner up and running with Docker in **5 minutes**.

---

## Phase 1: Docker Setup (3 min)

This is the **easiest way to run the entire application**.

### Option A: Full Stack with Docker Compose (Recommended)

- [ ] **1.1 Prepare Environment File**
  ```bash
  # Copy the example environment file
  cp .env.example .env   # macOS/Linux
  copy .env.example .env # Windows
  ```

- [ ] **1.2 Add API Keys to .env** (Minimum: at least 1-2 keys to test)
  ```env
  OPENAI_API_KEY=your_key_here        # Get from: https://platform.openai.com
  OPENWEATHER_KEY=your_key_here       # Get from: https://openweathermap.org/api
  EXCHANGE_KEY=your_key_here          # Get from: https://www.exchangerate-api.com
  # ... add others as needed
  ```

- [ ] **1.3 Start Everything with Docker Compose**
  ```bash
  # Build and start all containers (first time takes ~2-3 minutes)
  docker-compose up --build
  
  # On subsequent runs, just use:
  docker-compose up
  ```

- [ ] **1.4 Verify All Services are Running**
  ```bash
  # In another terminal, check container status
  docker ps
  
  # Should show:
  # - travel-planner-backend-1  (Flask on port 5000)
  # - travel-planner-frontend-1 (Nginx on port 80)
  ```

### Option B: Traditional Virtual Environment (Alternative)

If you prefer running without Docker:

- [ ] **1.1 Create Virtual Environment**
  ```bash
  python -m venv venv
  venv\Scripts\activate  # Windows
  source venv/bin/activate # macOS/Linux
  ```

- [ ] **1.2 Install Dependencies**
  ```bash
  pip install -r requirements.txt
  ```

- [ ] **1.3 Create .env File**
  ```bash
  cp .env.example .env
  ```

- [ ] **1.4 Add API Keys (same as Option A)**

- [ ] **1.5 Start Backend**
  ```bash
  cd backend
  flask --app app run --debug --host=0.0.0.0 --port=5000
  ```

- [ ] **1.6 Start Frontend (in new terminal)**
  ```bash
  python -m http.server 80 --directory frontend
  ```

---

## Phase 2: Access Your Application (1 min)

### With Docker Compose (Option A):

- [ ] **2.1 Frontend (Web Interface)**
  - Open browser: `http://localhost` (or `http://localhost:80`)
  - Should see Travel Planner homepage

- [ ] **2.2 Backend API (Testing)**
  - Open browser: `http://localhost:5000/api/health`
  - Should see JSON: `{"status":"ok","apis":{...}}`

- [ ] **2.3 Check Which APIs are Enabled**
  - In the JSON response, each API key shows `true` or `false`
  - `true` = API key configured and working
  - `false` = API key missing

### With Virtual Environment (Option B):

- [ ] **2.1 Frontend**
  - Open browser: `http://localhost:5000` (if running Flask on 5000)
  - Or: `http://localhost:80` (if running http.server on 80)

- [ ] **2.2 Backend API**
  - Open browser: `http://localhost:5000/api/health`

---

## Phase 3: Test Your Application (1 min)

### Test Individual APIs

- [ ] **3.1 Weather API**
  - In browser console (F12):
  ```javascript
  fetch('http://localhost:5000/api/weather?city=NewYork').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: temp, feels, humidity, wind, condition

- [ ] **3.2 Currency API**
  - In browser console:
  ```javascript
  fetch('http://localhost:5000/api/currency?base=USD').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: rates for multiple currencies

- [ ] **3.3 Visa API**
  - In browser console:
  ```javascript
  fetch('http://localhost:5000/api/visa?from=US&to=JP').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: visa requirements

- [ ] **3.4 Flights API** (Fallback demo)
  - In browser console:
  ```javascript
  fetch('http://localhost:5000/api/flights?from=ORD&to=LAX&date=2024-03-15&passengers=1').then(r=>r.json()).then(d=>console.log(d))
  ```
  - Should show: array of flights

- [ ] **3.5 UI Testing**
  - Click weather search button → Should show live data
  - Try currency conversion
  - Try flight search
  - Try visa lookup

---

## Phase 4: Optional - Jenkins CI/CD Setup (5 min)

Set up automated builds and deployments with Jenkins.

### 4.1 Start Jenkins

```bash
# Start Jenkins in a separate terminal
docker-compose -f jenkins/docker-compose.jenkins.yml up -d

# Get initial admin password
docker logs jenkins | grep -A 5 "initialAdminPassword"
```

### 4.2 Access Jenkins

- Open browser: `http://localhost:8080`
- Enter the admin password from Step 4.1
- Follow setup wizard to install plugins

### 4.3 Configure Pipeline Job

1. In Jenkins: Click **"New Item"**
2. Name: `travel-planner-pipeline`
3. Type: **"Pipeline"**
4. Scroll to **"Pipeline"** section
5. Set **"Definition"** to: **"Pipeline script from SCM"**
6. Set **"SCM"** to: **"Git"**
7. Enter **"Repository URL"**: `YOUR_GITHUB_REPO_URL`
8. Set **"Script Path"** to: `Jenkinsfile`
9. Click **"Save"**

### 4.4 Setup GitHub Webhook (Optional)

For automatic builds on git push:

1. Go to GitHub repo → **Settings** → **Webhooks**
2. Add webhook with:
   - **Payload URL**: `http://YOUR_IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Just the push event

See `jenkins/webhook-setup.md` for detailed instructions.

### 4.5 Trigger Build

- **Manual**: Click **"Build Now"** in Jenkins UI
- **Automatic**: Push to main branch (if webhook configured)

---

## Common Commands

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in background mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild images (after code changes)
docker-compose build --no-cache

# Remove everything (containers, volumes, networks)
docker-compose down -v

# Execute command inside running container
docker exec -it travel-planner-backend-1 bash
docker exec -it travel-planner-frontend-1 sh
```

### Jenkins Commands

```bash
# Start Jenkins with Docker Compose
docker-compose -f jenkins/docker-compose.jenkins.yml up -d

# Stop Jenkins
docker-compose -f jenkins/docker-compose.jenkins.yml down

# View Jenkins logs
docker logs jenkins

# Install Docker CLI inside Jenkins (if needed)
docker exec jenkins bash jenkins/install-docker-in-jenkins.sh
```

### Manual Backend Commands (Virtual Environment)

```bash
# Create venv
python -m venv venv

# Activate venv
venv\Scripts\activate           # Windows
source venv/bin/activate        # macOS/Linux

# Install packages
pip install -r requirements.txt

# Run Flask backend
cd backend
flask --app app run --debug --host=0.0.0.0 --port=5000

# Run frontend server
python -m http.server 80 --directory frontend
```

---

## Troubleshooting

### Docker-Related Issues

#### Issue: "Cannot connect to backend" or "dependency backend failed to start"

**Solution:**
```bash
# Check if containers are running
docker ps

# View backend logs
docker-compose logs backend

# Restart containers
docker-compose down
docker-compose up --build
```

#### Issue: Port 80 already in use

**Solution:** Change port mapping in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change to 8080
```

Then access frontend at: `http://localhost:8080`

#### Issue: Port 5000 already in use

**Solution:** Change port mapping in `docker-compose.yml`:
```yaml
backend:
  ports:
    - "5001:5000"  # Change to 5001
```

#### Issue: "ModuleNotFoundError" in Docker

**Solution:** Rebuild without cache:
```bash
docker-compose build --no-cache
docker-compose up
```

### API-Related Issues

#### Issue: "Cannot GET /api/health"

**Solution:** Backend not running
```bash
# Check backend status
docker ps | grep backend

# View logs
docker-compose logs backend

# Restart
docker-compose restart backend
```

#### Issue: CORS errors in console

**Solution:** Backend CORS already configured for Docker
- If issue persists, check backend/app.py CORS settings
- Ensure Flask-CORS is installed: `docker-compose exec backend pip install flask-cors`

#### Issue: "API not configured" messages

**Solution:** Missing API keys
- Edit `.env` file and add at least 1-2 API keys
- Restart containers: `docker-compose restart backend`
- Check health: `http://localhost:5000/api/health`

### Jenkins-Related Issues

#### Issue: "Cannot connect to Docker" in Jenkins

**Solution:** Install Docker CLI and configure socket:
```bash
# Run setup script in Jenkins container
docker exec jenkins bash jenkins/install-docker-in-jenkins.sh

# Restart Jenkins
docker-compose -f jenkins/docker-compose.jenkins.yml restart
```

#### Issue: Webhook not triggering builds

**Solution:**
1. Check Jenkins is publicly accessible: `curl http://YOUR_IP:8080`
2. Verify webhook in GitHub: Settings → Webhooks → Recent Deliveries
3. For local development, use ngrok: `ngrok http 8080`
4. Update webhook URL with ngrok URL

---

## Success Indicators

✅ **With Docker Compose:**
- Frontend loads at `http://localhost`
- Backend responds at `http://localhost:5000`
- `docker ps` shows 2 running containers
- No CORS errors in browser console
- Weather/currency/visa queries return data

✅ **With Virtual Environment:**
- Frontend loads at `http://localhost:5000` or custom port
- Backend responds at `http://localhost:5000`
- No import errors in terminal
- Flask shows "Running on http://0.0.0.0:5000"
- No CORS errors in browser console

✅ **With Jenkins:**
- Jenkins accessible at `http://localhost:8080`
- Pipeline job "travel-planner-pipeline" created
- Recent builds shown in job history
- Console output shows all 8 stages completed
- Services running after successful build

---

## Improvement from Previous Setup

| Previous | Docker | Benefit |
|----------|--------|---------|
| Manual venv setup | One `docker-compose` command | No environment conflicts |
| Port 3001 backend | Port 5000 backend, Nginx proxy | Standard HTTP ports |
| Separate frontend server | Integrated Nginx | Single deployment |
| Manual deployments | Jenkins CI/CD | Automated builds |
| Local environment only | Dockerized environment | Production-ready |
| No health checks | Built-in healthchecks | Automatic recovery |

---

## Next Steps

1. **Get All API Keys** (for full functionality)
   - OpenWeatherMap: https://openweathermap.org/api
   - ExchangeRate-API: https://www.exchangerate-api.com
   - OpenAI: https://platform.openai.com/account/api-keys
   - Groq (optional): https://console.groq.com

2. **Set Up GitHub Webhook** (Jenkins CI/CD)
   - Follow `jenkins/webhook-setup.md` for details
   - Enables auto-builds on git push

3. **Explore Additional Features**
   - AI itinerary generation (with Anthropic/OpenAI keys)
   - Flight and hotel search (with RapidAPI keys)
   - Real-time visa requirements

4. **Deploy to Production**
   - Choose platform: AWS, Azure, DigitalOcean, Heroku
   - Use Docker images for consistency
   - Configure environment variables securely
   - Set up continuous deployment with Jenkins

---

## Important Files

| File | Purpose | Notes |
|------|---------|-------|
| `.env` | Environment variables & API keys | Never commit to git |
| `docker-compose.yml` | App services (backend, frontend) | Main orchestration file |
| `jenkins/docker-compose.jenkins.yml` | Jenkins CI/CD server | Separate from app |
| `Jenkinsfile` | Pipeline stages and steps | Located in project root |
| `backend/Dockerfile` | Backend container configuration | Python 3.11-slim |
| `frontend/Dockerfile` | Frontend container configuration | Nginx Alpine |
| `backend/requirements.txt` | Python dependencies | Updated with groq, openai |
| `jenkins/webhook-setup.md` | GitHub webhook instructions | Detailed setup guide |

---

## Need Help?

1. **Docker Issues**: Check `docker logs` command output
2. **Jenkins Issues**: Check Jenkins at `http://localhost:8080`
3. **API Issues**: Check health endpoint: `http://localhost:5000/api/health`
4. **Code Issues**: Check browser console (F12) for errors
5. **Git Issues**: Check Jenkins webhook configuration

---

**You're ready to go!** 🎉

- **Quick Start**: `docker-compose up --build` (1 command!)
- **With CI/CD**: Follow Jenkins phase for automated deployments
- **Support**: Check troubleshooting sections above

Have fun building! 🌍✈️

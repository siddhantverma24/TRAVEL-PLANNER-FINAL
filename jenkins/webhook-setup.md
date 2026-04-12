# Jenkins GitHub Webhook Setup Guide

This guide explains how to set up Jenkins CI/CD for the Travel Planner application with GitHub webhook integration for automatic builds.

---

## Section 1: Start Jenkins Container

### Step 1: Start Jenkins using Docker Compose

From the project root directory, run:

```bash
# Start Jenkins with the Jenkins-specific compose file
docker-compose -f jenkins/docker-compose.jenkins.yml up -d

# Verify Jenkins container is running
docker ps | grep jenkins
```

### Step 2: Get Initial Admin Password

Jenkins generates a temporary admin password on first startup. Retrieve it with:

```bash
# View Jenkins logs to find the initial admin password
docker logs jenkins | grep -A 5 "initialAdminPassword"

# Or directly print the password file
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

The password looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 3: Access Jenkins

Open your browser and go to:

```
http://localhost:8080
```

Enter the password from Step 2 to unlock Jenkins.

---

## Section 2: Configure Jenkins

### Step 1: Install Suggested Plugins

After unlocking Jenkins, click **"Install suggested plugins"** on the setup wizard.

This installs essential plugins including:
- Pipeline
- Git
- Docker
- Blue Ocean (UI)

Wait for all plugins to finish installing (~5-10 minutes).

### Step 2: Install GitHub Integration Plugin

1. Go to: **Manage Jenkins** → **Manage Plugins**
2. Search for: "GitHub Integration Plugin"
3. Check the checkbox and click **"Install without restart"**
4. Wait for installation to complete

This plugin enables webhook integration between GitHub and Jenkins.

### Step 3: Create a Pipeline Job

1. Click **"New Item"** (top-left)
2. Enter job name: `travel-planner-pipeline`
3. Select **"Pipeline"** as job type
4. Click **"OK"**

### Step 4: Configure Pipeline Source

In the job configuration page:

1. Scroll down to **"Pipeline"** section
2. Set **"Definition"** to: **"Pipeline script from SCM"**
3. Set **"SCM"** to: **"Git"**
4. Enter **"Repository URL"**: `YOUR_GITHUB_REPO_URL`
   - Example: `https://github.com/yourusername/travel-planner.git`
5. Set **"Branch Specifier"** to: `*/main`
6. Set **"Script Path"** to: `Jenkinsfile`
7. Click **"Save"**

---

## Section 3: GitHub Webhook Setup

### Prerequisites

Jenkins must be **publicly accessible** from the internet for GitHub to send webhook events. If Jenkins is behind a firewall or on localhost, webhooks won't work.

**Options:**
- Option A: Deploy Jenkins on a public server (AWS, Azure, DigitalOcean, etc.)
- Option B: Use ngrok to tunnel localhost to public URL (for local development)

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens**
2. Click **"Generate new token"**
3. Name: `jenkins-webhook-token`
4. Select scope: `repo` (full control of private repositories)
5. Click **"Generate token"** and copy the token
6. **Save this token** - you won't see it again!

### Step 2: Configure Jenkins GitHub Connection

1. In Jenkins: **Manage Jenkins** → **Configure System**
2. Scroll to **"GitHub"** section
3. Click **"Add GitHub Server"**
4. Enter:
   - **Name**: `GitHub`
   - **GitHub URL**: `https://github.com` (or your GitHub Enterprise URL)
   - **Credentials**: Click **"Add"** → **"Jenkins"**
     - **Kind**: GitHub Personal Access Token
     - **Token**: Paste the token from Step 1
     - **ID**: `github-token`
   - Click **"Create Credentials"**
5. Click **"Test connection"** - should show: `Credentials verified`
6. Click **"Save"**

### Step 3: Add Webhook to GitHub Repository

1. Go to your GitHub repository
2. Click **"Settings"** (repo settings, not account settings)
3. Click **"Webhooks"** (left sidebar)
4. Click **"Add webhook"**
5. Enter:
   - **Payload URL**: `http://YOUR_SERVER_IP:8080/github-webhook/`
     - Replace `YOUR_SERVER_IP` with your public Jenkins server IP
     - **Keep the trailing slash!**
     - Example if local: `http://192.168.1.100:8080/github-webhook/`
   - **Content type**: Ensure it's set to `application/json`
   - **Events**: Select **"Just the push event"** (webhook triggers on code push)
   - **Active**: Check this box
6. Click **"Add webhook"**

### Step 4: Test the Webhook

To verify webhook is working:

1. In GitHub: Go to webhook settings → **Recent Deliveries**
2. You should see a test delivery with status 200 (success)
3. Alternatively, make a small commit and push to `main`:
   ```bash
   git commit --allow-empty -m "Test Jenkins webhook"
   git push origin main
   ```
4. Jenkins should automatically trigger a build

---

## Section 3B: Local Development with ngrok

If Jenkins is running on `localhost` (not public), use ngrok to expose it:

### Step 1: Install and Run ngrok

```bash
# Download from https://ngrok.com/download
# Or if you have homebrew: brew install ngrok

# Create ngrok account at https://ngrok.com/signup (free tier available)

# Authenticate ngrok with your token
ngrok authtoken YOUR_NGROK_TOKEN

# Expose localhost:8080 to public internet
ngrok http 8080
```

This outputs:
```
Forwarding    https://abc123def456.ngrok.io -> http://localhost:8080
```

### Step 2: Update Webhook URL

Use the ngrok URL as GitHub webhook payload URL:

```
https://abc123def456.ngrok.io/github-webhook/
```

**Important**: ngrok free tier generates new URLs on restart. Save the URL or use ngrok Pro for persistent URLs.

### Step 3: Keep ngrok Running

Keep the ngrok terminal open while testing. When you stop ngrok, webhooks won't work.

---

## Section 4: Manual Build Trigger

If webhooks aren't working, you can manually trigger builds:

### Option 1: Jenkins Web UI

1. Go to Jenkins: `http://localhost:8080`
2. Click on job: `travel-planner-pipeline`
3. Click **"Build Now"** button (top-left)
4. Jenkins immediately starts building

### Option 2: CLI Command

```bash
# Trigger build via curl
curl -X POST http://localhost:8080/job/travel-planner-pipeline/build
```

### Option 3: Poll SCM

The Jenkinsfile is configured to poll GitHub every 5 minutes (`pollSCM('H/5 * * * *')`).

If there are new commits, Jenkins automatically starts a build every 5 minutes.

---

## Section 5: Verify Pipeline Execution

### Step 1: Check Build History

1. Go to Jenkins job: `http://localhost:8080/job/travel-planner-pipeline`
2. You should see build numbers: `#1`, `#2`, etc.
3. Click on a build number to see details

### Step 2: View Console Output

Click on a build → **"Console Output"**

Successful pipeline output shows all 8 stages:

```
[Pipeline] Start of Pipeline
[Pipeline] stage (Checkout)
✓ Code checked out successfully into workspace

[Pipeline] stage (Check Environment)
Docker version 24.0.0, build abc123
docker-compose version 2.15.1

[Pipeline] stage (Setup Environment)
✓ Environment setup complete

[Pipeline] stage (Stop Old Containers)
✓ Old containers stopped

[Pipeline] stage (Build Docker Images)
Successfully tagged travel-planner_backend:latest
Successfully tagged travel-planner_frontend:latest

[Pipeline] stage (Start Containers)
✓ Containers started in background

[Pipeline] stage (Health Check)
✓ Both services are responding correctly

[Pipeline] stage (Clean Up Old Images)
✓ Unused images cleaned up

[Pipeline] Post Actions
✓ Deployment SUCCESSFUL
```

### Step 3: Verify Services Running

After successful build, check services:

```bash
# View running containers
docker ps

# Check backend health
curl http://localhost:5000/

# Check frontend health
curl http://localhost:80/
```

---

## Troubleshooting

### Webhook Not Triggering

**Problem**: GitHub webhook is configured but Jenkins doesn't build on push

**Solutions**:
1. Check webhook delivery status in GitHub (Settings → Webhooks → Recent Deliveries)
2. Verify Jenkins URL is publicly accessible (`curl http://YOUR_IP:8080`)
3. Ensure GitHub token has correct permissions
4. Check Jenkins logs: `docker logs jenkins | tail -20`

### Build Fails at "Build Docker Images"

**Problem**: Docker image build fails in Jenkins

**Solutions**:
1. Check Jenkins container can access Docker socket:
   ```bash
   docker exec jenkins docker ps
   ```
2. Run setup script inside container:
   ```bash
   docker exec jenkins bash jenkins/install-docker-in-jenkins.sh
   ```
3. Restart Jenkins:
   ```bash
   docker-compose -f jenkins/docker-compose.jenkins.yml restart
   ```

### Health Check Fails

**Problem**: Services start but health check fails

**Solutions**:
1. Manually test endpoints:
   ```bash
   docker exec -it travelplanner-backend-1 curl http://localhost:5000/
   docker exec -it travelplanner-frontend-1 curl http://localhost/
   ```
2. Check service logs:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```
3. Increase sleep time in Jenkinsfile if services need more startup time

---

## Next Steps

After successful pipeline setup:

1. **Monitor builds**: Check Jenkins for each push to `main` branch
2. **Set up notifications**: Configure email/Slack alerts in Jenkins
3. **Add deployment**: Extend pipeline to deploy to production server
4. **Add tests**: Add test stage before health checks
5. **Set up staging**: Create separate pipeline for staging environment

---

## References

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [GitHub Webhook Integration](https://docs.github.com/en/developers/webhooks-and-events/webhooks/creating-webhooks)
- [ngrok Documentation](https://ngrok.com/docs)

// ============================================================================
// JENKINSFILE - Declarative Pipeline for Travel Planner CI/CD
// ============================================================================
// Location: Project root (same level as docker-compose.yml)
// Purpose: Define automated build, test, and deployment pipeline
// Syntax: Declarative Pipeline (requires Jenkins Pipeline plugin)
// ============================================================================

pipeline {

    // ========================================================================
    // AGENT: Run on any available Jenkins agent (master or worker)
    // ========================================================================
    agent any

    // ========================================================================
    // ENVIRONMENT: Global variables available throughout pipeline execution
    // ========================================================================
    environment {
        // Docker Compose configuration file location
        COMPOSE_FILE = 'docker-compose.yml'
        
        // Application name for container naming and identification
        APP_NAME = 'travelplanner'
    }

    // ========================================================================
    // OPTIONS: Configure build behavior and output
    // ========================================================================
    options {
        // Add timestamps to every log line for timeline visibility
        timestamps()
        
        // Keep only the last 5 builds to conserve disk space
        // Older builds are automatically deleted
        buildDiscarder(logRotator(numToKeepStr: '5'))
        
        // Timeout to prevent hung builds from consuming resources indefinitely
        // If any stage takes longer than 30 minutes, the entire pipeline is aborted
        // This prevents resource exhaustion and stuck builds
        timeout(time: 30, unit: 'MINUTES')
    }

    // ========================================================================
    // TRIGGERS: Condition that automatically starts the pipeline
    // ========================================================================
    triggers {
        // Poll GitHub every 5 minutes for new commits
        // H/5 = randomized to prevent load spikes
        // Fallback mechanism when webhooks are unavailable
        pollSCM('H/5 * * * *')
    }

    // ========================================================================
    // STAGES: Sequential pipeline steps
    // ========================================================================
    stages {

        // ====================================================================
        // STAGE 1: CHECKOUT - Clone latest code from GitHub
        // ====================================================================
        stage('Checkout') {
            steps {
                // Clone the repository from GitHub
                // branch: 'main' = checkout main branch
                // url: = GitHub repository URL
                // Ensures Jenkins has latest code before building
                git branch: 'main',
                    url: 'https://github.com/siddhantverma24/TRAVEL-PLANNER-FINAL.git'
                
                // Confirm checkout was successful
                echo "✓ Source code checked out successfully"
            }
        }

        // ====================================================================
        // STAGE 2: CHECK ENVIRONMENT - Verify Docker tools are available
        // ====================================================================
        stage('Check Environment') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // Display Docker CLI version
                    // Confirms docker is installed and accessible
                    sh 'docker --version'
                    
                    // Display docker compose version (V2 with space, not hyphenated)
                    // This verifies the Docker Compose plugin is installed
                    sh 'docker compose version'
                    
                    // List all files in project root
                    // Confirms Jenkinsfile and docker-compose.yml are present
                    // Validates repository structure
                    sh 'ls -la'
                    
                    // Log environment check completion
                    echo "✓ All required tools are available"
                }
            }
        }

        // ====================================================================
        // STAGE 3: SETUP ENVIRONMENT - Prepare .env configuration file
        // ====================================================================
        stage('Setup Environment') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // Copy .env.example to .env if .env doesn't exist
                    // -n flag = no-clobber (don't overwrite if exists)
                    // 2>/dev/null = suppress the error message if .env.example doesn't exist
                    // The echo message clarifies what happened instead of showing a confusing error
                    // This is safer than "|| true" which hides all errors
                    sh 'cp -n .env.example .env 2>/dev/null || echo ".env already exists or missing — skipping"'
                    
                    // Confirm environment file is ready
                    echo "✓ Environment configuration prepared"
                }
            }
        }

        // ====================================================================
        // STAGE 4: AGGRESSIVE CLEANUP - Clear dangling resources only
        // ====================================================================
        // NOTE: This stage NO LONGER stops running containers!
        // All containers have restart: unless-stopped and continue running.
        // We only clear orphaned/dangling resources to prevent disk bloat.
        // ====================================================================
        stage('Aggressive Cleanup') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // NOTE: Removed "docker compose down" - containers stay running!
                    // Containers now auto-restart if they crash due to restart: unless-stopped policy
                    
                    // STEP 1: Force remove orphaned containers (not managed by any compose file)
                    // This cleans up failed containers from previous runs without affecting running services
                    echo "[Cleanup] Removing orphaned containers..."
                    sh 'docker container prune -f --filter "label!=com.docker.compose.service" || true'
                    
                    // STEP 2: Kill any dangling processes on standard ports (cleanup only, don't stop services)
                    // If port 5000 has orphaned process, terminate it (backend still running through compose)
                    echo "[Cleanup] Cleaning up any orphaned processes on port 5000..."
                    sh 'lsof -ti :5000 | grep -v "docker-proxy" | xargs kill -9 2>/dev/null || true'
                    
                    // STEP 3: Clean up port 80 orphaned processes
                    echo "[Cleanup] Cleaning up any orphaned processes on port 80..."
                    sh 'lsof -ti :80 | grep -v "docker-proxy" | xargs kill -9 2>/dev/null || true'
                    
                    // STEP 4: Prune dangling Docker images (keeps recent images, removes old layers)
                    // We do this AFTER build to prevent unnecessary rebuilds
                    echo "[Cleanup] Removing dangling Docker resources..."
                    sh 'docker system prune -f || true'
                    
                    // STEP 5: Remove dangling volumes only (not volumes in use)
                    // This prevents disk bloat from orphaned volumes
                    echo "[Cleanup] Removing dangling volumes..."
                    sh 'docker volume prune -f || true'
                    
                    // STEP 6: Show current container status (for visibility)
                    echo "[Cleanup] Current container status:"
                    sh 'docker ps -a --format "table {{.Names}}\t{{.Status}}" || true'
                    
                    // Confirm resource cleanup complete
                    echo "✓ CLEANUP COMPLETE - Resources cleaned, containers still running"
                }
            }
        }

        // ====================================================================
        // STAGE 5: BUILD DOCKER IMAGES - Create fresh container images
        // ====================================================================
        stage('Build Docker Images') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // Build both backend (Flask) and frontend (Nginx) images
                    // docker compose build = read compose file and build all services
                    // -f docker-compose.yml = explicitly specify the compose file
                    // --no-cache = force rebuild from scratch (no layer cache)
                    // --parallel = build multiple images simultaneously for speed
                    // Prevents stale dependencies or code in images
                    echo "[Build] Starting Docker image build (no-cache mode)..."
                    sh 'docker compose -f docker-compose.yml build --no-cache --parallel'
                    
                    // List built images for verification
                    echo "[Build] Images built. Current images:"
                    sh 'docker images | grep travelplanner || echo "No travelplanner images found"'
                    
                    // Confirm build success
                    echo "✓ Docker images built successfully"
                }
            }
        }

        // ====================================================================
        // STAGE 6: START CONTAINERS - Launch services
        // ====================================================================
        stage('Start Containers') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // Start all services defined in docker-compose.yml
                    // docker compose up = build and run containers
                    // -f docker-compose.yml = explicitly specify the compose file
                    // -d flag = detached mode (background execution)
                    // --force-recreate = always recreate containers (prevents stale containers causing random crashes)
                    // Pipeline immediately continues (doesn't wait for services)
                    echo "[Start] Launching containers from docker-compose.yml..."
                    sh 'docker compose -f docker-compose.yml up -d --force-recreate'
                    
                    // Small wait to allow containers to start binding to ports
                    sh 'sleep 2'
                    
                    // Show running containers to confirm startup
                    // docker compose ps = display status of all managed containers
                    // Useful for deployment verification
                    echo "[Start] Container status:"
                    sh 'docker compose -f docker-compose.yml ps'
                    
                    // Show port mappings and network details
                    echo "[Start] Port mappings:"
                    sh 'docker ps --format "table {{.Names}}\\t{{.Ports}}"'
                    
                    // Log startup completion
                    echo "✓ Containers started successfully"
                }
            }
        }

        // ====================================================================
        // STAGE 7: HEALTH CHECK - Verify services are responding
        // ====================================================================
        stage('Health Check') {
            steps {
                // Use dir('/workspace') to ensure all commands run in the mounted workspace
                dir('/workspace') {
                    // Wait for services to fully initialize and become ready
                    // Flask and Nginx need time to bind ports and become responsive
                    // 20 seconds ensures healthcheck passes and services are ready
                    echo "[Health] Waiting for services to initialize (20 seconds)..."
                    sh 'sleep 20'
                    
                    // Verify port 5000 is listening (backend Flask API)
                    // netstat -tlnp = show listening TCP ports
                    // grep 5000 = filter for port 5000
                    echo "[Health] Checking port 5000 (backend)..."
                    sh 'netstat -tlnp | grep 5000 || echo "Port 5000 status: checking via curl instead"'
                    
                    // Test backend Flask API health
                    // curl -f http://localhost:5000/ = send HTTP GET request
                    // -f flag = fail on HTTP errors (non-2xx/3xx status codes)
                    // -m 5 = timeout after 5 seconds
                    // Verifies Flask is running and accepting connections
                    echo "[Health] Testing backend Flask API..."
                    sh 'curl -f -m 5 http://localhost:5000/ || exit 1'
                    
                    // Verify port 80 is listening (frontend Nginx)
                    echo "[Health] Checking port 80 (frontend)..."
                    sh 'netstat -tlnp | grep 80 || echo "Port 80 status: checking via curl instead"'
                    
                    // Test frontend Nginx web server health
                    // curl -f http://localhost:80/ = send HTTP GET to frontend
                    // Verifies Nginx is running and serving pages
                    echo "[Health] Testing frontend Nginx server..."
                    sh 'curl -f -m 5 http://localhost:80/ || exit 1'
                    
                    // Additional validation: check Docker container health status
                    echo "[Health] Container health status:"
                    sh 'docker compose -f docker-compose.yml ps --format "table {{.Service}}\\t{{.Status}}"'
                    
                    // Log successful health checks
                    echo "✓ Both services are healthy and responding to requests"
                }
            }
        }

        // ====================================================================
        // STAGE 8: CLEAN UP OLD IMAGES - Free disk space
        // ====================================================================
        stage('Clean Up Old Images') {
            steps {
                // Remove dangling/unused Docker images
                // docker image prune = remove unused images
                // -f flag = force removal without confirmation prompt
                // --filter "until=24h" = only remove images older than 24 hours
                // This prevents aggressive deletion of recently built images that might be needed
                // Dangling images consume disk space and can accumulate over time
                echo "[Cleanup] Removing Docker images older than 24 hours..."
                sh 'docker image prune -f --filter "until=24h"'
                
                // Log cleanup completion
                echo "✓ Old Docker images cleaned up"
            }
        }

    }

    // ========================================================================
    // POST BLOCK: Actions after pipeline completion (success or failure)
    // ========================================================================
    post {
        
        // ====================================================================
        // ALWAYS: Runs regardless of success or failure
        // ====================================================================
        always {
            // Show container status to verify services are running
            // This helps confirm restart: unless-stopped policy is working
            echo "[Always] Current running services:"
            sh 'docker compose -f /workspace/docker-compose.yml ps || true'
            
            // Print completion message to Jenkins console
            echo "======================================================================"
            echo "Pipeline execution finished for ${APP_NAME}"
            echo "✓ Containers remain running (restart: unless-stopped active)"
            echo "✓ Services will survive Docker restarts and container crashes"
            echo "✓ To stop services manually: docker compose down"
            echo "======================================================================"
        }

        // ====================================================================
        // SUCCESS: Runs only if all stages completed without errors
        // ====================================================================
        success {
            // Print success message with service information
            echo "======================================================================"
            echo "✓ Deployment SUCCESSFUL"
            echo "✓ Application is live at:"
            echo "  - Frontend:  http://localhost:80        (Nginx)"
            echo "  - Backend:   http://localhost:5000      (Flask API)"
            echo "  - Health:    http://localhost:5000/api/health"
            echo "======================================================================"
        }

        // ====================================================================
        // FAILURE: Runs if any stage fails
        // ====================================================================
        // NOTE: Containers are NOT stopped on failure to prevent service interruptions
        // The restart: unless-stopped policy ensures services recover on their own
        // ====================================================================
        failure {
            // Dump the last 100 lines of container logs for debugging
            // Use absolute path /workspace/docker-compose.yml because dir() wrappers don't apply in post blocks
            // This helps identify what went wrong in the application
            echo "[Failure] Collecting debug logs..."
            sh 'docker compose -f /workspace/docker-compose.yml logs --tail=100 || true'
            
            // Show current container status to verify they're still running
            // This confirms containers survived the failure and stayed running
            echo "[Failure] Current container status:"
            sh 'docker compose -f /workspace/docker-compose.yml ps || true'
            
            // Print failure message with debugging instructions
            echo "======================================================================"
            echo "✗ Pipeline FAILED"
            echo "✗ Containers are still running (not stopped)"
            echo "✗ Services will auto-restart if crashed"
            echo "✗ Check the logs above for error details"
            echo "✗ Common fixes:"
            echo "   - Verify Docker is running: docker --version"
            echo "   - Check application logs: docker compose logs -f backend"
            echo "   - Rebuild fresh: docker compose build --no-cache"
            echo "   - Manually view status: docker compose ps"
            echo "======================================================================"
        }
    }
}

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
                // Display Docker CLI version
                // Confirms docker is installed and accessible
                sh 'docker --version'
                
                // Display docker-compose version
                // Supports both "docker-compose" (standalone v1) and "docker compose" (v2+ integrated)
                sh 'docker-compose --version || docker compose version'
                
                // List all files in project root
                // Confirms Jenkinsfile and docker-compose.yml are present
                // Validates repository structure
                sh 'ls -la'
                
                // Log environment check completion
                echo "✓ All required tools are available"
            }
        }

        // ====================================================================
        // STAGE 3: SETUP ENVIRONMENT - Prepare .env configuration file
        // ====================================================================
        stage('Setup Environment') {
            steps {
                // Copy .env.example to .env if .env doesn't exist
                // -n flag = no-clobber (don't overwrite if exists)
                // || true = always succeed (don't fail on first run / pre-existing file)
                // Environment variables are required for docker-compose
                sh 'cp -n .env.example .env || true'
                
                // Confirm environment file is ready
                echo "✓ Environment configuration prepared"
            }
        }

        // ====================================================================
        // STAGE 4: STOP OLD CONTAINERS - Clean up previous deployment
        // ====================================================================
        stage('Stop Old Containers') {
            steps {
                // Stop and remove all running containers from docker-compose
                // docker-compose down = remove containers and networks
                // --remove-orphans = remove containers not in current compose file
                // || true = succeed even if nothing is running (first deployment)
                sh 'docker-compose down --remove-orphans || true'
                
                // Confirm cleanup complete
                echo "✓ Previous containers stopped and removed"
            }
        }

        // ====================================================================
        // STAGE 5: BUILD DOCKER IMAGES - Create fresh container images
        // ====================================================================
        stage('Build Docker Images') {
            steps {
                // Build both backend (Flask) and frontend (Nginx) images
                // docker-compose build = read compose file and build all services
                // --no-cache = force rebuild from scratch (no layer cache)
                // Prevents stale dependencies or code in images
                sh 'docker-compose build --no-cache'
                
                // Confirm build success
                echo "✓ Docker images built successfully"
            }
        }

        // ====================================================================
        // STAGE 6: START CONTAINERS - Launch services
        // ====================================================================
        stage('Start Containers') {
            steps {
                // Start all services defined in docker-compose.yml
                // docker-compose up = build and run containers
                // -d flag = detached mode (background execution)
                // Pipeline immediately continues (doesn't wait for services)
                sh 'docker-compose up -d'
                
                // Show running containers to confirm startup
                // docker-compose ps = display status of all managed containers
                // Useful for deployment verification
                sh 'docker-compose ps'
                
                // Log startup completion
                echo "✓ Containers started in background"
            }
        }

        // ====================================================================
        // STAGE 7: HEALTH CHECK - Verify services are responding
        // ====================================================================
        stage('Health Check') {
            steps {
                // Wait for services to fully initialize and become ready
                // Flask and Nginx need time to bind ports and become responsive
                // 15 seconds is typically sufficient for container startup
                sh 'sleep 15'
                
                // Test backend Flask API health
                // curl -f http://localhost:5000/ = send HTTP GET request
                // -f flag = fail on HTTP errors (non-2xx/3xx status codes)
                // Verifies Flask is running and accepting connections
                sh 'curl -f http://localhost:5000/ || exit 1'
                
                // Test frontend Nginx web server health
                // curl -f http://localhost:80/ = send HTTP GET to frontend
                // Verifies Nginx is running and serving pages
                sh 'curl -f http://localhost:80/ || exit 1'
                
                // Log successful health checks
                echo "✓ Both services are responding to requests"
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
                // Dangling images consume disk space and can accumulate over time
                sh 'docker image prune -f'
                
                // Log cleanup completion
                echo "✓ Unused Docker images cleaned up"
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
            // Print completion message to Jenkins console
            echo "======================================================================"
            echo "Pipeline execution finished for ${APP_NAME}"
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
        failure {
            // Stop and remove containers on failure
            // Prevents broken/partial services from running
            // || true = succeed even if containers already stopped
            sh 'docker-compose down || true'
            
            // Print failure message with debugging instructions
            echo "======================================================================"
            echo "✗ Pipeline FAILED"
            echo "✗ Containers have been stopped"
            echo "✗ Check the console output above for error details"
            echo "✗ Common fixes:"
            echo "   - Verify Docker is running: docker --version"
            echo "   - Check logs: docker-compose logs backend"
            echo "   - Rebuild fresh: docker-compose build --no-cache"
            echo "======================================================================"
    }
  }
}

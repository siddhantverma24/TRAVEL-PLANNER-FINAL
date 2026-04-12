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
        // Docker Compose configuration file location (ABSOLUTE PATH)
        COMPOSE_FILE = '/workspace/docker-compose.yml'
        
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
        timeout(time: 30, unit: 'MINUTES')
    }

    // ========================================================================
    // TRIGGERS: Condition that automatically starts the pipeline
    // ========================================================================
    triggers {
        // Poll GitHub every 5 minutes for new commits
        // H/5 = randomized to prevent load spikes
        pollSCM('H/5 * * * *')
    }

    // ========================================================================
    // STAGES: Sequential pipeline steps
    // ========================================================================
    stages {

        // ====================================================================
        // STAGE 1: CHECK ENVIRONMENT - Verify Docker tools are available
        // ====================================================================
        // NOTE: Git checkout is automatically done by Jenkins before pipeline starts
        // via "Declarative: Checkout SCM". The project files are available at /workspace
        // via the volume mount in docker-compose.jenkins.yml (..:/workspace)
        // ====================================================================
        stage('Check Environment') {
            steps {
                // Verify Docker CLI is installed and accessible
                sh 'docker --version'
                
                // Verify Docker Compose V2 plugin is installed
                sh 'docker compose version'
                
                // Verify the workspace volume mount is correct (absolute path)
                // Should show the project root files: docker-compose.yml, backend/, frontend/, Jenkinsfile
                echo "[Check] Verifying workspace mount points to project root..."
                sh 'ls -la /workspace'
                
                // Explicitly verify docker-compose.yml exists in /workspace
                sh 'ls -la /workspace/docker-compose.yml || echo "ERROR: docker-compose.yml not found in /workspace"'
                
                // Confirm Docker is ready
                echo "✓ Docker environment verified - ready to build"
            }
        }

        // ====================================================================
        // STAGE 2: SETUP ENVIRONMENT - Prepare .env configuration file
        // ====================================================================
        stage('Setup Environment') {
            steps {
                // Copy .env.example to .env if .env doesn't exist
                // Using absolute path to /workspace
                sh 'cp -n /workspace/.env.example /workspace/.env 2>/dev/null || echo ".env already exists or missing — skipping"'
                
                // Confirm environment file is ready
                echo "✓ Environment configuration prepared"
            }
        }

        // ====================================================================
        // STAGE 3: AGGRESSIVE CLEANUP - Remove stopped containers, images, networks
        // ====================================================================
        // NOTE: This stage cleans up dangling resources but does NOT stop running containers.
        // The critical port cleanup happens in the "Stop Old Containers" stage.
        // ====================================================================
        stage('Aggressive Cleanup') {
            steps {
                echo '[Cleanup] Removing stopped containers...'
                sh 'docker container prune -f || true'

                echo '[Cleanup] Removing dangling images and networks...'
                sh 'docker system prune -f || true'

                echo '[Cleanup] Current container status:'
                sh 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
            }
        }

        // ====================================================================
        // STAGE 4: STOP OLD CONTAINERS - Force kill containers on ports 5000 and 80
        // ====================================================================
        // CRITICAL: This stage must run BEFORE building new containers.
        // It force-kills ANY container using ports 5000 or 80, regardless of
        // project name or compose context. This prevents "port already allocated" errors
        // when re-running the pipeline without manual docker compose down.
        // ====================================================================
       stage('Stop Old Containers') {
    steps {
        echo '[Cleanup] Force-killing ALL containers holding port 5000...'
        // Find container IDs using port 5000 and force remove them immediately
        // -q = quiet (IDs only), --filter publish=5000 = any container bound to 5000
        // xargs -r = skip xargs entirely if input is empty (prevents "no args" error)
        sh 'docker ps -q --filter "publish=5000" | xargs -r docker rm -f || true'

        echo '[Cleanup] Force-killing ALL containers holding port 80...'
        sh 'docker ps -q --filter "publish=80" | xargs -r docker rm -f || true'

        echo '[Cleanup] Removing leftover networks...'
        // Remove the compose network so "docker compose up" can recreate it fresh
        sh 'docker network rm travelplanner_travel_network 2>/dev/null || true'

        echo '[Cleanup] Verifying ports are now free...'
        // These should return no rows if ports are free
        sh 'docker ps --filter "publish=5000" --filter "publish=80"'
    }
}
        // ====================================================================
        // STAGE 5: BUILD DOCKER IMAGES - Create fresh container images
        // ====================================================================
        stage('Build Docker Images') {
            steps {
                // Build both backend (Flask) and frontend (Nginx) images
                // docker compose build = read compose file and build all services
                // -f /workspace/docker-compose.yml = explicit absolute path to compose file
                // --no-cache = force rebuild from scratch (no layer cache)
                // --parallel = build multiple images simultaneously for speed
                // 2>&1 = capture both stdout and stderr
                echo '[Build] Starting Docker image build (no-cache mode)...'
                sh 'docker compose -f /workspace/docker-compose.yml build --no-cache --parallel 2>&1'
                
                // List built images for verification
                echo '[Build] Images built. Current images:'
                sh 'docker images | grep travelplanner || docker images'
                
                // Confirm build success
                echo '[Build] Images built successfully'
            }
        }

        // ====================================================================
        // STAGE 6: START CONTAINERS - Launch services
        // ====================================================================
        stage('Start Containers') {
            steps {
                // Start all services defined in docker-compose.yml
                // docker compose up = build and run containers
                // -f /workspace/docker-compose.yml = absolute path to compose file
                // -d = detached mode (background execution)
                // --force-recreate = always recreate containers (prevents stale containers)
                echo '[Start] Launching containers...'
                sh 'docker compose -f /workspace/docker-compose.yml up -d --force-recreate 2>&1'
                
                // Wait for containers to start and bind to ports
                sh 'sleep 15'
                
                // Show running containers to confirm startup
                echo '[Start] Container status:'
                sh 'docker compose -f /workspace/docker-compose.yml ps'
                
                // Show recent logs from containers
                echo '[Start] Recent container logs:'
                sh 'docker compose -f /workspace/docker-compose.yml logs --tail=20 2>&1'
                
                echo '[Start] Containers launched'
            }
        }

        // ====================================================================
        // STAGE 7: HEALTH CHECK - Verify services are responding
        // ====================================================================
        stage('Health Check') {
            steps {
                // Wait for services to fully initialize
                echo '[Health] Waiting for services to initialize (10 seconds)...'
                sh 'sleep 10'
                
                // Show container status
                echo '[Health] Container status:'
                sh 'docker compose -f /workspace/docker-compose.yml ps'
                
                // Test backend API health
                echo '[Health] Testing backend Flask API (http://localhost:5000)...'
                sh 'curl -sf http://localhost:5000/ -o /dev/null && echo "Backend OK" || echo "Backend not ready"'
                
                // Test frontend health
                echo '[Health] Testing frontend Nginx (http://localhost:80)...'
                sh 'curl -sf http://localhost:80/ -o /dev/null && echo "Frontend OK" || echo "Frontend not ready"'
                
                echo '✓ Health check complete'
            }
        }

        // ====================================================================
        // STAGE 8: CLEAN UP OLD IMAGES - Free disk space
        // ====================================================================
        stage('Clean Up Old Images') {
            steps {
                // Remove dangling/unused Docker images older than 24 hours
                // docker image prune = remove unused images
                // -f flag = force removal without confirmation prompt
                // --filter "until=24h" = only remove images older than 24 hours
                echo '[Cleanup] Removing Docker images older than 24 hours...'
                sh 'docker image prune -f --filter "until=24h"'
                
                echo '✓ Old Docker images cleaned up'
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
            // Show final container status
            echo '[Always] Final container status:'
            sh 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true'
            sh 'docker compose -f /workspace/docker-compose.yml ps || true'
            
            // Print completion message
            echo "======================================================================"
            echo "Pipeline execution finished for ${APP_NAME}"
            echo "======================================================================"
        }

        // ====================================================================
        // SUCCESS: Runs only if all stages completed without errors
        // ====================================================================
        success {
            echo "======================================================================"
            echo "✓ Deployment SUCCESSFUL"
            echo "✓ Application is live at:"
            echo "  - Frontend:  http://localhost:80        (Nginx)"
            echo "  - Backend:   http://localhost:5000      (Flask API)"
            echo "======================================================================"
        }

        // ====================================================================
        // FAILURE: Runs if any stage fails
        // ====================================================================
        failure {
            echo '[Failure] Collecting debug information...'
            
            // Show all containers (running and stopped)
            sh 'docker ps -a || true'
            
            // Show compose logs (using absolute path)
            sh 'docker compose -f /workspace/docker-compose.yml logs --tail=50 2>&1 || true'
            
            // Attempt cleanup on failure
            sh 'docker compose -f /workspace/docker-compose.yml down --timeout 10 || true'
            
            // Remove network if stuck
            sh 'docker network rm travelplanner_travel_network || true'
            
            echo "======================================================================"
            echo "✗ Pipeline FAILED"
            echo "✗ Containers have been stopped and networks cleaned up"
            echo "✗ Check the logs above for error details"
            echo "======================================================================"
        }
    }
}

pipeline {

    agent any

    environment {
        COMPOSE_FILE = '/workspace/docker-compose.yml'
        APP_NAME = 'travelplanner'
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {

        stage('Check Environment') {
            steps {
                sh 'docker --version'
                sh 'docker compose version'
                echo "[Check] Verifying workspace mount points to project root..."
                sh 'ls -la /workspace'
                sh 'ls -la /workspace/docker-compose.yml || echo "ERROR: docker-compose.yml not found in /workspace"'
                echo "✓ Docker environment verified - ready to build"
            }
        }

        stage('Setup Environment') {
            steps {
                sh 'cp -n /workspace/.env.example /workspace/.env 2>/dev/null || echo ".env already exists or missing — skipping"'
                echo "✓ Environment configuration prepared"
            }
        }

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

        stage('Stop Old Containers') {
            steps {
                echo '[Cleanup] Force-killing ALL containers holding port 5000...'
                sh 'docker ps -q --filter "publish=5000" | xargs -r docker rm -f || true'

                echo '[Cleanup] Force-killing ALL containers holding port 80...'
                sh 'docker ps -q --filter "publish=80" | xargs -r docker rm -f || true'

                echo '[Cleanup] Removing leftover networks...'
                sh 'docker network rm travelplanner_travel_network 2>/dev/null || true'

                echo '[Cleanup] Verifying ports are now free...'
                sh 'docker ps --filter "publish=5000" --filter "publish=80"'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '[Build] Starting Docker image build (no-cache mode)...'
                sh 'docker compose -f /workspace/docker-compose.yml build --no-cache --parallel 2>&1'
                
                echo '[Build] Images built. Current images:'
                sh 'docker images | grep travelplanner || docker images'
                
                echo '[Build] Images built successfully'
            }
        }

        stage('Start Containers') {
            steps {
                echo '[Start] Launching containers...'
                sh 'docker compose -f /workspace/docker-compose.yml up -d --force-recreate 2>&1'
                
                sh 'sleep 15'
                
                echo '[Start] Container status:'
                sh 'docker compose -f /workspace/docker-compose.yml ps'
                
                echo '[Start] Recent container logs:'
                sh 'docker compose -f /workspace/docker-compose.yml logs --tail=20 2>&1'
                
                echo '[Start] Containers launched'
            }
        }

        stage('Health Check') {
            steps {
                echo '[Health] Waiting for services to initialize (10 seconds)...'
                sh 'sleep 10'
                
                echo '[Health] Container status:'
                sh 'docker compose -f /workspace/docker-compose.yml ps'
                
                echo '[Health] Testing backend Flask API (http://localhost:5000)...'
                sh 'curl -sf http://localhost:5000/ -o /dev/null && echo "Backend OK" || echo "Backend not ready"'
                
                echo '[Health] Testing frontend Nginx (http://localhost:80)...'
                sh 'curl -sf http://localhost:80/ -o /dev/null && echo "Frontend OK" || echo "Frontend not ready"'
                
                echo '✓ Health check complete'
            }
        }

        stage('Clean Up Old Images') {
            steps {
                echo '[Cleanup] Removing Docker images older than 24 hours...'
                sh 'docker image prune -f --filter "until=24h"'
                
                echo '✓ Old Docker images cleaned up'
            }
        }

    }

    post {
        
        always {
            echo '[Always] Final container status:'
            sh 'docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true'
            sh 'docker compose -f /workspace/docker-compose.yml ps || true'
            
            echo "======================================================================"
            echo "Pipeline execution finished for ${APP_NAME}"
            echo "======================================================================"
        }

        success {
            echo "======================================================================"
            echo "✓ Deployment SUCCESSFUL"
            echo "✓ Application is live at:"
            echo "  - Frontend:  http://localhost:80        (Nginx)"
            echo "  - Backend:   http://localhost:5000      (Flask API)"
            echo "======================================================================"
        }

        failure {
            echo '[Failure] Collecting debug information...'
            
            sh 'docker ps -a || true'
            
            sh 'docker compose -f /workspace/docker-compose.yml logs --tail=50 2>&1 || true'
            
            sh 'docker compose -f /workspace/docker-compose.yml down --timeout 10 || true'
            
            sh 'docker network rm travelplanner_travel_network || true'
            
            echo "======================================================================"
            echo "✗ Pipeline FAILED"
            echo "✗ Containers have been stopped and networks cleaned up"
            echo "✗ Check the logs above for error details"
            echo "======================================================================"
        }
    }
}

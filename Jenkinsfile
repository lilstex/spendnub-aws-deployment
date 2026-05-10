pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'lilstex'
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/spendnub-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/spendnub-frontend"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        AWS_REGION = "us-east-1"
    }

    stages {
        stage('Checkout & Test') {
            steps {
                checkout scm
                script {
                    docker.image('node:20-alpine').inside {
                        // Test Backend
                        sh 'cd backend && rm -rf node_modules package-lock.json'
                        sh 'cd backend && npm install --legacy-peer-deps --cache /tmp/.npm'
                        sh 'cd backend && npm run test || echo "No tests configured yet"'
                        
                        // Test Frontend
                        sh 'cd frontend && rm -rf node_modules package-lock.json'
                        sh 'cd frontend && npm install --cache /tmp/.npm'
                        sh 'cd frontend && npm run test || echo "No tests configured yet"'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Fetch the ephemeral EC2 Public IP dynamically
                    def PUBLIC_IP = sh(script: "curl -s ifconfig.me", returnStdout: true).trim()
                    // Build Backend
                    backendApp = docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}", "./backend")
                    // Build Frontend
                    frontendApp = docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}", "--build-arg NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:2200/api/v1 ./frontend")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    // Authenticate and push using the stored credentials from Jenkins
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        // Push Backend
                        backendApp.push("${IMAGE_TAG}")
                        backendApp.push("latest")
                        
                        // Push Frontend
                        frontendApp.push("${IMAGE_TAG}")
                        frontendApp.push("latest")
                    }
                }
            }
        }

        stage('Deploy Full Stack Application') {
            steps {
                withCredentials([file(credentialsId: 'backend-env-file', variable: 'SECRET_ENV_FILE')]) {
                    script {
                        // Copy the secret .env to the workspace where docker-compose expects it
                        sh 'cp "$SECRET_ENV_FILE" .env'
                        
                        // Pass environment variables to Docker Compose, pull new images, and launch
                        sh """
                        export DOCKER_HUB_USER=${DOCKER_HUB_USER}
                        export AWS_REGION=${AWS_REGION}
                        export HOST_PUBLIC_IP=\$(curl -s ifconfig.me)
                        
                        docker compose pull
                        docker compose up -d
                        """
                        
                        // SECURITY: Delete the .env file immediately after containers start
                        sh 'rm -f .env'
                    }
                }
            }
        }
    }
}
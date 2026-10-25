pipeline {
    agent any

    environment {
        DOCKER_USER   = 'vishnumajestica'
        DEPLOY_SERVER = '65.2.169.251'
        SSH_USER      = 'ec2-user'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vishnumajestica-ux/Voting_app.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${DOCKER_USER}/voting-vote:${BUILD_NUMBER} ./vote
                    docker build -t ${DOCKER_USER}/voting-worker:${BUILD_NUMBER} ./worker
                    docker build -t ${DOCKER_USER}/voting-result:${BUILD_NUMBER} ./result
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login \
                            --username "$DH_USER" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push ${DOCKER_USER}/voting-vote:${BUILD_NUMBER}
                    docker push ${DOCKER_USER}/voting-worker:${BUILD_NUMBER}
                    docker push ${DOCKER_USER}/voting-result:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=accept-new \
                            ${SSH_USER}@${DEPLOY_SERVER} \
                            "BUILD_NUMBER=${BUILD_NUMBER} DOCKER_USER=${DOCKER_USER} bash -s" <<'REMOTE'
set -e

docker network inspect voting-net >/dev/null 2>&1 || 
    docker network create voting-net

docker volume create voting-db-data

docker rm -f voting-vote voting-worker voting-result 
    voting-redis voting-db 2>/dev/null || true

docker run -d --name voting-redis 
    --network voting-net 
    --network-alias redis 
    --restart unless-stopped 
    redis:alpine

docker run -d --name voting-db 
    --network voting-net 
    --network-alias db 
    --restart unless-stopped 
    -e POSTGRES_USER=postgres 
    -e POSTGRES_PASSWORD=postgres 
    -e POSTGRES_DB=postgres 
    -v voting-db-data:/var/lib/postgresql/data 
    postgres:15-alpine

docker pull ${DOCKER_USER}/voting-vote:${BUILD_NUMBER}
docker pull ${DOCKER_USER}/voting-worker:${BUILD_NUMBER}
docker pull ${DOCKER_USER}/voting-result:${BUILD_NUMBER}

docker run -d --name voting-vote 
    --network voting-net 
    --restart unless-stopped 
    -p 8080:80 
    ${DOCKER_USER}/voting-vote:${BUILD_NUMBER}

docker run -d --name voting-result 
    --network voting-net 
    --restart unless-stopped 
    -p 8081:80 
    ${DOCKER_USER}/voting-result:${BUILD_NUMBER}

docker run -d --name voting-worker 
    --network voting-net 
    --restart unless-stopped 
    ${DOCKER_USER}/voting-worker:${BUILD_NUMBER}

docker ps
REMOTE
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Voting App pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check Console Output for the exact error.'
        }
    }
}

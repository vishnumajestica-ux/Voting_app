pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Vote') {
            steps {
                sh 'docker build -t voting-vote:v1 ./vote'
            }
        }

        stage('Build Worker') {
            steps {
                sh 'docker build -t voting-worker:v1 ./worker'
            }
        }

        stage('Build Result') {
            steps {
                sh 'docker build -t voting-result:v1 ./result'
            }
        }

        stage('Check Images') {
            steps {
                sh 'docker images'
            }
        }
    }
}

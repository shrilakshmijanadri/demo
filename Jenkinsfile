pipeline {
    agent any

    environment {
        AWS_REGION     = 'us-east-1'
        ECR_REGISTRY   = '888577028066.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_NAME     = 'shrilakshmitest'
        IMAGE_TAG      = 'frontend'
        EC2_HOST       = 'ec2-44-223-34-14.compute-1.amazonaws.com'
        EC2_USER       = 'ubuntu'
        PEM_FILE_PATH  = 'C:/Users/Administrator/Downloads/testUbuntu.pem'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Webpack') {
            steps {
                bat 'npm install'
                bat 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCESS_KEY_ID', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'AWS_SECRET_ACCESS_KEY', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    bat "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                    bat "docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to EC2 via SSH') {
            steps {
                script {
                    def remoteCmd = "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY} && docker network create app-net || true && docker stop frontend || true && docker rm frontend || true && docker pull ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} && docker run -d --name frontend --network app-net -p 80:80 ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    bat "ssh -i \"${PEM_FILE_PATH}\" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} \"${remoteCmd}\""
                }
            }
        }
    }

    post {
        success {
            echo 'Frontend Pipeline completed successfully!'
        }
        failure {
            echo 'Frontend Pipeline failed!'
        }
    }
}

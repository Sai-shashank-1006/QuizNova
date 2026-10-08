// CI pipeline for the QuizNova quiz application.
// Works on Linux/macOS agents (sh) and Windows agents (bat).
pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate') {
      steps {
        script {
          def required = ['index.html', 'css/style.css', 'js/config.js', 'js/data.js', 'js/maths.js', 'js/app.js', 'assets/quiznova-logo.webp', 'assets/quiznova-mark.webp', 'assets/favicon.png']
          required.each { f ->
            if (!fileExists(f)) {
              error "Missing required file: ${f}"
            }
          }
          echo "All ${required.size()} application files are present."

          // Syntax-check the JavaScript when Node.js is installed on the agent.
          if (isUnix()) {
            sh '''
              if command -v node >/dev/null 2>&1; then
                node --check js/config.js
                node --check js/data.js
                node --check js/maths.js
                node --check js/app.js
                echo "JavaScript syntax check passed."
              else
                echo "Node.js not found on this agent - skipping JavaScript syntax check."
              fi
            '''
          } else {
            bat '''
              @echo off
              where node >nul 2>nul
              if errorlevel 1 (
                echo Node.js not found on this agent - skipping JavaScript syntax check.
                exit /b 0
              )
              node --check js/config.js || exit /b 1
              node --check js/data.js || exit /b 1
              node --check js/maths.js || exit /b 1
              node --check js/app.js || exit /b 1
              echo JavaScript syntax check passed.
            '''
          }
        }
      }
    }

    stage('Package') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              rm -rf dist
              mkdir -p dist
              cp -R index.html css js assets dist/
            '''
          } else {
            bat '''
              @echo off
              if exist dist rmdir /s /q dist
              mkdir dist
              copy /y index.html dist\\ >nul
              xcopy css dist\\css\\ /e /i /y >nul
              xcopy js dist\\js\\ /e /i /y >nul
              xcopy assets dist\\assets\\ /e /i /y >nul
            '''
          }
        }
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }
  }

  post {
    success {
      echo 'Build succeeded. The packaged site is archived under "dist/" and ready for GitHub Pages or any static web server.'
    }
    failure {
      echo 'Build failed - check the Validate stage output above.'
    }
  }
}

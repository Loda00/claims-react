pipeline {
	agent any

	tools {nodejs "nodejs"}

	stages {
		stage('checkout branch') {
			steps {
				git branch: '$ENV_NODE', credentialsId: '79cfaf6f-5675-4a85-80c6-5612874af098', url: 'http://10.126.11.131/claims-rrgg/bpm_web'
			}
		}
		stage('Install dependencies') {
			steps {
				sh "npm install -g yarn"
				sh 'yarn install'
			}
		} 
		stage('Build project') {
			steps {
				sh 'yarn build:$ENV_NODE'
			}
		}       
		stage('Deploy Project desa ') {
            when {
                expression { params.ENV_NODE == 'desa' }
            }
			steps {
				withAWS(credentials: '38625de2-37e3-4fa5-a28c-81e7275cdb95') {
					s3Upload(file:'build', bucket:'ue1stgdesaas3prv001', path:'ClaimsRRGG/apps/bpm_test')
				}
			}
		}
		stage('Deploy Project test ') {
            when {
                expression { params.ENV_NODE == 'test' }
            }
			steps {
				withAWS(credentials: '38625de2-37e3-4fa5-a28c-81e7275cdb95') {
					s3Upload(file:'build', bucket:'ue1stgtestas3prv001', path:'ClaimsRRGG/apps/bpm_test')
				}
			}
		}                   
	}
}



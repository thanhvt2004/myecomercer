test-build:
	sudo docker build -f Dockerfile-test -t havina/smartschool-web:0.1-test .
test-up:
	sudo docker compose --project-name=test-smartschool-web --env-file=.env-test up -d
test-down:
	sudo docker compose --project-name=test-smartschool-web down

staging-build:
	sudo docker build -f Dockerfile-staging -t havina/smartschool-web:0.1-staging .
staging-up:
	sudo docker compose --project-name=staging-smartschool-web --env-file=.env-staging up -d
staging-down:
	sudo docker compose --project-name=staging-smartschool-web down

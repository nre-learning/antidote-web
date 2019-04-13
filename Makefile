TARGET_VERSION ?= latest

all: templates docker

templates:

	@echo "Building webapp from templates in 'src/main/webapp_templates/'..."
	@cd src/main/webapp/ && rm -rf advisor/ labs/ stats/ && mkdir -p advisor/ labs/ stats/
	@cd src/main/webapp-templates/ && virtualenv venv/ && venv/bin/pip install -r build-requirements.txt && venv/bin/python generate_webapp.py $$(git rev-parse HEAD)

docker:
	docker build -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

test:

	docker kill aweb || true
	docker kill guacd || true
	docker kill linux1 || true
	docker build --build-arg COMMIT_SHA=$$COMMIT_SHA -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .

	docker run -d --rm --name linux1 -p 2222:22 antidotelabs/utility
	docker run -d --rm --name guacd -p 4822:4822 guacamole/guacd
	docker run -d \
		-e GUACD_HOSTNAME='127.0.0.1' \
		-e POSTGRES_HOSTNAME='na' \
		-e POSTGRES_DATABASE='na' \
		-e POSTGRES_USER='na' \
		-e POSTGRES_PASSWORD='na' \
		--rm --name aweb -p 8080:8080 antidotelabs/antidote-web


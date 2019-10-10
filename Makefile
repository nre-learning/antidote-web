TARGET_VERSION ?= latest

all: templates docker

templates:

	@echo "Building webapp from templates in 'src/main/webapp_templates/'..."
	@cd src/main/webapp/ && rm -rf advisor/ labs/ stats/  collections/ && mkdir -p advisor/ labs/ stats/ collections/
	@cd src/main/webapp-templates/ && virtualenv venv/ && venv/bin/pip install -r build-requirements.txt && venv/bin/python generate_webapp.py $$(git rev-parse HEAD)

docker: templates

	docker build -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

hack: templates

	docker-compose up --build

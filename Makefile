TARGET_VERSION ?= latest

all: templates docker

templates:

	@echo "Building webapp from templates in 'src/main/webapp_templates/'..."
	@cd src/main/webapp/ && rm -rf advisor/ labs/ stats/ collections/ catalog/ && mkdir -p advisor/ labs/ stats/ collections/ catalog/
	@cd src/main/webapp-templates/ && virtualenv venv/ && venv/bin/pip install -r build-requirements.txt && venv/bin/python generate_webapp.py

docker: templates

	docker build -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

hack: export ANTIDOTE_WEB_ENV = mock
hack: templates

	docker-compose up --build

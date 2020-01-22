TARGET_VERSION ?= latest

.PHONY: templates

all: docker

templates:

	@echo "Building static files to 'src/' from templates in 'templates/'..."
	@cd src/ && rm -rf advisor/ labs/ stats/ collections/ catalog/ && mkdir -p advisor/ labs/ stats/ collections/ catalog/
	@cd templates/ && virtualenv venv/ && venv/bin/pip install -r build-requirements.txt && venv/bin/python generate_webapp.py

docker: templates

	# No cache is important because of external deps
	docker build --no-cache -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

hack: export ANTIDOTE_WEB_ENV = mock
hack: templates

	docker-compose up --build

TARGET_VERSION ?= latest

.PHONY: templates

all: docker

templates:

	@echo "Building static files to 'src/' from templates in 'templates/'..."
	@cd src/ && rm -rf advisor/ labs/ stats/ collections/ catalog/ && mkdir -p advisor/ labs/ stats/ collections/ catalog/
	@cd templates/ && virtualenv venv/ && venv/bin/pip install -r build-requirements.txt && venv/bin/python generate_webapp.py

docker: templates

	# Get rid of node_modules in src/ so we don't copy into the container (it will generate its own)
	rm -rf src/node_modules/

	# No cache is important because of external deps
	docker build --no-cache -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

hack: export ANTIDOTE_WEB_ENV = mock
hack: templates

	# Just to make sure we pick up the latest for this at dev time
	rm -rf src/node_modules/nre-styles/

	cd src/ && npm install && npm run build

	docker-compose build --no-cache
	docker-compose pull
	docker-compose up

release: templates
	@rm -f src/package.json.new && cat src/package.json \
		| jq '.dependencies["antidote-localizations"] = "nre-learning/antidote-localizations#v$(TARGET_VERSION)"' \
		| jq '.dependencies["antidote-ui-components"] = "nre-learning/antidote-ui-components#v$(TARGET_VERSION)"' \
		| jq '.dependencies["nre-styles"] = "nre-learning/nre-styles#v$(TARGET_VERSION)"' \
		> src/package.json.new && \
		rm -f src/package.json && mv src/package.json.new src/package.json

	cd src/ && npm version --no-git-tag-version $(TARGET_VERSION) && npm install

	# TODO(mierdin): This was commented out - is this not needed?
	# && npm run build


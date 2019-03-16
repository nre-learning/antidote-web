TARGET_VERSION ?= latest

all: docker

docker:
	COMMIT_SHA=$(git rev-parse HEAD)

	docker build --build-arg COMMIT_SHA=$$COMMIT_SHA -t antidotelabs/antidote-web:$(TARGET_VERSION) -f Dockerfile .
	docker push antidotelabs/antidote-web:$(TARGET_VERSION)

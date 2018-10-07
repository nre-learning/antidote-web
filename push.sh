COMMIT_SHA=$(git rev-parse HEAD)

docker build --build-arg COMMIT_SHA=$COMMIT_SHA -t antidotelabs/antidote-web -f Dockerfile .
docker push antidotelabs/antidote-web:latest

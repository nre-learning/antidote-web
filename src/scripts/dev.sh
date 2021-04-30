#!/bin/sh
# set -x  # this line will enable debugs
ANTIDOTE_WEB_ENV=mock
export ANTIDOTE_WEB_ENV
if [ "$CLEAN_INSTALL" == "true" ]; then
	# install deps
  cd ../src
  npm install
  # This links the above antidote-ui-components into the src/node_modules directory
  npm link ../../antidote-ui-components
  # Cleanup
  rm -rf advisor/ labs/ stats/ collections/ catalog/
  # Set up for a clean build
  mkdir -p advisor/ labs/ stats/ collections/ catalog/
  cd ../templates
  # Create the virtual python environment 'venv'
  virtualenv venv/
  # Activate the virtual environment
  source venv/bin/activate
  pip install jinja2
  python generate_webapp.py
  # Leave the virtual environment
  deactivate
fi
if [ "$COMPOSE_UP" == "true" ]; then
  docker-compose build --no-cache
	docker-compose up -d
	echo "Cluster started. Run 'docker-compose logs' to see log output."
fi
if [ "$COMPOSE_DOWN" == "true" ]; then
  docker-compose down
fi
if [ "$COMPOSE_RESTART" == "true" ]; then
  docker-compose down
  docker-compose build --no-cache
	docker-compose up -d
	echo "Cluster started. Run 'docker-compose logs' to see log output."
fi

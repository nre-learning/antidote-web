#!/bin/bash

# Overwrite WEBSSH2_LOCATION variable if env is present
if [ -z "$WEBSSH2_LOCATION" ]; then
  echo "WEBSSH2_LOCATION not set - antidote-web will use default webssh2 location"
else
  # Be sure not to use "/" as a sed delimiter since we're going to be
  # putting things like http:// in the env var
  find /usr/share/nginx/html -name '*.html' -exec sed -i -e \
    "s@.*window.WEBSSH2_LOCATION.*@  window.WEBSSH2_LOCATION = \"$WEBSSH2_LOCATION\";@" {} +
fi

# Launch nginx in foreground
nginx -g "daemon off;"
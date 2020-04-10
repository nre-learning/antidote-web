# This Dockerfile is meant to be used for production deployments of antidote-web.
# It first performs the npm install/build step in a node container,
# and then moves thes files into a minimalist nginx container image.
# See the provided Makefile ("make hack") for development infrastructure.

FROM node AS NPM_BUILD

RUN mkdir /build
COPY src/ /build

# https://docs.npmjs.com/cli/install
RUN cd /build && npm install && npm run build

# ------------------------------------------

FROM nginx
COPY --from=NPM_BUILD /build /usr/share/nginx/html
COPY launch.sh /
CMD ["/launch.sh"]

FROM node AS NPM_BUILD

RUN mkdir /build
COPY src/ /build

# https://docs.npmjs.com/cli/install
RUN cd /build && npm install && npm run build

# ------------------------------------------

FROM nginx
COPY --from=NPM_BUILD /build /usr/share/nginx/html

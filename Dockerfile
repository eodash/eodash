FROM nginx:alpine

# install nodejs to run the config script
RUN apk add --no-cache nodejs npm

# copy built assets
COPY .eodash/dist/. /usr/share/nginx/html/
COPY core/node/scripts/. /app/scripts/
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# expected envs or override /usr/share/nginx/html/config.js
ENV STAC_ENDPOINT=
ENV API=false
ENV BRAND=

ENTRYPOINT ["/entrypoint.sh"]
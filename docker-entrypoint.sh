#!/bin/sh
set -e

# generate config files
node /app/scripts/createDockerConfig.js --dir /usr/share/nginx/html

# start nginx
nginx -g 'daemon off;'

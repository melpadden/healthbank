#!/bin/sh

# replace env-settings.json with right values. this will default to _same host_ but can be overwritten by the referenced environment variables
cat /etc/nginx/env-settings.json.template | envsubst > /usr/share/nginx/html/env-settings.json

# start nginx
nginx -g "daemon off;"

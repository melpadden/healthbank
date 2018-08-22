FROM nginx:1.15-alpine

RUN apk update \
  && apk add wget

#copy necessary configuration
COPY nginx-config/nginx.conf /etc/nginx/nginx.conf

#prepare dynamic environments. docker-entryfile will prepare the right env-settings.json, based on environment vars
COPY nginx-config/env-settings.json.template /etc/nginx/env-settings.json.template
COPY nginx-config/docker-entryfile.sh /docker-entryfile.sh

RUN chmod +x /docker-entryfile.sh

HEALTHCHECK --interval=1m --timeout=5s \
  CMD wget -q -O- -U "docker healthcheck" http://127.0.0.1/index.html || exit 1
CMD ["/docker-entryfile.sh"]

#copy build artifacts
COPY target/classes/static/ /usr/share/nginx/html

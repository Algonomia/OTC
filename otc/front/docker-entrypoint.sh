#!/bin/sh

if [ -n "$ENV_JSON" ]; then
    mkdir -p /usr/share/nginx/html/environments
    echo "$ENV_JSON" | base64 -d > /usr/share/nginx/html/environments/env.json
    echo "[entrypoint] env.json written from ENV_JSON"
else
    echo "[entrypoint] No ENV_JSON set, using default env.json"
fi

exec nginx -g 'daemon off;'

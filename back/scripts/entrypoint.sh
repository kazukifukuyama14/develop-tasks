#!/bin/sh
set -e

echo "[Entrypoint] setting DATABASE_URL from existing environment variables"

: "${DB_USER:?Missing DB_USER}"
: "${DB_PASSWORD:?Missing DB_PASSWORD}"
: "${DB_PORT:=5432}"
: "${DB_HOST:?Missing DB_HOST}"
: "${DB_NAME:?Missing DB_NAME}"

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

echo "[Entrypoint] Set DATABASE_URL"

echo "[Entrypoint] Connecting to postgres://${DB_USER}:xxx@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "[Entrypoint] Starting server..."
exec "$@"
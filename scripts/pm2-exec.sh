#!/usr/bin/env bash
# Single entry point for every pm2-managed app in this repo.
#
# Why it exists: pm2 walks a process tree by spawning `pgrep -P` once per node
# (lib/TreeKill.js). On a deep tree that fan-out outruns how fast macOS reaps
# children, hits the per-user process ceiling, and the daemon dies on an
# uncaught `spawn EBADF` after a burst of `spawn pgrep EAGAIN` - taking every
# managed app with it. Loading .env here instead of through `bunx dotenv-cli`
# removes two processes per app, so each app is exactly one process and
# `treekill: false` in ecosystem.config.cjs is safe.
#
# Usage: pm2-exec.sh [--wait-redis] <command> [args...]

set -euo pipefail

ROOT="$( cd "$( dirname "$0" )/.." && pwd )"
ENV_FILE="$ROOT/.env"

# Matches `bunx dotenv-cli` semantics: a value already in the environment wins.
if [ -f "$ENV_FILE" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        line="${line%$'\r'}"

        case "$line" in ''|'#'*) continue ;; esac
        case "$line" in *=*) ;; *) continue ;; esac

        key="${line%%=*}"
        key="${key#export }"
        value="${line#*=}"

        case "$key" in [A-Za-z_]*) ;; *) continue ;; esac

        case "$value" in
            \"*\" ) value="${value#\"}"; value="${value%\"}" ;;
            \'*\' ) value="${value#\'}"; value="${value%\'}" ;;
        esac

        if [ -z "${!key+set}" ]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
fi

if [ "${1:-}" = "--wait-redis" ]; then
    shift

    # RedisClient fails fast and latches `connectionFailed` forever, so a
    # consumer that starts before the container is listening never reconnects.
    redis_url="${REDIS_URL:-redis://localhost:6379}"
    wait_timeout="${REDIS_WAIT_TIMEOUT:-60}"

    host_port="${redis_url#*://}"
    host_port="${host_port%%/*}"
    host_port="${host_port##*@}"

    host="${host_port%%:*}"
    port="${host_port##*:}"

    if [ "$port" = "$host" ]; then
        port="6379"
    fi

    deadline=$(( SECONDS + wait_timeout ))

    until ( exec 3<>"/dev/tcp/$host/$port" ) 2>/dev/null; do
        if [ "$SECONDS" -ge "$deadline" ]; then
            echo "pm2-exec: redis at $host:$port unreachable after ${wait_timeout}s" >&2
            exit 1
        fi

        sleep 1
    done
fi

exec "$@"

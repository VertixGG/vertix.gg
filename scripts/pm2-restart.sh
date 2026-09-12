#!/usr/bin/env bash
# Ordered cold restart: tear the whole stack down, then bring it back one app at
# a time, waiting for each to actually accept connections before starting the
# next. `pm2 restart` cannot do this - it signals every app at once.
#
# Order is not cosmetic:
#   redis   - RedisClient fails fast and latches `connectionFailed` forever, so
#             anything that starts before the container is listening never
#             reconnects. It is started even though it is not in the requested
#             list, because the API and the bot cannot come up without it.
#   logger  - owns :3090, so the API and the bot have somewhere to send their
#             first lines instead of dropping them.
#   api     - owns :3021.
#   bot     - last; it has no port of its own.
# The dashboard is restored at the end so a teardown does not leave the UI down.

set -euo pipefail

ROOT="$( cd "$( dirname "$0" )/.." && pwd )"
ECOSYSTEM="$ROOT/ecosystem.config.cjs"

READY_TIMEOUT="${PM2_RESTART_READY_TIMEOUT:-90}"

# pm2 never reads .env, so pull the two ports this script waits on straight out
# of the file the apps themselves are launched with.
env_value() {
    local key="$1" default="$2" line

    line="$( grep -m1 "^${key}=" "$ROOT/.env" 2>/dev/null || true )"

    if [ -n "$line" ]; then
        printf '%s' "${line#*=}"
    else
        printf '%s' "$default"
    fi
}

wait_for_port() {
    local host="$1" port="$2" label="$3"
    local deadline=$(( SECONDS + READY_TIMEOUT ))

    until ( exec 3<>"/dev/tcp/$host/$port" ) 2>/dev/null; do
        if [ "$SECONDS" -ge "$deadline" ]; then
            echo "pm2-restart: $label never listened on $host:$port (${READY_TIMEOUT}s)" >&2
            exit 1
        fi

        sleep 1
    done

    echo "pm2-restart: $label ready on $host:$port"
}

start_app() {
    pm2 start "$ECOSYSTEM" --only "$1" --silent
    echo "pm2-restart: started $1"
}

echo "pm2-restart: tearing down"
pm2 delete all --silent 2>/dev/null || true

# Stragglers: a daemon that died mid-flight leaves its apps reparented to init,
# and those still hold the ports the restart is about to need.
pkill -f "bun src/index-bun.ts" 2>/dev/null || true
pkill -f "bun --bun --hot src/index-bun.ts" 2>/dev/null || true
pkill -f "bun src/index.ts" 2>/dev/null || true
pkill -f "pm2-dashboard --host" 2>/dev/null || true
sleep 2

start_app vertix-redis
wait_for_port "localhost" 6379 "redis"

start_app vertix-logger
wait_for_port "127.0.0.1" "$( env_value LOGGER_SERVER_HTTP_PORT 3090 )" "logger"

start_app vertix-api
wait_for_port "127.0.0.1" "$( env_value API_PORT 3021 )" "api"

start_app vertix-bot
start_app pm2-dashboard

pm2 save --silent
pm2 status

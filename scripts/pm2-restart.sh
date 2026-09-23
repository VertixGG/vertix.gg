#!/usr/bin/env bash
# Ordered cold restart: tear the whole stack down, then bring it back one app at
# a time, waiting for each to actually accept connections before starting the
# next. `pm2 restart` cannot do this - it signals every app at once.
#
# Order is not cosmetic:
#   logger  - first up and last down. It owns :3090, and everything else here
#             sends its lines there, so it has to be listening before any of them
#             starts and still listening while they stop. It needs nothing itself,
#             which is why it can go ahead of redis.
#   redis   - RedisClient fails fast and latches `connectionFailed` forever, so
#             anything that starts before the container is listening never
#             reconnects. It is started even though it is not in the requested
#             list, because the API and the bot cannot come up without it.
#   api     - owns :3021.
#   bot     - last; it has no port of its own.
# The dashboard is restored at the end so a teardown does not leave the UI down.
#
# The watchdog is outside that order entirely: it is left running across the
# whole teardown, which is the one app that has to be, because it is what
# reports the deploy. It holds a deliberate stop back rather than alerting on
# it, and names what went down together once they are up again - so a finished
# deploy posts "5 apps redeployed" instead of nothing, and a deploy that half
# fails says which app never came back.
#
# That means sparing it in three places below - the named teardown list, the
# blanket delete, and the pkill - and starting it at the end only if it is not
# already up.
#
# The teardown is ordered too, in reverse. `pm2 delete all` signals every app at
# once, which takes the logger down alongside the apps still writing to it.

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

# pm2's pid for one app, or empty. Asked for rather than matched by pattern, because the logger and
# the watchdog are both `bun src/index.ts` and only one of them is meant to survive the teardown.
app_pid() {
    pm2 jlist 2>/dev/null | node -e '
        const chunks = [];

        process.stdin.on( "data", ( chunk ) => chunks.push( chunk ) );
        process.stdin.on( "end", () => {
            let apps = [];

            try {
                apps = JSON.parse( chunks.join( "" ) || "[]" );
            } catch ( error ) {
                apps = [];
            }

            const app = apps.find( ( entry ) => entry.name === process.argv[ 1 ] );

            process.stdout.write( app && app.pid ? String( app.pid ) : "" );
        } );
    ' "$1" 2>/dev/null || true
}

echo "pm2-restart: tearing down"

# Which bot apps pm2 currently has, whatever shard count started them.
#
# Asked of pm2 rather than of the ecosystem because the two disagree exactly when it matters:
# changing the shard count means the apps to tear down are named differently from the apps about to
# start - `vertix-bot-0` and `vertix-bot-1` on the way back to one, `vertix-bot` on the way up. An
# app this does not name survives to the `pm2 delete all` below, which runs after the logger is
# already gone, which is the one thing the ordered teardown exists to avoid.
running_bot_apps() {
    pm2 jlist 2>/dev/null | node -e '
        const chunks = [];

        process.stdin.on( "data", ( chunk ) => chunks.push( chunk ) );
        process.stdin.on( "end", () => {
            let apps = [];

            try {
                apps = JSON.parse( chunks.join( "" ) || "[]" );
            } catch ( error ) {
                apps = [];
            }

            process.stdout.write(
                apps.map( ( app ) => app.name )
                    .filter( ( name ) => /^vertix-bot(-[0-9]+)?$/.test( name ) )
                    .join( " " )
            );
        } );
    ' 2>/dev/null || true
}

# Reverse of the start order, so the logger is still up while everything that
# logs to it is going down, and is the last of the named apps to go.
#
# `vertix-bot` is named on its own as well as discovered, so the plain unsharded case never depends
# on that json parse; deleting an app that is not there is already a no-op here.
for app in pm2-dashboard $( running_bot_apps ) vertix-bot vertix-api vertix-redis vertix-logger; do
    pm2 delete "$app" --silent 2>/dev/null || true
done

# Anything this script does not name - added since, or left by a dead daemon.
# `pm2 delete all` cannot spare one app, so the list is asked for and filtered.
pm2 jlist 2>/dev/null | node -e '
    const chunks = [];

    process.stdin.on( "data", ( chunk ) => chunks.push( chunk ) );
    process.stdin.on( "end", () => {
        let apps = [];

        try {
            apps = JSON.parse( chunks.join( "" ) || "[]" );
        } catch ( error ) {
            apps = [];
        }

        process.stdout.write(
            apps.map( ( app ) => app.name )
                .filter( ( name ) => name !== "vertix-watchdog" )
                .join( "\n" )
        );
    } );
' 2>/dev/null | while read -r stray || [ -n "$stray" ]; do
    # `|| [ -n ... ]` because the list has no trailing newline, and a plain `read` drops the last
    # name it is handed - which would leave exactly one stray app alive, at random.
    if [ -n "$stray" ]; then
        pm2 delete "$stray" --silent 2>/dev/null || true
    fi
done

# Stragglers: a daemon that died mid-flight leaves its apps reparented to init,
# and those still hold the ports the restart is about to need.
pkill -f "bun src/index-bun.ts" 2>/dev/null || true
pkill -f "bun --bun --hot src/index-bun.ts" 2>/dev/null || true

# Not a pkill: this pattern is the logger's command line and the watchdog's alike, and the watchdog
# is staying up. Its pid is spared by number, which is the only thing that tells the two apart.
WATCHDOG_PID="$( app_pid vertix-watchdog )"

for stray in $( pgrep -f "bun src/index.ts" 2>/dev/null || true ); do
    if [ "$stray" != "$WATCHDOG_PID" ]; then
        kill "$stray" 2>/dev/null || true
    fi
done

pkill -f "pm2-dashboard --host" 2>/dev/null || true
sleep 2

start_app vertix-logger
wait_for_port "127.0.0.1" "$( env_value LOGGER_SERVER_HTTP_PORT 3090 )" "logger"

start_app vertix-redis
wait_for_port "localhost" 6379 "redis"

start_app vertix-api
wait_for_port "127.0.0.1" "$( env_value API_PORT 3021 )" "api"

# Asked of the ecosystem rather than spelled out, because how many bot processes there are is
# decided there by PM2_BOT_SHARD_COUNT - `vertix-bot-0` and `vertix-bot-1` by default, a single
# `vertix-bot` when it is rolled back to one. Spelled out here the two would drift, and the drift
# would look like a shard that simply never started.
BOT_APPS="$( node -e "process.stdout.write( require( '$ECOSYSTEM' ).botAppNames.join( ' ' ) )" )"

for bot_app in $BOT_APPS; do
    start_app "$bot_app"
done

start_app pm2-dashboard

# Normally already up - it is deliberately not torn down. Started here only when it was missing to
# begin with, which is what a dead daemon leaves behind.
if [ -z "$( app_pid vertix-watchdog )" ]; then
    start_app vertix-watchdog
else
    echo "pm2-restart: vertix-watchdog kept up across the deploy"
fi

pm2 save --silent
pm2 status

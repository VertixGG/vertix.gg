const path = require( "node:path" );

const ROOT = __dirname;

const PM2_EXEC = path.join( ROOT, "scripts", "pm2-exec.sh" );

const DASHBOARD_HOST = process.env.PM2_DASHBOARD_HOST || "127.0.0.1";
const DASHBOARD_PORT = process.env.PM2_DASHBOARD_PORT || "3091";

/**
 * Every app here is deliberately ONE process, and `treekill` is off.
 *
 * pm2 walks a process tree by spawning `pgrep -P` per node; that fan-out
 * exhausts the macOS process ceiling and kills the daemon on an uncaught
 * `spawn EBADF`, orphaning everything it managed. With a single process per app
 * there is no tree to walk, so pm2 can signal the child directly.
 *
 * scripts/pm2-exec.sh loads .env and execs, which is what keeps the count at
 * one - `bunx dotenv-cli` used to add a bunx shim and a node process per app.
 *
 * `time` stays off: the pm2 timestamp prefix would break the
 * `[date][module][method]:` shape that scripts/log-extreact.js parses.
 *
 * LOGGER_PROCESS_NAME is set per app because MCPService falls back to
 * `npm_package_name`, which is whatever package ran pm2 - the repo root when
 * started through `bun run vertix:pm2:*`, so every app logged as "vertix.gg".
 */
const shared = {
    treekill: false,
    autorestart: true,
    restart_delay: 3000,
    min_uptime: 10000,
    max_restarts: 10,
    kill_timeout: 10000,
};

module.exports = {
    apps: [
        /**
         * First, and ahead of redis - which it can be, because it needs nothing itself.
         *
         * Everything else here sends its lines to :3090, so it has to be listening before any of
         * them starts. This order only governs a plain `pm2 start ecosystem.config.cjs`; the
         * restart everybody actually runs is scripts/pm2-restart.sh, which starts each app by name
         * and waits for its port, and decides the order itself. Changing one without the other
         * leaves them disagreeing.
         */
        {
            ... shared,
            name: "vertix-logger",
            cwd: path.join( ROOT, "packages", "vertix-logger" ),
            script: PM2_EXEC,
            args: "bun src/index.ts",
            env: { LOGGER_PROCESS_NAME: "vertix-logger" },
            interpreter: "bash",
        },
        {
            ... shared,
            name: "vertix-redis",
            cwd: path.join( ROOT, "apps", "redis" ),
            // Foreground, not `up -d`: a detached compose would exit and read as a crash.
            script: "docker",
            args: "compose up",
            interpreter: "none",
        },
        {
            ... shared,
            name: "vertix-api",
            cwd: path.join( ROOT, "apps", "vertix-api" ),
            script: PM2_EXEC,
            // No `--hot` here, unlike the dev script. A pull writes its files one at a time and the
            // hot reloader fires on each, so the API spends the length of a deploy reloading against
            // a half-written tree - long enough to serve `Cannot find module` for a route whose file
            // has not landed yet, and worse, to come back with a module list that is empty and still
            // answer 200. A deploy restarts this process explicitly instead.
            args: "--wait-redis bun --bun src/index-bun.ts",
            env: { LOGGER_PROCESS_NAME: "vertix-api" },
            interpreter: "bash",
        },
        {
            ... shared,
            name: "vertix-bot",
            cwd: path.join( ROOT, "apps", "vertix-bot" ),
            script: PM2_EXEC,
            args: "--wait-redis bun src/index-bun.ts",
            env: { LOGGER_PROCESS_NAME: "vertix-bot" },
            interpreter: "bash",
        },
        {
            ... shared,
            name: "pm2-dashboard",
            cwd: ROOT,
            // Loopback on purpose: bound anywhere else the dashboard marks its
            // session cookie Secure, and a browser on plain HTTP drops it, so
            // every call after login 401s. nginx on 3092 serves the LAN.
            // pm2 does not read .env, so override via the shell before `pm2 start`.
            script: "pm2-dashboard",
            args: `--host ${ DASHBOARD_HOST } --port ${ DASHBOARD_PORT }`,
            interpreter: "none",
        },
    ],
};

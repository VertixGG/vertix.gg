# @vertix.gg/logger

Centralized logger server for Vertix services.

## Overview

This package provides a standalone logger server that:
- Receives logs from all Vertix services via HTTP (port 3090)
- Stores logs in memory (max 10,000 entries)
- Exposes MCP tools for querying logs via stdio transport
- Provides HTTP endpoints for health checks and log retrieval

## Usage

### Start the Logger Server

```bash
# Production
bun run vertix:logger:start

# Development (with watch)
bun run vertix:logger:dev
```

### Install as a systemd service (Linux)

From the repo root:

```bash
bash packages/vertix-logger/install-systemd-service.bash
```

This installs a user-scoped unit to `~/.config/systemd/user/vertix-logger.service` and enables it.

Optional flags:

```bash
bash packages/vertix-logger/install-systemd-service.bash --name vertix-logger --scope user --linger
bash packages/vertix-logger/install-systemd-service.bash --repo-root /opt/vertix.gg
bash packages/vertix-logger/install-systemd-service.bash --scope system --unit-dir /etc/systemd/system
```

Uninstall:

```bash
bash packages/vertix-logger/uninstall-systemd-service.bash
```

Logs:

```bash
journalctl --user -u vertix-logger.service -f
```

### Install as a launchd service (macOS)

From the repo root:

```bash
bash packages/vertix-logger/install-launchd-service.bash
```

This installs a user-scoped plist to `~/Library/LaunchAgents/gg.vertix.logger.plist` and loads it immediately.

Optional flags:

```bash
bash packages/vertix-logger/install-launchd-service.bash --name gg.vertix.logger --scope user
bash packages/vertix-logger/install-launchd-service.bash --repo-root /opt/vertix.gg
bash packages/vertix-logger/install-launchd-service.bash --scope system --plist-dir /Library/LaunchDaemons
bash packages/vertix-logger/install-launchd-service.bash --env-file /path/to/.env
bash packages/vertix-logger/install-launchd-service.bash --no-start
```

Uninstall:

```bash
bash packages/vertix-logger/uninstall-launchd-service.bash
```

Logs:

```bash
tail -f ~/Library/Logs/vertix-logger/stdout.log
tail -f ~/Library/Logs/vertix-logger/stderr.log
```

### Environment Variables

- `LOGGER_SERVER_HTTP_PORT` - HTTP server port (default: 3090)
- `LOGGER_SERVER_HOST` - HTTP server host (default: 0.0.0.0)

### MCP Configuration

The logger server exposes MCP tools via stdio. Configure it in your `mcp.json`:

```json
{
  "mcpServers": {
    "vertix-logger": {
      "command": "bun",
      "args": [
        "run",
        "/path/to/packages/vertix-logger/src/mcp-stdio.ts"
      ],
      "env": {
        "LOGGER_SERVER_HTTP_PORT": "3090",
        "LOGGER_SERVER_HOST": "localhost"
      }
    }
  }
}
```

## API Endpoints

- `POST /logs` - Receive log entries
- `GET /logs?limit=50&startTime=...&endTime=...` - Get logs with optional filtering
- `GET /health` - Health check endpoint

## MCP Tools

- `getRecentLogs` - Get recent logs with optional time filtering
- `getLogsInfo` - Get log statistics
- `getLogsRange` - Get logs within a time range


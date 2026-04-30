<p align="center">
    <a href="https://vertix.gg/">
        <img src="assets/brand/Robot.png" alt="Vertix" width="220" />
    </a>
</p>

<h1 align="center">Vertix</h1>

<p align="center">
    <strong>The exceptional Discord bot designed to revolutionize your server experience.</strong><br/>
    Advanced temporary voice channels, auto-scaling rooms, and a web dashboard — all in one place.
</p>

<p align="center">
    <a href="https://vertix.gg/invite-vertix">Invite Vertix</a> ·
    <a href="https://vertix.gg/welcome">Documentation</a> ·
    <a href="https://dashboard.vertix.gg">Dashboard</a> ·
    <a href="https://vertix.gg/changelog">Changelog</a>
</p>

---

## Quick Start — Run Vertix Locally

This monorepo contains every Vertix service: the Discord bot, the REST API, the web dashboard, the marketing website, the logger, and the MCP server. The steps below get the entire stack running on your machine.

### 1. Prerequisites

Install these once on your system:

| Tool | Version | Notes |
| --- | --- | --- |
| [Bun](https://bun.sh/) | `>= 1.3.0` | Package manager + runtime for every service |
| [Docker](https://www.docker.com/) (or Docker Desktop) | latest | Used to run Redis via `docker-compose` |
| [MongoDB](https://www.mongodb.com/try/download/community) | `>= 6.x` | Must run as a **replica set** (Prisma requirement) |
| Git | latest | To clone the repo |

> 💡 You can also use a managed MongoDB Atlas cluster instead of a local install — just point `BOT_PRISMA_DATABASE_URL` / `API_PRISMA_DATABASE_URL` at it.

You'll also need a [Discord bot token](https://discord.com/developers/applications) and a Discord OAuth2 client (client id + secret + redirect URI) for the dashboard sign-in.

### 2. Clone & Install

```bash
git clone https://github.com/VertixGG/vertix.gg.git
cd vertix.gg

bun install
```

This installs every workspace (`apps/*`, `packages/*`, `assets`) in one shot.

### 3. Configure Environment Variables

Every Vertix service (bot, api, dashboard, mcp, logger) loads from a **single root-level `.env`** file. The repo ships with a fully-commented [example.env](example.env) — copy it to `.env` and fill in your values:

```bash
cp example.env .env
```

Then open `.env` and fill in at minimum the following values (the rest already have safe defaults):

| Variable | Where to get it |
| --- | --- |
| `DISCORD_TEST_TOKEN` | [Discord Developer Portal](https://discord.com/developers/applications) → your app → **Bot** → **Reset Token** |
| `OWNERD_ID` | Your own Discord user id (right-click your profile → **Copy User ID**, with Developer Mode on) |
| `BOT_PRISMA_DATABASE_URL` | Your MongoDB replica set URL (default `mongodb://127.0.0.1:27017/discord?directConnection=true` works for a local install) |
| `API_PRISMA_DATABASE_URL` | Same MongoDB instance, separate database — default `mongodb://127.0.0.1:27017/api?directConnection=true` |
| `DASHBOARD_DISCORD_CLIENT_ID` | Discord Developer Portal → **OAuth2** → **Client ID** |
| `DASHBOARD_DISCORD_CLIENT_SECRET` | Discord Developer Portal → **OAuth2** → **Client Secret** |
| `DASHBOARD_DISCORD_REDIRECT_URI` | Add `http://localhost:3021/api/auth/discord/callback` to the OAuth2 **Redirects** list, then paste it here |
| `DASHBOARD_SESSION_SECRET` | Generate one: `openssl rand -base64 32` |

The `OPENAI_API_KEY`, `TOP_GG_TOKEN`, and `*_DEPLOY_*` blocks are **optional** — leave them empty unless you're using those features.

> ⚠️ **Never commit your `.env` file.** It's already gitignored — only `example.env` is checked in.
>
> 💡 When you add a new env variable, also add it to [example.env](example.env) (with a placeholder, not a real value) so contributors know it exists.

### 4. Start Infrastructure

#### MongoDB (replica set)

If you installed MongoDB locally, start it as a replica set:

```bash
# Start mongod with a replica set name
mongod --dbpath /path/to/data --replSet rs0

# In another terminal, initialize the replica set (only the first time)
mongosh < setup-replica-set.js
```

If you're on macOS with Homebrew, an alternative is `brew services start mongodb-community` and then run the `mongosh` step above.

#### Redis (Docker)

```bash
bun run vertix:redis:start    # docker-compose up -d
# Other helpers:
bun run vertix:redis:logs     # follow logs
bun run vertix:redis:cli      # open redis-cli
bun run vertix:redis:stop     # stop the container
```

### 5. Generate Prisma Clients

```bash
cd packages/vertix-prisma
bunx prisma generate --schema prisma/bot.schema.prisma
bunx prisma generate --schema prisma/api.schema.prisma
cd ../..
```

### 6. Start Every Service

Each service runs as its own long-lived process. Open a terminal per service (or use a process manager like [tmux](https://github.com/tmux/tmux), [overmind](https://github.com/DarthSim/overmind), or your IDE's run configurations):

```bash
# 1. Discord bot
bun run vertix:bot:bun:start:dev

# 2. REST API (powers the dashboard)        → http://localhost:3021
bun run vertix:api:dev

# 3. Dashboard (Vite dev server)            → http://localhost:3020
bun run vertix:dashboard:dev

# 4. Marketing website                      → http://localhost:5173 (Vite default)
bun run vertix:website:dev

# 5. Logger service (optional, for log UI)  → http://localhost:3090
bun run vertix:logger:dev

# 6. MCP server (optional, for AI tooling)
bun run vertix:mcp:dev
```

> 🔁 Want the bot to auto-restart on crash during development? Use the included loop script:
>
> ```bash
> bash run-bot-loop.sh
> ```

### 7. Invite Your Bot & Configure It

1. In the [Discord Developer Portal](https://discord.com/developers/applications), invite your bot to a test server with the `bot` and `applications.commands` scopes (and the **Manage Channels**, **Move Members**, **Manage Roles**, **View Channels**, **Send Messages** permissions at minimum).
2. In your test server, run `/setup` and click **➕ Create Master Channel** (or **📈 Create Scaling Channel**) — see the [full setup walkthrough below](#getting-started-1).
3. Open the dashboard at [http://localhost:3020](http://localhost:3020) and sign in with the Discord account that's in your test server. You can now manage master channels, edit translations, and use the visual editor straight from the browser.

### 8. Verify Everything Is Working

```bash
# Type-check the entire monorepo
bun run vertix:typecheck

# Run all Jest test suites (base + bot + gui)
bun run vertix:jest

# Lint
bun run vertix:eslint
```

Once the bot prints `Ready!`, the API is listening on port `3021`, and the dashboard loads at `http://localhost:3020` — you're fully self-hosted.

---

## Getting to Know the Basics

Before diving in, two key concepts make Vertix work:

- **Master Channel** — Think of this as the "generator." When you enter a Master Channel, Vertix automatically creates a private space just for you and moves you there.
- **Dynamic Channel** — Your temporary home. It's created the moment you need it and disappears automatically once the last person leaves, keeping your server clean and organized.

---

## Temporary Voice Channels — V2 Features

The classic button-based interface inside every dynamic channel:

- ✏️ **Rename** — Give your space a unique name.
- ✋ **Limit** — Control how many people can join.
- 🚫 **Privacy** — Switch between Public and Private.
- 🙈 **Visibility** — Hide your channel from the list.
- 👥 **Access** — Manage who's allowed or blocked.
- 🔃 **Reset** — Start fresh with default settings.
- 🔀 **Transfer** — Hand over ownership to a friend.
- 😈 **Claim** — Take over inactive channels automatically.

### Access Controls

- **Grant Access** — Override channel state for a specific user.
- **Remove Access** — Revoke a previously granted user.
- **Block / Unblock** — Block (and kick) a user, or lift the block.
- **Kick User** — Remove a user from the channel.

### Claim Flow

When the channel owner leaves and doesn't return within ~10 minutes, the **Claim** button enables. The first user to click steps in to take ownership within ~1 minute. If multiple users click "Step In," a vote starts and the user with the most votes wins ownership.

---

## Temporary Voice Channels — V3 Features 🚀

V3 brings a more modern, intuitive, and lightning-fast interface to your Discord server.

- **Rename** — Change your channel name.
- **User Limit** — Set maximum members.
- **Clear Chat** — Wipe channel messages.
- **Reset** — Restore default settings.
- **Region** — Pick voice server region.
- **Templates** — Save and load channel presets per guild.
- **Permissions** — Manage user access.
- **Privacy** — Toggle public or private.
- **Edit Primary Message** — Customize title and description.
- **Transfer** — Give ownership to another user.
- **Claim** — Take over inactive channels.

---

## Auto-Scaling Channels 📈

Never worry about running out of voice channel capacity again. Vertix automatically creates and manages voice channels based on demand.

- **Smart Creation** — When users join the master channel, they're moved to an available room (or a new one is created on demand).
- **Custom Prefix** — Configure naming like `Room-{index}` for clean, numbered rooms.
- **Max Members** — Set a per-room cap so groups stay the right size.
- **Min Available Buffer** — Keep at least N empty rooms ready at all times.
- **Auto-Renumbering** — Channels are renumbered every ~5 minutes to keep names consistent.
- **Safe Deletion** — Tear down a scaling setup with a confirmation that cleans up all related channels.

Run `/setup` → `📈 Create Scaling Channel` and you're done. [Learn more →](https://vertix.gg/features/auto-scaling)

---

## Dashboard 🎨

Manage your Vertix setup from a web-based dashboard at **[dashboard.vertix.gg](https://dashboard.vertix.gg)** — no commands needed.

### Visual Editor
- Flow-based editor for customizing bot UI components
- Customize embeds, elements, and modals per guild
- Per-language translations with live preview
- Save and apply changes in real-time

### Bot Management
- Create and configure auto-scaling channel setups
- Create and configure dynamic channel setups
- Edit master channel settings from the browser
- Delete setups with safe confirmation

---

## Flexible Setup at Every Level

Vertix gives you control exactly where you need it.

### Server Level
- 🌐 **Language Select** — English, Russian, Greek, Spanish, French, German, Japanese.
- 🚫 **Bad-Words Filter** — Keep your channel names clean.

### Master Channel Level
- 🏷️ **Naming Templates** — Automate how channels look (`{user}'s Channel`, `Room-{index}`, …).
- 🎚️ **Interface Control** — Enable / disable individual buttons in dynamic channels.
- 🛡️ **Verified Roles** — Define who can manage their space.
- 📝 **Detailed Logs** — Send activity to a custom log channel.
- 💬 **Control Panel Channel** — A dedicated text channel auto-created next to the master channel for managing dynamic channels even when you're not in one.
- 👤 **Role-Based Button Overrides** — Customize button layouts for specific roles within a single Master Channel.

---

## Getting Started

Setting up Vertix is a breeze:

1. Type `/setup` in any channel to begin.
2. Click **➕ Create Master Channel** (or **📈 Create Scaling Channel** for auto-scaling).
3. Choose a name template or keep the default by clicking **▶ Next**.
4. Pick your interface buttons and click **▶ Next**.
5. Set your verified roles and click **✔ Finish**.

> 💡 **Pro Tip:** You can always tweak these settings later using the same `/setup` command.

---

## Buttons Interface

The buttons interface lives **inside** the dynamic channel. Open the chat box of the dynamic channel to access it. With V3, the same controls are available through a sleek embed-driven panel.

---

## Project Structure

This is a [Bun](https://bun.sh)-managed monorepo:

```
vertix.gg/
├── apps/
│   ├── vertix-api/         REST API
│   ├── vertix-bot/         Discord bot
│   ├── vertix-dashboard/   Web dashboard (dashboard.vertix.gg)
│   ├── vertix-mcp/         MCP server
│   ├── vertix-website/     Marketing site (vertix.gg)
│   └── redis/              Redis dev container
├── packages/
│   ├── vertix-base/        Shared base utilities
│   ├── vertix-definitions/ Shared definitions
│   ├── vertix-discord-ui/  Discord UI rendering
│   ├── vertix-gui/         GUI framework
│   ├── vertix-logger/      Logging service
│   ├── vertix-prisma/      Database layer
│   ├── vertix-test-utils/  Testing helpers
│   ├── vertix-ui/          Shared UI components
│   └── vertix-utils/       Shared utilities
└── assets/                 Brand and emoji assets
```

### Common Scripts

```bash
# Bot
bun run vertix:bot:bun:start:dev

# Website
bun run vertix:website:dev

# Dashboard
bun run vertix:dashboard:dev

# API
bun run vertix:api:dev

# Type-check everything
bun run vertix:typecheck

# Run all Jest suites
bun run vertix:jest
```

---

## Suggestions 💡

Most of the best features in **Vertix** started as a spark of an idea from someone like you. We're committed to building the ultimate Discord experience, and your feedback is our roadmap.

Have an idea? Notice something that could be better? Join the community and let us know — we're excited to evolve Vertix together with you.

---

## Links

- 🌐 **Website:** [vertix.gg](https://vertix.gg/)
- ➕ **Invite:** [vertix.gg/invite-vertix](https://vertix.gg/invite-vertix)
- 🎛️ **Dashboard:** [dashboard.vertix.gg](https://dashboard.vertix.gg)
- 📖 **Docs:** [vertix.gg/welcome](https://vertix.gg/welcome)
- 📜 **Changelog:** [vertix.gg/changelog](https://vertix.gg/changelog)
- 🔒 **Privacy:** [vertix.gg/privacy-policy](https://vertix.gg/privacy-policy)
- 📃 **Terms:** [vertix.gg/terms-of-service](https://vertix.gg/terms-of-service)

---

## License

Vertix is released under the **MIT License** — free for personal and commercial use, fork it, modify it, ship it. See [LICENSE](LICENSE) for the full text.

Contributions are welcome! Open an issue or a pull request on [GitHub](https://github.com/VertixGG/vertix.gg).

# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Bun workspaces; all runtime, UI, and tooling code lives under `packages/*`.
- Highlights: `vertix-bot` (Discord runtime), `vertix-base` / `vertix-utils` / `vertix-test-utils` (shared core + mocks), `vertix-gui` and `vertix-flow` (configuration UI), `vertix-website` (marketing site), `vertix-prisma` (database clients).
- Supporting dirs: `docs/` (references), `assets/` (shared imagery), `scripts/` (`ci-jest.bash`, `backup-bot-prisma.js`, etc.).

## Build, Test & Development Commands
- `bun install` – refresh workspace dependencies after cloning or adding packages.
- `bun run vertix:bot:bun:start:dev` – start the Discord bot with Bun hot reload (`vertix:bot:node:start:dev` uses ts-node).
- `bun run vertix:pm2:start` – bring up Redis, the logger, the API, the bot and the pm2 dashboard together (`ecosystem.config.cjs`); pair with `vertix:pm2:logs`, `:status`, `:stop`.
- `bun run vertix:pm2:restart` – ordered cold restart: tears everything down, then starts Redis, logger, API and bot one at a time, waiting for each to accept connections first.
- pm2 never reads `.env`. The dashboard binds loopback on `PM2_DASHBOARD_PORT` (3091) and nginx republishes it to the LAN on 3092; override `PM2_DASHBOARD_HOST` / `PM2_DASHBOARD_PORT` in the shell before `pm2 start`.
- `bun run vertix:flow:dev` / `vertix:website:dev` – boot the flow editor or marketing site; follow with `vertix:website:build` or `:preview` before release.
- `bun run vertix:jest` – run base, bot, and GUI suites in parallel; target a package via scripts like `vertix:bot:jest`.
- `bun run vertix:eslint` or `vertix:eslint:fix` – satisfy linting and auto-fix style issues.

## Coding Style & Naming Conventions
- TypeScript + ESM everywhere; import via workspace aliases like `@vertix.gg/bot/src/...` (guarded by `no-restricted-imports`).
- Default indent is 4 spaces; stylistic rules expect padded braces (`{ value }`), spaced arrays, and no space before function parentheses (`handler()`).
- Name files by feature (`emoji-manager.spec.ts`, `ui-language-definitions.ts`); services/classes stay PascalCase, functions camelCase, env constants UPPER_SNAKE.

## Stored Data Keys
- A data row is filed under `<model name>/<key>` — `ModelDataOwnerBase.normalizeUniqueKeys()` builds it that way — so a model's name is not only a label, it is the key its rows already live under in the database.
- **Spell a stored key as a literal string; never build one from `getName()`.** Deriving it couples the database to a class name, so a rename nobody thought was risky silently repoints every lookup at a key that has no rows: settings read as absent and fall back to defaults, which surfaces as "Could not find master template name in database" rather than as an error anyone can trace.
- Renaming a model therefore takes two changes, not one: the code, and a migration that carries the existing rows over. `scripts/migrate-data-model-keys.ts` does the carrying (dry run by default, `--apply` to write).
- The same goes for any other persisted identifier — a settings key, an IPC action, a cache namespace. They are storage contracts that outlive the code that wrote them.

## UI Entity Names
- Everything a UI entity's `getName()` returns — a flow, a state, a transition, a button, a modal, an input, an embeds or elements group — is **written out in full at every place it is used**. No local `const` aliasing one, and no building one from a shared prefix with a template literal.
- The literal is the only thing tying a use site back to the class that declares it. Spelled out, one search for `"VertixBot/UI-V3/DynamicChannelLimitModal"` finds the class, every adapter that binds it and every page that draws it. Behind an alias or a composed path it is invisible to that search, and an entity nobody can find every user of is one nobody can safely rename.
- Nothing catches a mistake here. These names cross a wire — the bot exports them as JSON and the website and dashboard look them up as strings — so a name that does not match resolves to nothing rather than failing: a guidance entry that never shows, a step whose modal never opens, a transition comparison that is quietly always false.
- `.cursor/rules/always-use-full-names.mdc` states the narrower half of this (flows, transitions, states). It applies to every `getName()` value.
- This does not contradict `never-do-hard-coded-stuff`. That rule is about values that encode behaviour — a limit, a timeout, a word list. An entity name is an identifier, and the full spelling is the point of it.

## UI Copy & Translations
- Any user-facing string in a UI entity (embed title/description/options, button label, select-menu placeholder) is snapshotted into `apps/vertix-bot/assets/languages/*.json` — **the snapshot wins at runtime**, so editing the code alone changes nothing users see.
- Changing such a string is three edits, not one: the code, the seven language files, then re-run the export.
- Export with the enforced command: `bun run vertix:bot:bun:start:dev --export-ui=<repo>/exports/ui`. It exits without connecting the bot. The website and dashboard render from `exports/ui`, so a stale export shows stale copy — and the exporter resolves through the language manager, so a wrong translation gets baked in too.
- Verify with `bun run vertix:languages:check`. It only checks that entity *names* exist in every locale — it will not catch a stale inner shape, a missing `options` branch, or a `selectOptions` entry whose `value` is absent. Select-menu options are matched by `value` and **fall back to position**, so inserting an option mid-list silently mislabels it.
- Emoji in translatable content use `EmojiManager.getToken()`, never `getMarkdown()`: an emoji id belongs to the application that exported it, and language files outlive any one application. In an embed, put the emoji in a template var resolved through `setDefaultVars()`.
- **Select-menu placeholders take unicode, not custom emoji.** Discord renders emoji in an embed, a button and a select *option*, but prints a placeholder's markdown verbatim — `<:Name:id> Select User`. The browser preview does render it, so it will look right on the site and wrong in Discord.

## Testing Guidelines
- Jest with `@swc/jest` powers unit/integration tests; specs live under `packages/*/test` and must keep the `*.spec.ts` suffix enforced by each `jest.config.ts`.
- Reuse `test/__setup__.ts`, reset ServiceLocator state, and lean on `vertix-test-utils` or `ts-mockito` for doubles.
- New commands, services, or adapters need positive and failure-path coverage before `bun run vertix:jest` (mirrors `scripts/ci-jest.bash`).

## Commit & Pull Request Guidelines
- Follow the current log style: short imperative subjects with optional scope (`Enhance adapter builders`, `Refactor: streamline embed logic`). Prefix `Refactor:`, `Fix:`, or `Feat:` as needed.
- Squash WIP commits and reference related issues or Discord tickets in the body.
- PRs must state affected packages, schema/env updates, screenshots for GUI/website work, and the commands you ran (`vertix:jest`, `vertix:eslint`).

## Configuration & Security Notes
- The bot loads secrets via `dotenv`; keep `.env*` files local, exclude tokens or Prisma URLs from commits, and prefer `scripts/backup-bot-prisma.js` for encrypted backups.
- Test Discord flows in isolated guilds and avoid posting invite links or member IDs in public trackers.

## Cursor rules
please read @.cursor/rules and apply those rules

# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by Bun workspaces; all runtime, UI, and tooling code lives under `packages/*`.
- Highlights: `vertix-bot` (Discord runtime), `vertix-base` / `vertix-utils` / `vertix-test-utils` (shared core + mocks), `vertix-gui` and `vertix-flow` (configuration UI), `vertix-website` (marketing site), `vertix-prisma` (database clients).
- Supporting dirs: `docs/` (references), `assets/` (shared imagery), `scripts/` (`ci-jest.bash`, `backup-bot-prisma.js`, etc.).

## Build, Test & Development Commands
- `bun install` – refresh workspace dependencies after cloning or adding packages.
- `bun run vertix:bot:bun:start:dev` – start the Discord bot with Bun hot reload (`vertix:bot:node:start:dev` uses ts-node).
- `bun run vertix:flow:dev` / `vertix:website:dev` – boot the flow editor or marketing site; follow with `vertix:website:build` or `:preview` before release.
- `bun run vertix:jest` – run base, bot, and GUI suites in parallel; target a package via scripts like `vertix:bot:jest`.
- `bun run vertix:eslint` or `vertix:eslint:fix` – satisfy linting and auto-fix style issues.

## Coding Style & Naming Conventions
- TypeScript + ESM everywhere; import via workspace aliases like `@vertix.gg/bot/src/...` (guarded by `no-restricted-imports`).
- Default indent is 4 spaces; stylistic rules expect padded braces (`{ value }`), spaced arrays, and no space before function parentheses (`handler()`).
- Name files by feature (`emoji-manager.spec.ts`, `ui-language-definitions.ts`); services/classes stay PascalCase, functions camelCase, env constants UPPER_SNAKE.

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

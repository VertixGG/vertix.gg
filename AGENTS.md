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

## Defaults, Stored Sets & Limits
- A stored settings row holds what a generator **was given**; the config `defaults` are what it **is given when nothing says otherwise**. Several call sites mean one while reading like the other, and the difference only shows up on a generator nobody has touched.
- `DynamicChannelElementsGroup.getAll()` is the catalogue — every button that exists. `getDefaults()` is the set a new generator starts with, and each button answers for itself through `isInDefaultSet()`. Pickers, label maps and the `N of M` count want the catalogue; the config default, the wizard's step 2 seed and its fallbacks want the defaults. Resolving a *stored* set back into buttons wants the catalogue too — defaults there would drop a button somebody deliberately enabled.
- **The wizard's seeded set is what gets saved.** `setup-new-wizard-adapter.ts` seeds step 2 and that seed is written on finish, so changing only the config default is invisible: the wizard writes a set containing the button, which then reads as curated and the default never applies to it again.
- **An untouched set is re-read as today's default.** `MasterChannelDataManager.getChannelButtonsTemplate()` maps a stored set matching `V2_DEFAULT_BUTTONS_BEFORE_LFM` onto the current default, so changing that default reaches every generator nobody curated, not only new ones. A set somebody saved carries its own ids and keeps them.
- **A guild settings row is merged over the defaults.** `GuildDataManager.getAllSettings()` answers `{ ...defaults, ...row }`, so a field added to the config after a guild's row was written is still answered from the default. It used to return the stored object whole, which is how a guild that had set one thing read as having set *nothing* for every field added afterwards — worth knowing, because code written against that behaviour was guarding for `undefined` on fields that now always arrive.
- **The dashboard refuses at the same allowance Discord does.** `management-service.getMaxMasterChannels()` asks the bot over IPC, and `management-ipc-service.getConfigLimits( guildId )` answers through `EntitlementService` — per guild, and including whatever tier that guild pays for. It answered one global number for every guild once, which is why a grant used to apply in Discord and not in the dashboard; `constants.masterChannelMaximumFreeChannels` no longer exists.
- **Unlimited crosses that wire as `null`.** The top tier's allowance is `Infinity`, `JSON.stringify( Infinity )` is `null`, so the conversion is made deliberately at the IPC seam rather than discovered on the other side. The reader treats `null` as nothing to hold anybody to, which is what unlimited means there. Anything else printing an allowance goes through `formatMasterChannelAllowance()`, because the one that does not is the one that shows somebody the word `Infinity`.

## UI Entity Names
- Everything a UI entity's `getName()` returns — a flow, a state, a transition, an execution step, a button, a modal, an input, an embeds or elements group — is **written out in full at every place it is used**. No local `const` aliasing one, no building one from a shared prefix with a template literal, and no object collecting several of them under short keys for another module to import. An exported `STEPS` map is the same mistake as a `const` alias, one import further away: the use site then reads `STEPS.SENT`, and the name it actually means appears nowhere near it.
- The literal is the only thing tying a use site back to the class that declares it. Spelled out, one search for `"VertixBot/UI-V3/DynamicChannelLimitModal"` finds the class, every adapter that binds it and every page that draws it. Behind an alias or a composed path it is invisible to that search, and an entity nobody can find every user of is one nobody can safely rename.
- Nothing catches a mistake here. These names cross a wire — the bot exports them as JSON and the website and dashboard look them up as strings — so a name that does not match resolves to nothing rather than failing: a guidance entry that never shows, a step whose modal never opens, a transition comparison that is quietly always false.
- `.cursor/rules/always-use-full-names.mdc` states the narrower half of this (flows, transitions, states). It applies to every `getName()` value.
- This does not contradict `never-do-hard-coded-stuff`. That rule is about values that encode behaviour — a limit, a timeout, a word list. An entity name is an identifier, and the full spelling is the point of it.

## UI Copy & Translations
- Any user-facing string in a UI entity (embed title/description/options, button label, select-menu placeholder) is snapshotted into `apps/vertix-bot/assets/languages/*.json` — **the snapshot wins at runtime**, so editing the code alone changes nothing users see.
- Changing such a string is three edits, not one: the code, the seven language files, then re-run the export.
- Export with the enforced command: `bun run vertix:bot:bun:start:dev --export-ui=<repo>/exports/ui`. It exits without connecting the bot. The website and dashboard render from `exports/ui`, so a stale export shows stale copy — and the exporter resolves through the language manager, so a wrong translation gets baked in too.
- Select-menu options are matched by `value` and **fall back to position**, so inserting an option mid-list silently mislabels it — and every option below it. This is how an added button once drew as the name of the one under it, in all seven locales at once.
- Verify with `bun run vertix:languages:check`. It checks that entity *names* exist in every locale, and compares each baked menu's options — how many, and which values — against `exports/ui` and then each locale against en. It still cannot see a stale inner shape or a missing `options` branch, and it lists rather than fails the menus whose baked options carry no `value` at all, since those are the ones position is still deciding.
- **In that list, read which locales it names.** "Matched by position" is a finding, not noise, and which locales appear is the whole diagnosis. Naming the other six but never `en` means those six are missing a `value` the English file has, so the runtime pairs their options by position and inserting one relabels everything below it — in six locales, silently. Naming `en` as well means the bake itself carries no values and there is nothing to compare against. A check merely being cautious would name every locale equally, so an asymmetric list is the bug rather than the caveat. `ConfigExtrasSelectMenu` and `VerifiedRolesEveryoneSelectMenu` sat like that while seventeen of the nineteen menus with options carried values everywhere — an omission, not a convention. Repair it from `en` by **matching the label, not the position**: the labels are template variables and identical across locales, and fixing a positional bug positionally is how it comes back.
- Rewriting a language file programmatically: round-trip it first. `json.dumps( data, ensure_ascii = False, indent = 2 )` reproduces these files byte for byte — **with no trailing newline**, which none of the seven has. Any other indent reformats all seven thousand lines and buries the actual change in the diff, and an added `"\n"` moves the last line of every file for the same reason. Assert the round-trip before writing rather than trusting this line.
- Emoji in translatable content use `EmojiManager.getToken()`, never `getMarkdown()`: an emoji id belongs to the application that exported it, and language files outlive any one application. In an embed, put the emoji in a template var resolved through `setDefaultVars()`.
- **Select-menu placeholders take unicode, not custom emoji.** Discord renders emoji in an embed, a button and a select *option*, but prints a placeholder's markdown verbatim — `<:Name:id> Select User`. The browser preview does render it, so it will look right on the site and wrong in Discord.

## Before Fixing, Prove It Can Happen
- **A failing test is not by itself a bug.** A spec that drives a manager directly can build states the product cannot reach. `DynamicChannelVoteManager` will record a vote for somebody who never registered — but the only button that casts one is generated from the candidate list (`claim-vote-adapter.ts` fills `candidateDisplayNames` from `Object.keys( getResults() )`), so no user can.
- Before fixing, trace the path from the interaction down to the function: grep the method, read the one or two call sites, and check what the UI actually offers. `DynamicChannelVoteManager.$.start()` has a single caller, and the line after it enters the initiator as a candidate — which is what made "the initiator wins with no votes" unreachable, and the guard against it dead code.
- If nothing can produce the state, the fix is speculative edge-handling — `.cursor/rules/avoid-predictive-edge-handle-logic.mdc` — and the test pins fiction. Keep the test if the behaviour is worth stating, but start it where the product starts it.
- Reproductions belong in the existing spec for the thing they test, under the describe that owns the function, not in a new `*-repro.spec.ts` beside it. A second file duplicates the harness, and the name stops being true the moment the bug is fixed.
- Fixture state has to be the state the product leaves behind. The vote unit tests fabricate an event and had omitted its required `timings`, so anything calling `addCandidate` threw instead of asserting — which is why that path had never been covered at all.

## Testing Guidelines
- Jest with `@swc/jest` powers unit/integration tests; specs live under each package's own `test/` and must keep the `*.spec.ts` suffix enforced by each `jest.config.ts`.
- **A spec's path mirrors its subject's path.** `test/` stands where `src/` stands, so the test for `src/ui/general/channel-gone/channel-gone-gate.ts` is `test/ui/general/channel-gone/channel-gone-gate.spec.ts`, and the file is named after the module it covers - a suffix (`ui-adapter-base-cleanup`) only when a second spec covers the same one. A test belongs to the package whose code it exercises, not to whoever happened to write it: a bot spec that only calls `@vertix.gg/base` code is a base spec.
- Things that are not mirrors of a source file go in `test/__test_utils__/` (harnesses, fixtures, casts), and `test/__setup__.ts` stays at the root.
- Resolve paths inside a spec from `process.cwd()`, which jest sets to the package root - never by counting directories up from `import.meta.url`, which goes stale the moment the spec moves.
- Reuse `test/__setup__.ts`, reset ServiceLocator state, and lean on `vertix-test-utils` or `ts-mockito` for doubles.
- New commands, services, or adapters need positive and failure-path coverage before `bun run vertix:jest` (mirrors `scripts/ci-jest.bash`). A package that gains its first spec needs a `jest.config.ts`, a `test/tsconfig.json`, a `<name>:jest` script and a line in both of those runners - otherwise it passes by never running.

## Commit & Pull Request Guidelines
- **Never run `git commit` or `git push` without explicit approval for that specific change.** Show what would be staged and wait for a yes. Approval for one commit is not approval for the next one, and "the work is finished" is not approval to commit it.
- Stage only the files belonging to the change you were asked to make; leave unrelated work in the tree alone rather than sweeping it into the commit.
- Follow the current log style: short imperative subjects with optional scope (`Enhance adapter builders`, `Refactor: streamline embed logic`). Prefix `Refactor:`, `Fix:`, or `Feat:` as needed.
- Squash WIP commits and reference related issues or Discord tickets in the body.
- PRs must state affected packages, schema/env updates, screenshots for GUI/website work, and the commands you ran (`vertix:jest`, `vertix:eslint`).

## Running Instances
- Two bots run against the **same database**: `VoiceChannels` is production on the box (`pm2`, `vertix-bot`), and `TestVC` is the maintainer's local checkout. Identical data, different code.
- So a screenshot from `TestVC` proves nothing about what is deployed, and reading the database proves nothing about which code produced the screenshot. Establish which bot a report came from before diagnosing: a local instance can be behind the box by any number of commits while every row you query looks correct.
- When behaviour and stored data disagree, check `git log -1` on the box against the commit that introduced the behaviour, and ask which bot was in the screenshot, before going further into the code.

## Configuration & Security Notes
- The bot loads secrets via `dotenv`; keep `.env*` files local, exclude tokens or Prisma URLs from commits, and prefer `scripts/backup-bot-prisma.js` for encrypted backups.
- Test Discord flows in isolated guilds and avoid posting invite links or member IDs in public trackers.

## Cursor rules
please read @.cursor/rules and apply those rules

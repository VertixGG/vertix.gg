# @vertix.gg/bot-e2e

End-to-end tests for `vertix-bot`, driven through the real Discord web client with Playwright.

There are no mocks here. A test types a slash command into Discord, presses the buttons the bot drew,
fills the modals it opened, and then asks Discord what actually happened to the channel. If it passes,
a member could have done the same thing by hand.

## What it covers

| Area | What runs |
|---|---|
| `commands` | all 25 commands, read out of `commands/definitions` rather than listed - `/voice` three times over: with no channel, owning a v3 one, and owning a v2 one |
| `dynamic-channel` | join → channel created → panel drawn → rename, limit, status, privacy, region, access, templates, transfer, invite, clear chat, reset, primary message → leave → channel removed, on both the v3 and the v2 interface |
| `setup` | the hub, both wizards, editing a generator, server roles, bad words, language |
| `claim` | the button, the command's refusal, and - with a second member - a channel being abandoned and claimed |
| `scaling` | a scaling generator, and being routed into a numbered room |
| `dom-contract` | the Discord markup the rest of the suite depends on |
| `catalog` | every entity name the suite spells out still exists in the bot - no browser, half a second |

A command added to the definitions is covered on the next run without this package being touched. So
is a button added to the control panel.

## Before the first run

1. Fill the `E2E_` block in `.env` - it is documented in `example.env`.

   The guild is named twice on purpose. **The suite deletes every generator in the guild at the start
   of a run**, and it refuses to start unless `E2E_DISCORD_GUILD_ID` and `E2E_DISCORD_DESTRUCTIVE_GUILD_ID`
   name the same one. Point them at a guild you would not mind emptying.

   `E2E_DISCORD_APP_NAME` is the name Discord shows beside each row in the slash-command autocomplete.
   It is not decoration: a guild with other voice-channel bots in it offers four `/help` rows, and
   this is what picks ours.

2. Sign in once (the browser Playwright drives is downloaded on the way, once, ~280MB into
   `~/Library/Caches/ms-playwright`):

   ```bash
   bun run vertix:bot:e2e:login
   ```

   To download it on its own: `bun run vertix:bot:e2e:install`.

   **Sign in as an account that can configure the test guild** - Manage Server, Manage Channels and
   Manage Roles, or the guild's owner. Every test builds its generator through `/manage new-generator`,
   and Discord hides a command from anyone who may not run it, so a plain member gets an empty
   autocomplete rather than a refusal. `auth.setup.ts` checks this up front and says so.

   A browser opens on the Discord login page. **You sign in** - password, two-factor, any captcha. The
   suite never types credentials and never answers a captcha. The session is saved to
   `.e2e/auth/discord-state.json` and reused until Discord stops accepting it.

3. Run it:

   ```bash
   bun run vertix:bot:e2e
   ```

   A single area, while working on one:

   ```bash
   cd packages/vertix-bot-e2e && bunx playwright test --project=dynamic-channel
   ```

   Watch it happen: `E2E_HEADLESS=0`, and `E2E_SLOW_MOTION_MS=250` to slow it down.

   The report afterwards: `bun run vertix:bot:e2e:report`.

## When the session expires

A scheduled run that finds a dead session stops at the first project with instructions rather than
trying to get past the login page on its own - `E2E_INTERACTIVE_LOGIN` is off when `CI` is set,
precisely so that a machine nobody is watching fails loudly instead of hanging on a password field.
Somebody runs `vertix:bot:e2e:login` and the next run goes green.

## How it is put together

| | |
|---|---|
| `src/config` | environment, the two-key guild interlock, the timeouts |
| `src/catalog` | what the bot says it has, generated before every run |
| `src/discord` | the client: selectors, messages, commands, modals, voice, the rest api |
| `src/vertix` | the bot's own ideas: a generator, a dynamic channel, a screen |
| `scripts` | the two things that run under bun rather than playwright |
| `tests` | one directory per area, one playwright project each |

### The catalog

`scripts/dump-bot-catalog.ts` runs before every suite and writes `.e2e/catalog/bot-catalog.json` from
three places in the bot:

- **the commands**, from `commands/definitions` - so the command tests are loops over what exists;
- **the panel's buttons**, from the button classes themselves. The panel draws emoji and no labels, and
  a button's `getBaseName()` is the emoji name, which is the only thing in the rendered message that
  says which button it is;
- **every string a member reads**, from `apps/vertix-bot/assets/languages/en.json`. That snapshot is
  what wins at runtime, so it is the only honest thing to assert against - a title changed in code and
  not in the language files would still read the old way in Discord, and these tests would say so.

Nothing in `tests/` restates a label, a placeholder or an embed title.

### Two things run under bun, not Playwright

`dump-bot-catalog.ts` and `reset-test-guild.ts` import from the bot and from `@vertix.gg/prisma`, which
are built for Bun's workspace resolution. They are spawned as subprocesses so Playwright never has to
load them.

### Isolation, and what Discord will let you have

Discord rate-limits creating and deleting channels hard enough to decide this suite's shape. Emptying
the guild and running the wizard costs six channel operations before anyone has joined anything; a
hundred tests of that gets the bot told it may not create channels at all, which it reports - correctly
- as *"your channel could not be created"*.

So isolation is spent where it buys something:

| | scope | why |
|---|---|---|
| the guild | emptied once per run | configuration, not state |
| a generator | built once per spec file, shared by its tests | no test mutates the one it is handed |
| a dynamic channel | per test | this is the thing tests actually change |

A test that genuinely needs an empty guild - the wizard's, the hub's first-run screen, the scaling ones
- asks for the `emptyGuild` fixture and pays for it.

A dynamic channel costs one create and one delete, and the delete is free in the sense that it happens
anyway: **leaving a dynamic channel deletes it**, because its last member left.

### The reset

Once per run, in global setup, `reset-test-guild.ts`:

1. asks the database which voice channels in the guild are generators - the only authority on that;
2. deletes them in Discord, which is the supported way to remove one: the bot hears `channelDelete`,
   removes every dynamic channel it made and drops its own row;
3. waits for the database to agree, and **fails loudly if it never does** rather than tidying the rows
   itself. A row the bot failed to clean up is a finding, not a mess to sweep up. It usually means the
   bot is not running;
4. removes what is left of the categories those generators lived in.

It does not touch guild settings. The one test that changes a guild setting - language - puts it back.

### Effects are checked against Discord, not the sidebar

The browser is how the bot is driven; it is a poor witness to what the bot did. A rename shows up in
the channel's own record immediately and in the sidebar eventually, so `src/discord/guild-state.ts`
asks Discord's API what the channel looks like now. The embed the member reads is asserted too - both
claims matter, but only one of them is the bot having worked.

## The second member

A handful of features need two people, because the bot is reacting to two of them rather than to one
person twice: a claim opens only when the owner leaves a channel somebody else is still in, a knock is
a request the owner answers, a transfer needs a recipient.

Sign a second account in once:

```bash
bun run vertix:bot:e2e:login:second
```

It saves to `.e2e/auth/discord-state-second.json` and is used by a second browser client that shares
the run. Everything that needs it **skips with a reason when it is absent**, so the rest of the suite
still runs on one account and nobody is forced to keep two.

The claim test lowers the guild's claim timings through the settings screen before it starts - left at
their defaults the bot waits ten minutes before offering a channel and sweeps once a minute, which no
test can sit through.

## What it still cannot do

- **A non-admin caller.** The admin gate on `/manage` is Discord's own, and seeing it refuse needs an
  account without those permissions - the second member has them, because it needs them elsewhere.
- **A channel that disappears mid-interaction** (`ChannelGoneAdapter`), which is a race rather than a
  flow.

## When Discord changes its markup

Discord ships hashed class names and moves its DOM without notice. Everything the suite assumes about
it is in one file, `src/discord/discord-dom.ts`, and `tests/dom-contract.spec.ts` runs first and names
the selector that broke - so a change there is one line of output rather than a morning of reading
traces from twenty unrelated failures.

## Cost of a run

Tests are tens of seconds rather than seconds - a slash command, a bot round trip, sometimes a voice
connection - and the suite runs one at a time on one account. It is built for a nightly run, not for a
watch loop. While working on one feature, run its project alone.

If a run does hit the channel limit, the symptom is unmistakable: the bot answers **"Your channel could
not be created"** and says the server reached one of Discord's limits. Wait it out rather than
retrying; the limit is per guild and retrying spends what is left of it.

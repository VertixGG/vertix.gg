# Slash commands spec

> **Status: built.** Every row below is settled and in the working tree — 24 commands across
> `/setup`, `/help`, `/welcome`, `/voice` and `/manage`. Nothing is committed. Where a row turned out
> to be wrong once the code was read, the row says so and why.

> **How an interaction actually reaches a feature — both by command and by button — is
> `spec/interactions-spec.md`.** This file is about *which* commands exist. That one is about *how*
> any of them work, and is the place to read before adding one.

## What exists today

Four commands, all registered globally in `apps/vertix-bot/src/services/app-service.ts`
and dispatched by a flat name lookup in `apps/vertix-bot/src/listeners/interaction-handler.ts`.

| Command | Opens | Gate |
|---|---|---|
| `/setup` | `VertixBot/UI-General/SetupAdapter` | ManageGuild + ManageChannels + ManageRoles |
| `/help` | `VertixBot/UI-General/FeedbackAdapter` | ManageGuild + ManageChannels + ManageRoles |
| `/welcome` | `VertixBot/UI-General/WelcomeAdapter` | ManageGuild + ManageChannels + ManageRoles — kept, see `G-02` |
| `/ping` | — file is empty, not registered | — |

Two defects fall out of that table before any new command is added:

- **`/help` opens the feedback adapter.** Either the name or the target is wrong.
  **Settled**: it was the target. `/help` has a screen of its own now.
- **`/help` and `/welcome` are admin-gated.** A member who cannot manage the guild cannot
  read the help. Every user-facing command below is therefore specified with no Discord
  permission requirement.

  **Settled, differently for each.** `/help` is ungated and its screen asks the server for
  nothing at all. `/welcome` stays admin: it is the screen a server sees when the bot joins and
  it ends in a Setup button, so it is the front of configuration rather than a description of
  the bot - which is what `/help` is now for. The original reading of `G-02` was that the two
  were the same kind of thing; they are not.

## The taxonomy

Two groups, split by *who the command is for* — the member using a voice channel, or the admin
configuring the server.

| Group | For | Rows |
|---|---|---|
| `/voice …` | anyone using a dynamic voice channel | 15 |
| `/manage …` | server admins | 9 |

Subcommands rather than 24 top-level names, for two reasons: `/status`, `/limit` and `/invite`
as top-level names collide with most other bots in a server; and Discord's autocomplete on
`/voice ` lists every subcommand with its description, which is the discoverability a flat list
is reaching for anyway. Discord's ceiling is 25 subcommands per command — the larger group has 15.

### Gating is per row, not per group

`/voice` holds both "do this to the channel you own" and "ask something of a channel you do not
own", so there is no single gate for the group. Three tiers, and the bot already enforces exactly
these on the control-panel buttons — so the command tree inherits an authorization model that is
written and tested rather than inventing a second one:

| Tier | Meaning | Enforced by |
|---|---|---|
| **owner** | caller must own the voice channel they are standing in | `dynamicChannelRequirements()` |
| **any** | anyone in the server | the entity's own handler — registered via `registerSelfGatedEntity()` |
| **in-channel** | anyone, but only from inside the channel | `answerClaimPressedFromControlPanel()` |
| **admin** | `DEFAULT_SETUP_PERMISSIONS` | Discord's own `defaultMemberPermissions` |

Each row below carries its tier. A subcommand that gets the tier wrong is the one bug class that
matters here, so the tier column is the column to review hardest.

---

## Group 1 — `/voice`

`dynamicChannelRequirements()` already resolves the caller's voice channel from
`member.voice.channel` when the command is run from a text channel, and already answers with
`NoActiveDynamicChannelAdapter` / `NotYourChannelAdapter` — so the **owner** rows need no new
failure UI.

| # | Command | Tier | Adapter (v3) | Direct args (Shape B only) |
|---|---|---|---|---|
| V-01 | `/voice rename` | owner | `DynamicChannelRenameAdapter` | `name:` |
| V-02 | `/voice limit` | owner | `DynamicChannelLimitAdapter` | `count:` |
| V-03 | `/voice privacy` | owner | `DynamicChannelPrivacyAdapter` | `state:` public\|private\|hidden |
| V-04 | `/voice status` | owner | `DynamicChannelStatusAdapter` | `text:` |
| V-05 | `/voice access` | owner | `DynamicChannelPermissionsAdapter` | `user:` `action:` grant\|deny\|kick |
| V-06 | `/voice invite` | any | `DynamicChannelInviteAdapter` | `user:` |
| V-07 | `/voice knock` | any | `DynamicChannelKnockAdapter` | `channel:` |
| V-08 | `/voice claim` | in-channel | `ClaimStartAdapter` — points, does not act | — |
| V-09 | `/voice transfer` | owner | `DynamicChannelTransferOwnerAdapter` | `user:` |
| V-10 | `/voice region` | owner | `DynamicChannelRegionAdapter` | `region:` |
| V-11 | `/voice templates` | owner | `DynamicChannelTemplatesAdapter` | `name:` |
| V-12 | `/voice message` | owner | `DynamicChannelPrimaryMessageEditAdapter` | `text:` |
| V-13 | `/voice reset` | owner | `DynamicChannelResetChannelAdapter` | — |
| V-14 | `/voice clear-chat` | owner | `DynamicChannelClearChatAdapter` | — |
| V-15 | `/voice panel` | owner | `DynamicChannelAdapter` | — |

Rows V-06 to V-08 are the three that are *not* owner-gated — `invite` and `knock` are registered
self-gated entities, `claim` is gated to inside the channel. They are the reason the group cannot
carry one gate.

### V-08 `claim` is the one row that cannot be Shape A

Every other row opens an adapter. Claiming does not. The button's handler in
`dynamic-channel-adapter.ts` fetches the claim message that `ClaimStartAdapter` already sent into
the channel when the owner left, reads the vote state off `DynamicChannelVoteManager`, and hands
both to `DynamicChannelClaimManager.handleVoteRequest()`. Opening `ClaimStartAdapter` ephemerally
would instead show one member a private copy of the "this channel is claimable" panel and start
nothing at all — and when the owner has not left there is no claim message to act on either.

So V-08 needs a handler that mirrors that logic rather than a line in a definitions table.

**The forty-line estimate above was wrong**, and it was wrong in a way that changes the decision.
Reading `handleVoteRequest()` and `handleVoteRequestIdleState()` through: the claim vote is driven
by *editing the message the claim button sits on*. The manager calls `interaction.deferUpdate()` —
which exists on a button press and not on a command — reads `interaction.message` for the message
to edit, reads `interaction.customId`, and hands the interaction itself to
`DynamicChannelVoteManager.addCandidate()` as the vote candidate. Its parameter type,
`IVoteDefaultComponentInteraction`, extends `MessageComponentInteraction`, which a
`CommandInteraction` can never satisfy without a cast the rules forbid.

A command has no message to edit and no `deferUpdate()`. Making one work means widening the
interaction type through the vote manager, the claim manager, `voteTimer`, `addCandidate` and the
claim adapters — the most stateful, timer-driven part of the bot. That is its own commit and
probably its own spec section, not a line in this one.

**Decided: `b`.** `/voice claim` finds the claim message and answers with a link to it, or says the
channel is not up for claiming. Built in `runVoiceClaim()`, the one command in the set that opens
nothing.

The three that were on the table:

| | What `/voice claim` does | Cost |
|---|---|---|
| **a** | Cut the row. Claiming stays the button in the channel, which is the only place it happens today. | none |
| **b** | Point rather than act — find the claim message and answer with a jump link to it, or say the channel is not claimable right now. | small, no core changes |
| **c** | Widen the vote core so a command can drive a vote. | a refactor of the claim/vote machinery |

Option `c` remains the only way `/voice claim` could actually claim. It is not scheduled.

`b` also covers a gap the other two leave: the claim *button* is disabled when a channel is not
claimable, and a command cannot be disabled, so `/voice claim` needs an answer for that case no
matter which way this goes.

### V-15 `panel` now points at `DynamicChannelAdapter`

`DynamicChannelPanelAdapter` is a hidden variant sent *into* a panel channel beside a generator —
it is not something a member opens. What `/voice panel` plainly means is "give me my channel's
buttons", which is `DynamicChannelAdapter`, the same interface the channel's primary message
carries. Changed in the table above.

### v2 generators

A generator carries its own interface version in the database, and `UIMasterChannelVersionStrategy`
reads it off the voice channel. One guild can run v2 and v3 generators side by side, so `/voice` has
to work out which it is standing in — the rows above name v3 adapters, and opening a v3 interface
onto a v2 channel is not a thing that should happen.

The versioning service cannot be handed this on its own. It forms a versioned name by swapping the
`UI-Vn` segment and leaving the rest, which only works when the two versions name a feature
identically — and they do not: v2 has `DynamicChannelMetaRenameAdapter` where v3 has
`DynamicChannelRenameAdapter`, and `DynamicChannelPremiumResetChannelAdapter` where v3 has
`DynamicChannelResetChannelAdapter`.

**Decided: each row names its v2 adapter, where it has one.** An optional `adapterNameV2` on the
definition, and the bridge — which has already resolved the channel by the time it needs to choose —
picks by the generator's version. Seven of the thirteen have a v2 counterpart:

| Row | v2 adapter |
|---|---|
| V-01 `rename` | `VertixBot/UI-V2/DynamicChannelMetaRenameAdapter` |
| V-02 `limit` | `VertixBot/UI-V2/DynamicChannelMetaLimitAdapter` |
| V-04 `status` | `VertixBot/UI-V2/DynamicChannelMetaStatusAdapter` |
| V-05 `access` | `VertixBot/UI-V2/DynamicChannelPermissionsAdapter` |
| V-09 `transfer` | `VertixBot/UI-V2/DynamicChannelTransferOwnerAdapter` |
| V-13 `reset` | `VertixBot/UI-V2/DynamicChannelPremiumResetChannelAdapter` |
| V-14 `clear-chat` | `VertixBot/UI-V2/DynamicChannelMetaClearChatAdapter` |
| V-15 `panel` | `VertixBot/UI-V2/DynamicChannelAdapter` |

The remaining six — `privacy`, `invite`, `knock`, `region`, `templates`, `message` — are features v2
never had. On a v2 generator they answer rather than open.

It says so through `NoticeAdapter` — see below.

### v2 has a feature the spec has not placed

`DynamicChannelLfmAdapter` / `DynamicChannelLfmPostAdapter` — looking for members — exists in v2 with
no v3 counterpart, and appears in neither group above. Left out deliberately rather than missed; it
needs its own row if it is to be reachable by command.

## Group 2 — `/manage`

Tier: **admin** on every row, as today.

| # | Command | Adapter |
|---|---|---|
| M-01 | `/manage setup` | `SetupNewWizardAdapter` |
| M-02 | `/manage edit` | `SetupEditAdapter` |
| M-03 | `/manage scaling` | `ScalingSetupEditAdapter` |
| M-04 | `/manage roles` | `SetupAdapter`, opened at `SetupServerOptions` |
| M-05 | `/manage badwords` | `SetupAdapter`, opened at `SetupBadwords` |
| M-06 | `/manage language` | `LanguageAdapter` |
| ~~M-07~~ | ~~`/manage agent`~~ | **removed — the feature is gone, see below** |
| ~~M-08~~ | ~~`/manage buttons`~~ | **cut — see below** |
| ~~M-09~~ | ~~`/manage logs`~~ | **cut — see below** |

Adapters holding more than one screen are opened at the screen the command means, via
`ephemeralWithStep()`. `roles` and `badwords` use it; nothing else needs to.

No row names a v2 adapter. These are about the server rather than any one channel, so there is no
channel to read a version off — the setup interfaces ask which generator is meant and deal with its
version themselves.

### `agent` is gone, and so is what it opened

`/manage agent` sent a message as the bot, through `AIAgentAdapter`. The row and the interface behind
it are both removed - `apps/vertix-bot/src/ui/general/ai-agent/` in full, nine files, and its entry
in the general module.

Nothing else in the code referred to it. The AI managers and services - `agent-manager`,
`ai-prompt-ipc-service` - never touched this interface, and the `vertix-ai` app only named it in a
comment, which now says the same thing without pointing at it.

Two generated files still carry its names and will stop doing so on the next UI export:
`apps/vertix-api/ui-hash-tables.json` and `apps/vertix-bot/assets/languages/*.json`, which snapshot
UI content when it runs. Neither was hand-edited.

### `buttons` and `logs` are cut

The earlier note here said all four of these were branches of `SetupEditAdapter` reachable by
deep-link. That was wrong on both counts. `badwords` and `logs` are not in `SetupEditAdapter` at all
— they are in `SetupAdapter`, a different interface. And only two of the four are screens:

| | Where it lives | Openable? |
|---|---|---|
| `roles` | `SetupAdapter` state `ServerOptions` | yes — a screen |
| `badwords` | `SetupAdapter` state `ServerOptionsBadwords` | yes — a screen |
| `buttons` | a value in `SetupEditSelectEditOptionMenu` | no — a menu choice |
| `logs` | a value in `ConfigExtrasSelectMenu` | no — a menu choice |

A menu choice is not a screen and there is nothing to open at it. `/manage buttons` and
`/manage logs` could only open the interface that contains the menu — which is what `/manage edit`
and `/manage setup` already do, so the rows would add a second name for a thing that already has
one. Cut rather than duplicated. They become possible if those two branches are ever given screens
of their own.

`roles` also absorbs what were three separate things in the earlier table: verified roles, staff
roles and the voice role are all on the `ServerOptions` screen, so one row reaches all three.

## Group 3 — ungrouped, stays flat

| # | Command | Adapter | Change |
|---|---|---|---|
| G-01 | `/help` | ~~`FeedbackAdapter`~~ → `VertixBot/UI-General/HelpAdapter` | **done** — its own screen, no gate, and nothing on it the bot must hold a permission to draw |
| G-02 | `/welcome` | `VertixBot/UI-General/WelcomeAdapter` | **done, reversed** — declared `ADMIN` rather than ungated; see above |
| ~~G-03~~ | ~~`/ping`~~ | **done** — the file was empty and registered nowhere; deleted |
| G-04 | `/setup` | `SetupAdapter` | **done** — kept, and kept pointed where it was |

`/setup` would otherwise disappear as a top-level name, and a server that has taught its admins to
type it would find nothing. `G-04` keeps it.

**It is not the alias this row first called for.** That wording assumed `/manage setup` had replaced
`/setup`, and it has not — the two open different interfaces. `SetupAdapter` is the hub: it shows the
master channel, badwords, voice role, verified roles and staff roles at once, with a way through to
each. `SetupNewWizardAdapter`, which `M-01` opens, is a three-step wizard that creates one new
generator. Repointing `/setup` at the wizard would take the command servers already know and drop
whoever typed it into the middle of a single task — a regression wearing an alias's clothes.

So `/setup` keeps what it opens, and `/manage` holds the narrower rows. The hub has no `/manage` row
of its own: `M-04` and `M-05` open it at a screen, never at its front. If `/manage` should be able to
reach it whole, that is a row this spec does not yet have.

The three standalone descriptions were also rewritten. They described themselves rather than what
they do — "Displaying VoiceChannels setup wizard in ephemeral mode." is a sentence about the
implementation, and it is what a member reads in the command list.

---

## What a command says when it opens nothing

Four answers are not an interface: the generator's interface has no such feature, the channel is
not up for claiming, here is where the claim is, and you are not an admin. Written first as plain
ephemeral replies, which made them the only things the bot says that were not embeds.

They now open a notice adapter built by `createNotice()`, asked of the ui service by name and
shown with `ephemeral()` — the same two lines every gate in the bot uses to say one thing. A wrapper
around that pair existed for a while and is gone: it hid the one call that matters behind a name
that claimed the notices were a command's business, when a press raises them just as often.

**Each notice is its own embed with its own words, and that is the whole point.** The first attempt
here was a single generic embed taking a title and description as arguments, which read as the more
reusable thing and quietly broke translation: `getTranslatableContent()` runs at start-up with no
arguments, so what reached `assets/languages/*.json` was the literal strings `{title}` and
`{description}` — the sentences never entered the system and no translator could ever see them.

What is shared is the scaffolding, not the words. `createNotice()` applies the brand
thumbnail and colour and builds the embed, component and adapter, so a new notice is a name, a title
and a description. Values that cannot be known until the command runs — the link in
`ClaimOpen` — stay variables inside an otherwise literal sentence, the way `NotYourChannelEmbed`
carries `<#{masterChannelId}>`.

| Notice | Says |
|---|---|
| `NoticeFeatureMissingInV2` | the generator's interface has no such feature |
| `NoticeMissingAdminPermissions` | the caller is not an admin |
| `NoticeNotClaimable` | no claim is open on this channel |
| `NoticeClaimOpen` | where the claim is |

The colour is the brand colour on all four rather than chosen per notice, because an `EmbedBuilder`
handler is passed the template variables and not the resolved arguments, so a colour handler has
nothing to branch on. A refusal and a pointer look alike and the words carry the difference.

Covered by `test/ui/general/notice-embeds.spec.ts`, which asserts against the regression
directly: every notice offers a real sentence to `getTranslatableContent()` rather than a template
variable, the brand does not depend on the caller, and the claim link resolves into its sentence.

## The one fork that decides the size of this

Every feature's real work currently sits inside a modal or select-menu handler bound to the
adapter — `DynamicChannelRenameAdapter` puts the rename behind `bindModal`. So:

**Shape A — the command opens the UI.** `/voice rename` opens the same modal the button opens.
About ten lines per command, no handler logic touched, no duplication. The trade is that the
command is a shortcut to a panel, not a way to type `/voice rename name:Lobby` in one go.

**Shape B — the command also takes direct arguments.** `/voice rename name:Lobby` renames in one
shot. Every such command must reach the work the modal handler reaches, which means that handler
has to be lifted out of the adapter into something both entry points call. That is real
refactoring per feature, and `.cursor/rules` is explicit that the shared rule gets written once
rather than copied — so a quick duplicate is not on the table.

Shape A is roughly a day. Shape B is roughly a week and touches every adapter.

**Decided: Shape A, every row.** The `Direct args` column in Group 1 is therefore not being built
now. It stays in the table because Shape B, if it ever happens, would apply to V-01 `rename`,
V-02 `limit`, V-03 `privacy` and V-04 `status` and to nothing else — the rest are menus and
pickers where a modal is the better UI and a direct argument buys nothing.

## What has to move for any of this

1. **A shared command→adapter bridge.** The dynamic-channel adapters are typed to
   `UIDefaultButtonChannelVoiceInteraction` and read `interaction.channel` as a `VoiceChannel`.
   A `CommandInteraction` is neither. The machinery to fix this already exists —
   `hydrateInteractionChannel()` rewrites `interaction.channel` to the resolved dynamic channel,
   and `UIAdapterReplyContext` already includes `CommandInteraction<"cached">` — but it is
   reached only from the button path. One helper, written once, that resolves the caller's voice
   channel, hydrates it onto the command interaction and calls `ephemeral()`. **This is the first
   commit and everything else depends on it.**
2. **The per-row tier needs somewhere to live.** With `/voice` mixing tiers, the subcommand
   definition carries its tier and the bridge applies it before dispatch — so a new subcommand
   cannot be added without stating who may run it.
3. **`CommandsFlow` grows in lockstep.** `getFlowTransitions()` and `getNextStates()` in
   `apps/vertix-bot/src/ui/general/flows/commands-flow.ts` are a hand-maintained routing table.
   Twenty-four new commands means twenty-four pairs of entries, or the file learns to derive them
   from the command definitions. I would derive them.
4. **Registration is global and unchanged** — `client.application.commands.set()` already takes
   whatever `Commands` holds, subcommands included. Nothing to do.

---

## How we work through this

Verdicts are given per row, in one message, using the row ids — `yes`, `no`, `<new name>` or
`cut`. Anything not mentioned keeps what this file says. That is how the tables above were
settled, and it is how any later change to them gets made.

Build order, one commit per step, each reviewable on its own:

1. ~~the bridge helper + tier plumbing + `CommandsFlow` derivation~~ — **done**, no new commands
2. ~~`/voice`~~ — **done**, all 15 rows registered
3. ~~`/manage`~~ — **done**, 7 rows
4. ~~Group 3~~ — **done**: `/help` ungated and given its own adapter (`G-01`), `/welcome`
   declared `ADMIN` instead (`G-02`), `/ping` deleted (`G-03`), `/setup` kept as it was (`G-04`)

Every row in this spec is now settled. What is left is written up rather than scheduled: the setup
hub has no `/manage` row, `LFM` has no row at all, and `/voice claim` can point at a claim but not
join one.

After each commit I say what landed and what the next one touches. If a row turns out to be wrong
mid-build I stop at that row and come back here rather than guessing.

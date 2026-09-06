# TempVoice gap analysis

Comparison of Vertix.gg against [TempVoice](https://easy.tempvoice.xyz/), 2026-09-06.

Method: every page of their public documentation (~70 pages, 143 distinct capabilities) read and
extracted, mapped against this codebase, then put through an adversarial pass that re-checked each
"we lack X" claim against the working tree. Several first-pass findings did not survive that pass
and are recorded in [Not gaps](#not-gaps) rather than dropped.

Each finding carries a confidence marker:

- **verified** - checked directly against the code while writing this document, line references below
- **reported** - came out of the analysis and is consistent with the code, but was not re-checked by hand

---

## Summary

We are not far behind on owner-facing capability. The panel already covers rename, user limit,
access, privacy, region, reset, transfer and claim, and three things we have are things TempVoice
either lacks or charges for: channel templates, vote-based claim, and per-role button sets.

The largest wins available are not features to build. They are defects in features already shipped.
The genuine feature gap is concentrated in one place: admin-side channel creation defaults, which is
TempVoice's entire Overview tab and which we have none of.

---

## Defects worth more than any missing feature

### 1. The admin's default user limit is silently dropped - verified

`getChannelDefaultInheritedProperties()` reads `{ bitrate, userLimit }` off the master channel
(`apps/vertix-bot/src/services/dynamic-channel-service.ts:1210`). `createDynamicChannel` spreads that
into the create call and then overwrites it on the next line with `userLimit: dynamicChannelUserLimit`
(`:1482`), which is `0` unless autosave restored a value.

`bitrate` sits in the same destructure and is *not* overwritten, so bitrate inheritance from the
master channel works today, undocumented. User limit is the odd one out: an admin who sets a limit on
the generator channel is ignored.

Two notes before fixing:

- `resetChannel` already applies the master's limit (`:2236`), so this only affects fresh creates.
- Guard on the field, not the row. `savedData` can be truthy with `dynamicChannelUserLimit`
  undefined, and `userLimit: undefined` still overrides the spread. There is also a `-1` sentinel in
  `packages/vertix-base/src/models/data/user-master-channel-data-model.ts`.

### 2. `{user}` deletes non-Latin display names - verified

`assembleChannelNameTemplate` sanitises with `replace( /[^a-zA-Z0-9]/g, "" )`
(`apps/vertix-bot/src/services/dynamic-channel-service.ts:567`).

`Иван` becomes `""`. `日本語` becomes `""`. `Δημήτρης` becomes `""`. The default template
`{user}'s Channel` renders as `'s Channel` for every one of them - on the locales we actively ship
(`ru.json`, `ja.json`, `el.json`).

Sequencing matters: that strip is currently the only sanitisation on the create path, because
`hasSomeBadword` has a single call site in `editChannelName` (`:1625`). Loosening it on its own turns
a display name into unfiltered channel-name injection. Ship it together with finding 8.

### 3. Owners can block and kick moderators - verified

`editUserAccess` (`apps/vertix-bot/src/services/dynamic-channel-service.ts:2345`) and `kickUser`
(`:2464`) guard exactly two cases: the target is the bot, and the target is the initiator. The same
is true of `addUserAccess` (`:2291`) and `removeUserAccess` (`:2404`).

Because a member-level deny beats a role-level allow in Discord's permission resolution,
`dynamicChannelStaffRoles` does not protect a moderator from being individually blocked. An owner can
lock a staff member out of the channel that staff member is trying to moderate, and disconnect them
on sight. This defeats the staff roles feature.

TempVoice refuses member actions against anyone holding Ban, Kick or Timeout Members, and reports the
skip to the caller rather than failing silently.

### 4. Access menus handle one user per click - verified

`DynamicChannelUserMenuBase`
(`apps/vertix-bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base.ts`) implements
`getMinValues()` and never `getMaxValues()`, which is optional in the base. `max_values` is therefore
undefined and Discord defaults it to 1. Trusting a five-person party is five separate interactions.

Not a pure loop fix: each iteration currently performs a permission PATCH, a `updateUserDataPermissionLists`
upsert and a `log()` write, so the DB write and the log have to be hoisted out of the loop, or the
overwrites batched through `channel.permissionOverwrites.set()`.

### 5. The dashboard reads and writes a settings key that does not exist - verified

`apps/vertix-api/src/server/services/management-service.ts:33` defines
`DYNAMIC_SETTINGS_KEY = "VertixBase/Models/MasterChannelData/settings"`.

The real keys are built from each model's `getName()`:

- V2 - `VertixBase/Models/MasterChannelDataModel` (`packages/vertix-base/src/models/master-channel/master-channel-data-model.ts:22`)
- V3 - `VertixBase/Models/MasterChannelDataV3` (`packages/vertix-base/src/models/master-channel/master-channel-data-model-v3.ts:22`)

The API's constant matches neither. It is used at `:187`, `:377`, `:654`, `:670` and `:679` - `:187`
and `:377` are reads, so the dashboard never displays a guild's real settings either, and writes land
in an orphan row. `SCALING_SETTINGS_KEY` on the line above is correct, which makes this a typo rather
than a design decision.

---

## Feature gaps worth building

### 6. Admin defaults for channel creation - reported

`MasterChannelSettingsInterface` (`packages/vertix-base/src/interfaces/master-channel-config.ts`) has
no key for default privacy state, default user limit, target category, or channel position. This is
TempVoice's entire Overview tab.

The category half is the urgent one. Discord caps a category at 50 channels, each master channel
creates its own category, and `ChannelService.create()` swallows the failure and returns `null`, so a
user clicks the generator and nothing happens with no message. **An error embed on create failure is
worth shipping on its own, ahead of the fallback-category setting.**

### 7. Temporary voice role - reported

Assign a Discord role while a user sits in a dynamic channel - the standard way to gate a text
channel to "people currently in voice". We have nothing: our access model is entirely permission
overwrites, so there is no way to express "in voice" to the rest of the server.

Needs a role-hierarchy precheck (the bot's highest role must outrank the assigned role) and a
reconciliation sweep on boot, since a crash otherwise leaves roles stuck on members.

### 8. Badword coverage holes - reported

`hasSomeBadword` has one call site, `editChannelName`. Three paths set a channel name without it:

- reset, via `editChannelNameInternal()` directly
- template apply, via `interaction.channel.setName()` directly, inside a bare `try {} catch {}`
- creation from the admin's template, never checked

Template apply is the exploitable one, because capture stores `channel.name` literally: a name that
was legal under a shorter word list gets replayed past the current filter forever.

Their masking-with-asterisks behaviour is *not* worth copying - blocking the rename outright is the
better UX. This is purely about coverage.

### 9. Placeholders - reported

They document 22 tokens; we have 4 (`{user}`, `{state}`, `{game}`, `{index}` plus aliases). The
substitution map is a flat record, so tokens are cheap. The ones that need no new intent:

`{privacy}`, `{index-roman}` / `{index-alpha}` / `{index-digit}`, `{random}` from an admin word list,
`{guild-id}` / `{channel-id}`, `{owner-nickname}` distinct from the sanitised `{user}`,
`{role-highest}` / `{role-hoist}`.

Separately: `apps/vertix-bot/src/ui/general/channel-name-template/channel-name-template-embed.ts`
documents zero placeholders to the admin who is being asked to type one.

### 10. Empty-channel grace period - reported

We delete the moment `channel.members.size === 0`. A user whose client drops for three seconds loses
the channel and all its state, and the create/delete churn burns against Discord's limit of 2000
channel creations per day per guild - which TempVoice's own troubleshooting page names as a leading
cause of a temp-voice bot appearing dead.

### 11. Overwrite budget guard - reported

TempVoice caps trust and block at 25 each and says why: permission overwrite cost. We have no cap.
Channels accumulate overwrites, and `updateChannelOwnership` rewrites the entire merged set on every
transfer. Not urgent at current scale; degrades quietly and then presents as transfer and reset
timeouts on the largest channels.

---

## Traps

Things that look worth copying and are not.

**`{game}` and the activity placeholders.** Already dead code - there is no `GuildPresences` intent,
so `member.presence` is always null and the token resolves to `""` while being advertised in a code
comment. Enabling it needs a privileged intent, which requires Discord review at 100+ guilds and is
routinely refused for channel naming, and then pays out in renames against Discord's ceiling of 2 per
10 minutes per channel, so the name would lag reality permanently. TempVoice gates these behind a
self-hosted tier where the customer supplies their own token and their own intent approval. Either
delete `{game}` or move it behind the same kind of tier.

**Password / knock-to-join.** Fights our audience model. `editChannelAudiencePermissions`
(`apps/vertix-bot/src/managers/permissions-manager.ts:351`) deliberately keeps `@everyone` denied
whenever the audience is narrower than everyone, so a password entrant cannot be admitted by
loosening the channel state - they need an individual member overwrite. That is unbounded overwrite
growth, which is the opposite of the scaling problem passwords exist to solve. If it is ever built:
ephemeral approval, member overwrite, revoke on leave, and capped.

**Waiting room.** Doubles the channel count per active party, against 500 channels per server and 50
per category, with no fallback categories and a silent failure mode. Finding 6 has to land first.

**Position control.** Their own documentation warns that position "might become unpredictable". We
would inherit the caveat and the bug reports.

**Flipping `dynamicChannelAutoSave` to `true`.** Looks like a free win. It reaches zero existing
guilds: setup persists the entire settings slice including `dynamicChannelAutoSave: false`, and reads
merge defaults under the stored row, so the stored `false` wins. Changing the config default affects
new setups only; anything more needs a data migration.

---

## Not gaps

Where we already match or beat them, and first-pass findings that did not survive review.

- **Templates.** Five saved presets per user per guild with capture, apply and delete. They have no
  equivalent. Genuine differentiator.
- **Claim.** We run a 60-second community vote after a 10-minute abandonment timer. Theirs is
  first-come-first-served and behind a vote wall.
- **`/voice info`.** They need a command for it. Our primary embed renders name, limit, privacy state
  and region live and always.
- **Trust and block list visibility.** Our access embed renders both lists with empty-state copy.
  They document no equivalent.
- **Greeting and in-voice interface.** They sell these as two separate settings. Our primary message
  posts on create with the owner mentioned by default - the same thing in one message.
- **Per-feature toggles.** `dynamicChannelButtonsTemplate` already is the disable switch: a button
  absent from the template fails `isAvailable()` and never renders, and since there is no slash
  command alternative, removing the button removes the capability. V3 additionally has
  `dynamicChannelButtonsTemplateByRole`, which they charge premium for.

  **But** the in-channel primary message is rendered once with the *owner's* roles
  (`apps/vertix-bot/src/services/dynamic-channel-service.ts:1599`), so a staff member reading the
  panel sees the owner's button set. Per-viewer resolution only happens on interaction-driven
  renders. Worth fixing before this is marketed.
- **Transfer ownership cache miss.** Reported in the first pass as a bug; it is not one. discord.js
  adds every resolved member of a select interaction to the guild member cache, and nothing in our
  client options evicts it. The missing self / bot / already-owner guards are real; the cache concern
  is not.
- **Owner slash commands.** They have a `/voice` tree; we have three admin-gated commands. Mostly not
  worth chasing - the panel already resolves the target channel from the interaction channel or the
  user's current voice channel, so owners are covered from anywhere. Commands are discoverability,
  not capability. The exception is non-owner entry points, which we structurally lack and which
  anything like `/join` would require first.

---

## Source

Their documentation index is at `https://easy.tempvoice.xyz/llms.txt`; every page is also available
as Markdown by appending `.md` to its URL.

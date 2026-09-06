# TempVoice gap analysis

Comparison of Vertix.gg against [TempVoice](https://easy.tempvoice.xyz/), 2026-09-06.

Method: every page of their public documentation (~70 pages, 143 distinct capabilities) read and
extracted, mapped against this codebase, then put through an adversarial pass that re-checked each
"we lack X" claim against the working tree. Several first-pass findings did not survive that pass
and are recorded in [Not gaps](#not-gaps) rather than dropped.

Each finding carries a confidence marker:

- **verified** - checked directly against the code while writing this document, line references below
- **reported** - came out of the analysis and is consistent with the code, but was not re-checked by hand

Last updated 2026-09-06, after working through the list.

---

## Status

| # | Item | State |
|---|---|---|
| 1 | Default user limit dropped | fixed |
| 2 | `{user}` deletes non-Latin names | fixed |
| 3 | Owners can block and kick moderators | fixed |
| 4 | Access menus handle one user per click | **skipped** - convenience, not correctness |
| 5 | Dashboard settings key does not exist | fixed |
| 6 | Admin defaults for channel creation | **partly** - the failure now names a full category; fallback categories not built |
| 7 | Temporary voice role | fixed |
| 8 | Badword coverage holes | fixed |
| 9 | Placeholders | fixed, minus `{random}` and `{channel-id}` |
| 10 | Empty-channel grace period | **skipped** - parity, TempVoice has none either |
| 11 | Overwrite budget guard | **skipped** - see the entry, the premise did not hold |

Two defects surfaced while doing the work that were not in the original analysis, and are recorded
under [Found while fixing](#found-while-fixing).

---

## Summary

We are not far behind on owner-facing capability. The panel already covers rename, user limit,
access, privacy, region, reset, transfer and claim, and three things we have are things TempVoice
either lacks or charges for: channel templates, vote-based claim, and per-role button sets.

The largest wins available were not features to build. They were defects in features already
shipped - and that held up: of the nine items acted on, six were bugs in things that already
existed, and the two most valuable findings of the whole exercise were not in this comparison at
all. They are under [Found while fixing](#found-while-fixing).

The genuine feature gap was concentrated in one place: admin-side channel creation defaults, which
is TempVoice's entire Overview tab. That is still mostly open - the failure now explains itself,
but the defaults do not exist.

---

## Defects worth more than any missing feature

### 1. The admin's default user limit is silently dropped - verified

> **Status: fixed.** The local is now seeded from the master channel, and saved data only
> overrides it when it holds a real value, so the `-1` sentinel and a missing key both fall through.

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

> **Status: fixed.** The strip is now a blocklist of characters that are hostile in a Discord
> name rather than a Latin-alphanumeric whitelist, so scripts and spacing survive. The badword
> coverage in finding 8 is still open, but it was never what this strip protected - an
> all-alphanumeric badword passed it unchanged.

`assembleChannelNameTemplate` sanitises with `replace( /[^a-zA-Z0-9]/g, "" )`
(`apps/vertix-bot/src/services/dynamic-channel-service.ts:567`).

`Иван` becomes `""`. `日本語` becomes `""`. `Δημήτρης` becomes `""`. The default template
`{user}'s Channel` renders as `'s Channel` for every one of them - on the locales we actively ship
(`ru.json`, `ja.json`, `el.json`).

Sequencing matters: that strip is currently the only sanitisation on the create path, because
`hasSomeBadword` has a single call site in `editChannelName` (`:1625`). Loosening it on its own turns
a display name into unfiltered channel-name injection. Ship it together with finding 8.

### 3. Owners can block and kick moderators - verified

> **Status: fixed.** Blocking and kicking now refuse a member holding one of the master
> channel's staff roles, and answer with a dedicated embed naming the member rather than a
> generic error. Granting and clearing access are deliberately not guarded - neither can shut a
> staff member out, and guarding the clear path would make an already blocked staff member
> unfixable. The status lives only on `EditStatus` and `ActStatus`, so the compiler rejects a
> branch for it on the two actions that cannot return it.

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

> **Status: skipped, deliberately.** Convenience rather than correctness - the action works, it
> just costs one interaction per user.

`DynamicChannelUserMenuBase`
(`apps/vertix-bot/src/ui/v3/dynamic-channel/base/dynamic-channel-user-menu-base.ts`) implements
`getMinValues()` and never `getMaxValues()`, which is optional in the base. `max_values` is therefore
undefined and Discord defaults it to 1. Trusting a five-person party is five separate interactions.

Not a pure loop fix: each iteration currently performs a permission PATCH, a `updateUserDataPermissionLists`
upsert and a `log()` write, so the DB write and the log have to be hoisted out of the loop, or the
overwrites batched through `channel.permissionOverwrites.set()`.

### 5. The dashboard reads and writes a settings key that does not exist - verified

> **Status: fixed.** The key and the data version are now derived from the two models and
> selected by the master channel's own `version` column, so V2 and V3 masters each resolve to
> the row the bot actually wrote. Confirmed at runtime: V2 is
> `VertixBase/Models/MasterChannelDataModel/settings` at `0.0.0.2` and V3 is
> `VertixBase/Models/MasterChannelDataV3/settings` at `0.0.0.3` - the old constant matched
> neither, and its hardcoded `0.0.0.3` was wrong for V2 as well.

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

> **Status: the message is done, the overflow is not.** The create error is no longer discarded by
> an argument-less `catch`, so the log names the real cause. The user gets a direct message, and
> when the cause is a full category the message says exactly that instead of listing everything it
> might be - `isCategoryFull()` counts the category's children against
> `DISCORD_CATEGORY_CHANNELS_LIMIT` rather than parsing discord's error text.
>
> Fallback categories were deliberately not built. The ceiling is real - a master channel keeps its
> generator, its control panel and every dynamic channel in one category, so 48 concurrent channels
> per generator - but overflow is a bigger change than it looks: our categories carry the audience
> permissions, so a fallback category has to be created with those and kept in sync when the
> verified roles change, and `updateVerifiedRolesPermissions()` walks `masterChannel.parent` only.
> Getting that wrong gives the overflow channels the wrong permissions, which is worse than the
> wall. The rest of the creation defaults - privacy, user limit, category choice, position - are
> still open.

`MasterChannelSettingsInterface` (`packages/vertix-base/src/interfaces/master-channel-config.ts`) has
no key for default privacy state, default user limit, target category, or channel position. This is
TempVoice's entire Overview tab.

The category half is the urgent one. Discord caps a category at 50 channels, each master channel
creates its own category, and `ChannelService.create()` swallows the failure and returns `null`, so a
user clicks the generator and nothing happens with no message. **An error embed on create failure is
worth shipping on its own, ahead of the fallback-category setting.**

### 7. Temporary voice role - reported

> **Status: fixed.** A role held only while a member sits in a dynamic channel. Configurable per
> guild and per master channel, the master channel winning when set, and the inherited value is
> shown rather than a bare None so an admin can see what applies. `ChannelService.onSwitch()`
> decomposes a switch into join-then-leave and the event bus does not await its subscribers, so the
> manager converges on the two voice states rather than reacting to either event - a naive add and
> remove would have left a member who moved between two channels holding nothing. Assignability is
> checked at pick time, and the role is reclaimed on boot from anyone no longer in a channel.

Assign a Discord role while a user sits in a dynamic channel - the standard way to gate a text
channel to "people currently in voice". We have nothing: our access model is entirely permission
overwrites, so there is no way to express "in voice" to the rest of the server.

Needs a role-hierarchy precheck (the bot's highest role must outrank the assigned role) and a
reconciliation sweep on boot, since a crash otherwise leaves roles stuck on members.

### 8. Badword coverage holes - reported

> **Status: fixed.** Creation, reset and template apply now mask matched words with asterisks.
> Renaming still refuses outright, which stays the better answer when a user typed the name -
> the three assembling paths cannot refuse, since the user would be left without a channel.
> Template apply also stopped swallowing its errors: the handler is a named function now, so it
> can log what failed.

`hasSomeBadword` has one call site, `editChannelName`. Three paths set a channel name without it:

- reset, via `editChannelNameInternal()` directly
- template apply, via `interaction.channel.setName()` directly, inside a bare `try {} catch {}`
- creation from the admin's template, never checked

Template apply is the exploitable one, because capture stores `channel.name` literally: a name that
was legal under a shorter word list gets replayed past the current filter forever.

Their masking-with-asterisks behaviour is *not* worth copying - blocking the rename outright is the
better UX. This is purely about coverage.

### 9. Placeholders - reported

> **Status: partly done.** `{username}` now resolves - it was the persisted default of the api
> and the dashboard while being absent from the substitution map, so those channels were named
> literally `{username}'s Channel`. Added `{index-roman}` and `{index-alpha}`, and `{state}` no
> longer renders empty at creation. `{game}` works now that `GuildPresences` is enabled. Every
> token across all three engines is documented at `/posts/channel-name-placeholders`.
> The name engine received only four values, so it was widened to also take the username, the
> guild id and the member: `{user-username}`, `{role-highest}`, `{role-hoist}` and `{guild-id}`
> work now. A separate `{owner-nickname}` was dropped - `{user}` already resolves to the
> nickname with the username as its fallback. Every alias was removed - the `{{double brace}}`
> forms, `{username}`, `{auto-scale}` and `{autoscale}` - so each value has exactly one
> spelling. The defaults that shipped `{username}` in the api, the dashboard and four preview
> vars were rewritten to `{user}`, which is what `uiUtilsWrapAsTemplate` produces. `{random}` is still out - it needs an admin word
> list setting - and `{channel-id}` would be empty at creation, where the channel does not
> exist yet.

They document 22 tokens; we have 4 (`{user}`, `{state}`, `{game}`, `{index}` plus aliases). The
substitution map is a flat record, so tokens are cheap. The ones that need no new intent:

`{privacy}`, `{index-roman}` / `{index-alpha}` / `{index-digit}`, `{random}` from an admin word list,
`{guild-id}` / `{channel-id}`, `{owner-nickname}` distinct from the sanitised `{user}`,
`{role-highest}` / `{role-hoist}`.

Separately: `apps/vertix-bot/src/ui/general/channel-name-template/channel-name-template-embed.ts`
documents zero placeholders to the admin who is being asked to type one.

### 10. Empty-channel grace period - reported

> **Status: skipped, deliberately.** TempVoice documents no grace period either - across their
> whole documentation a channel is only ever "deleted when it empties" - so this is parity, not
> a gap. Worth knowing that their own troubleshooting page names the 2000 creations per day cap
> as a leading cause of the bot appearing dead, so the risk is shared rather than avoided.

We delete the moment `channel.members.size === 0`. A user whose client drops for three seconds loses
the channel and all its state, and the create/delete churn burns against Discord's limit of 2000
channel creations per day per guild - which TempVoice's own troubleshooting page names as a leading
cause of a temp-voice bot appearing dead.

### 11. Overwrite budget guard - reported

> **Status: skipped, and the premise was wrong.** The concern was unbounded accumulation. There is
> none: the saved allow and block lists are *derived* from the channel's own overwrites each time
> (`getChannelUserIdsWithPermissionState`), so they cannot exceed what is on the channel, and every
> entry costs the owner one deliberate menu interaction. TempVoice's cap of 25 is a product choice,
> not a platform requirement, and copying it would be worse for a server that legitimately trusts
> thirty people. If it ever does bite, the symptom is slow transfers and resets on large channels
> and the answer is batching through `permissionOverwrites.set()`, not refusing the 26th person.

TempVoice caps trust and block at 25 each and says why: permission overwrite cost. We have no cap.
Channels accumulate overwrites, and `updateChannelOwnership` rewrites the entire merged set on every
transfer. Not urgent at current scale; degrades quietly and then presents as transfer and reset
timeouts on the largest channels.

---

## Found while fixing

Neither was in the original comparison. Both were surfaced by verification passes that were
checking something else.

### Updates to guild and user data reverted on restart - fixed

`ModelDataBase` hardcoded `VERSION_UI_V2` when creating and when deleting a row, but read
`args.version` when updating one - and `IDataModel.setData` is declared
`Omit<IDataUpdateArgs, "version">`, so no caller could ever supply it. Prisma requires all three
fields of `ownerId_key_version`, so every update threw a validation error.

Two things hid it: the throw was swallowed as a `warn` with no error object, and
`ManagerDataBase.updateData` writes the cache *before* calling the model, so the new value read back
correctly for the life of the process and only reverted on restart.

It also typechecked, because the implementation declared the wider type while the interface declared
the narrower one, and parameters of method-syntax declarations are bivariant - `strictFunctionTypes`
does not apply to them.

Visible symptom: changing an already-set server language, or editing badwords from one non-empty
list to another, silently reverted. `GuildModel` and `UserModel` are the only models on this base;
master channel settings use `ModelDataOwnerBase` and were never affected.

### The v3 setup-edit handlers do not render - partly fixed

Nothing in the framework renders after a bound handler. `run()` ends at `runEntityCallback`, and
`applyFlowTriggers` is not wired into the `dispatchBinding` path that `defineTransactions` handlers
take, so a transition's `to:` is flow-graph metadata and only an explicit `editReplyWithStep` moves
the screen. The v2 adapter ends every handler with one; v3 mostly does not.

Fixed: `onVerifiedRolesSelected` and `onVerifiedRolesEveryoneSelected`, which acknowledged nothing at
all, so picking a verified role showed "This interaction failed" after three seconds.

**Still open, and the sharp one: `onButtonsSelected`.** The button template is persisted *only* by
the effect handlers - `onDoneButtonClicked` does nothing on the buttons step - and nothing navigates
to the effect screen in v3. The v2 handler ends with
`editReplyWithStep( …, "VertixBot/UI-V2/SetupEditButtonsEffect" )`; the v3 one ends after
`setArgs`. If that reads correctly, selecting buttons on a V3 master channel cannot be saved. Worth
confirming against a live V3 master channel before changing it.

Nine other handlers in that adapter also never render. Some are fine - `onDoneButtonClicked` renders
a different adapter - and telling them apart needs reading each against its transition.

## Traps

Things that look worth copying and are not.

**`{game}` and the activity placeholders.** *(Superseded: `GuildPresences` was enabled on the
discord side and added to the intents, and nothing renames on a presence change, so the rate limit
argument below never applied to how we resolve it.)* Was dead code - there is no `GuildPresences` intent,
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

## Keeping this current

`exports/ui/*.json` is regenerated by running the bot with `--export-ui`, and
`bun run vertix:languages:check` gates on it in two directions: everything in the exports must exist
in `en.json`, and everything in `en.json` must exist in every other locale. The second direction
works from `en.json` alone and is always accurate. The first goes blind whenever the exports are
older than the code, which is the normal state right after adding a screen - a forgotten entry would
not be reported until the exports are regenerated.

Every placeholder token is documented for users at `/posts/channel-name-placeholders` on the
website.

## Source

Their documentation index is at `https://easy.tempvoice.xyz/llms.txt`; every page is also available
as Markdown by appending `.md` to its URL.

# Bitrate spec

> **Status: built.** Every row below is in the working tree, uncommitted. Where a row turned out to
> be already done once the code was read, the row says so rather than claiming credit for it; where
> the build settled something differently from the plan, the row says that too.

The owner of a dynamic channel sets its audio quality. It lives on the **Region screen** — a second
menu under the one already there — in both interfaces. No button is added to any control panel, in
either version.

> **How an interaction reaches a feature is `spec/interactions-spec.md`.** This file is about one
> feature. That one is about the two doors every feature is reached through, and is the place to
> read before wiring either.

---

## Why it goes on the Region screen

Region and bitrate are the same kind of setting: neither is about who is in the channel or what it
is called, both are about how the voice itself is carried. An owner who has opened a screen to move
their channel closer to their friends is the same owner who wants it to sound better, and they are
one press apart rather than two screens apart.

The other half of the reason is what a new button costs. A button is a slot in a set an admin has
curated, and a generator that stored its set before the button existed goes on drawing the set it
stored — the whole of `V2_DEFAULT_BUTTONS_BEFORE_LFM` in
[button-ids.ts](../packages/vertix-definitions/src/button-ids.ts) exists because that happened once
already. A menu on a screen is stored nowhere, arranged by nobody, and appears on every channel the
moment the bot restarts.

**So: bitrate adds no button, in either version.** It is a menu on a screen, and nothing about it is
stored against a generator.

> **Since settled otherwise for region itself.** v2's region screen was reached only by
> `/voice region`, which made it the one feature on that interface with no way in from the panel, so
> it was given a button after all — `DynamicChannelRegionButton`, id `19`, in `V2_BUTTONS` and in the
> default set. That is the cost described above being paid deliberately: the stored default changed
> for the first time since lfm, which is what `V2_DEFAULT_BUTTONS_ADDED_SINCE` now records. **Bitrate
> still has no button of its own** — it is a menu on the screen that button opens.

---

## What exists today

|  | v3 | v2 |
|---|---|---|
| Region screen | `ui/v3/dynamic-channel/region/` — button, embed, select menu, adapter | **none** |
| Region button on the panel | yes — `ChannelRegion`, sorted after Privacy | none, and no id in `V2_BUTTONS` |
| `/voice region` | opens `DynamicChannelRegionAdapter` | `VertixBot/UI-General/FeatureMissingInV2Adapter` |
| Region shown to the owner | its own screen | a read-only line in the primary-message embed |
| **Bitrate set by the owner** | **no** | **no** |
| Bitrate inherited from the generator | **yes, already** | **yes, already** |

Two of those rows matter more than the rest.

**The inheritance already works.** `getChannelDefaultInheritedProperties()`
([dynamic-channel-service.ts:1519](../apps/vertix-bot/src/services/dynamic-channel-service.ts:1519))
returns `{ bitrate, userLimit, rtcRegion? }` off the master channel, and it is spread into both
`createDynamicChannel()`'s `defaultProperties` (line 1617) and `resetChannel()`'s `channel.edit()`
(line 2619). So a new channel is already born at its generator's bitrate, and reset already puts it
back. Nothing in this spec has to build either — see `B-09`.

**v2 has no Region screen at all.**
[voice-commands.ts:15](../apps/vertix-bot/src/commands/definitions/voice-commands.ts:15) lists
`region` among the six features "v2 never had". So the v2 half of this work is a Region screen
first and a bitrate menu on it second — reached by `/voice region` and nothing else. v2 gains
region editing as a side effect, which is the point of putting it there rather than inventing a
screen for one menu.

---

## Discord's rules

| | |
|---|---|
| unit on the wire | **bits per second** — Discord's own UI says `64 kbps`, the API takes `64000` |
| minimum | `8000` |
| maximum | `guild.maximumBitrate` — varies per guild, see below |
| how it is set | `channel.setBitrate( value, reason? )` |
| over the maximum | rejected, `DiscordAPIError 50035` (invalid form body) |
| rate limit | the ordinary channel-edit limit. **Not** the 2-per-10-minutes bucket that `name` and `topic` sit in, so there is no rate-limit result code to carry the way rename has one |

The maximum, read off discord.js `Guild#maximumBitrate`
(`node_modules/.bun/discord.js@14.27.0/node_modules/discord.js/src/structures/Guild.js:603`):

| guild | max |
|---|---|
| no boost tier | 96 kbps |
| boost tier 1 | 128 kbps |
| boost tier 2 | 256 kbps |
| boost tier 3 | 384 kbps |
| carries the `VIP_REGIONS` feature | 384 kbps, whatever the tier |

Never hardcode 96000 or 384000. The number is a property of the guild the channel is in, and a
server that boosts on Friday should see the wider list on Friday without a deploy.

**A server can lose a tier.** Discord leaves existing channels at the bitrate they were set to, so a
channel can legitimately sit above what its guild would now allow. The screen has to say what the
channel actually is even when that value is no longer on offer — `B-04`.

---

## The steps offered

Nine options. Discord's own control is a slider; a menu has to pick points on it, and these are the
points its tier boundaries fall on plus enough below them to be useful for a channel that wants to
be cheap on somebody's data.

| label | value | offered when |
|---|---|---|
| `Generator default` | `inherit` | always |
| `8 kbps` | `8000` | always |
| `16 kbps` | `16000` | always |
| `32 kbps` | `32000` | always |
| `64 kbps` | `64000` | always |
| `96 kbps` | `96000` | always |
| `128 kbps` | `128000` | tier 1 and up |
| `256 kbps` | `256000` | tier 2 and up |
| `384 kbps` | `384000` | tier 3, or `VIP_REGIONS` |

`Generator default` is the counterpart of Region's `Automatic`: the option that means *no choice of
mine*, resolving to the master channel's own bitrate. Without it an owner who nudged the menu has no
way back short of `/voice reset`, which also throws away their name, limit and permissions.

The steps belong in `packages/vertix-definitions/src/bitrate-definitions.ts`, next to
[rtc-region-definitions.ts](../packages/vertix-definitions/src/rtc-region-definitions.ts) and
shaped the same way — a label-to-value map both interfaces and the export read, so the two versions
cannot come to disagree about what `128 kbps` means.

---

## The rows

### v3

**`B-01` — a bitrate menu on the region screen.**
`apps/vertix-bot/src/ui/v3/dynamic-channel/region/dynamic-channel-bitrate-select-menu.ts`, class
`DynamicChannelBitrateSelectMenu`, name `VertixBot/UI-V3/DynamicChannelBitrateSelectMenu`, extending
`DynamicChannelStringMenuBase` exactly as
[the region menu does](../apps/vertix-bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-select-menu.ts).
It sits in the `region/` folder because it is part of that screen; a `bitrate/` folder would be a
folder for one file describing a screen that does not exist.

**`B-02` — the group stops being a single.** `DynamicChannelRegionComponent.getElementsGroups()`
currently calls `UIElementsGroupBase.createSingleGroup( DynamicChannelRegionSelectMenu )`, which
derives the group name `…/DynamicChannelRegionSelectMenuGroup`. Two menus need a real group class:
`dynamic-channel-region-elements-group.ts`, name
`VertixBot/UI-V3/DynamicChannelRegionElementsGroup`, `getItems()` returning
`[ [ DynamicChannelRegionSelectMenu ], [ DynamicChannelBitrateSelectMenu ] ]` — one menu per row,
because Discord gives a select menu a row to itself. `getDefaultElementsGroup()` returns the new
name.

> Renaming the group is safe for anything a guild has customized: overrides are keyed by **element**
> name, not group — [ui-element-base.ts:63](../packages/vertix-gui/src/bases/ui-element-base.ts:63).
> No stored row names a group.

**`B-03` — the menu is trimmed to the guild, and the export is not.** `getSelectOptions()` reads
`this.uiArgs` the way
[the templates-apply menu does](../apps/vertix-bot/src/ui/v3/dynamic-channel/templates/apply/dynamic-channel-templates-apply-select-menu.ts),
and filters the steps against `uiArgs.maxBitrate`.

When `uiArgs` carries no maximum it returns **every** step. That is not a fallback, it is the case
that matters: the UI exporter runs headless with no args, so an unconditional filter would bake an
empty `selectOptions` into `exports/ui/components.json` and leave the dashboard with nothing to
reword — which is exactly what the templates menu exports today. Returning the full list unfiltered
means the catalogue and the seven language files carry all nine labels while a live guild still only
sees what it may use.

**`B-04` — the adapter supplies the two new args.** In
[dynamic-channel-region-adapter.ts](../apps/vertix-bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-adapter.ts),
`getArgs( channel )` grows from `{ region }` to:

```
{
    region: channel.rtcRegion,
    bitrate: channel.bitrate,
    maxBitrate: channel.guild.maximumBitrate
}
```

`bitrate` is what the embed prints and is read off the channel rather than off the menu, so a
channel sitting above its guild's current maximum still reports itself honestly.

**`B-05` — a transition and a binding.** Beside `SelectRegion`, a `SelectBitrate` transition
(`from: "Default"`, `to: "Default"`, `mutations: [ { type: "set", path: [ "bitrate" ] } ]`) and a
binding on the new element.

**Settled differently, twice.** The binding is `bindSelectMenu`, not the `bindUserSelectMenu` the
region menu beside it uses: the two are the same function with different default type parameters
(`ui-adapter-base.ts:1190`), and this one is a string menu. The region binding is left as it is.

And the handler does *not* resolve `inherit` — it hands the menu's own value to the service
untouched, exactly as the region handler hands over `auto`. What `inherit` means, and whether the
guild still allows what was picked, are questions about the channel rather than about the press.

**`B-06` — the embed says what the channel is.** Add `bitrate` to the vars in
[dynamic-channel-region-embed.ts](../apps/vertix-bot/src/ui/v3/dynamic-channel/region/dynamic-channel-region-embed.ts)
and a line to the description under the region line, plus a fourth `-#` hint. The title stops being
about region alone.

No `bitrateEmoji`. Custom emoji come from `assets/<BaseName>.png` uploaded as application emoji, and
there is no bitrate artwork — a base name with no asset behind it resolves to nothing. The line uses
a plain unicode emoji, the way v2's own message already prints `🌍` beside the region.

The value is printed in kbps, not bps: `setLogic()` divides. Nobody thinks in bits per second, and
`96000` in an embed reads as a mistake.

`previewDefaultVars` gains `bitrate: "64"` for the same reason the state already carries
`region: "Automatic"` — the dashboard previews a screen with no channel behind it, and a var with
nothing against it prints as its own template.

### v2

Everything here is new. The shape is v3's, one folder over: `apps/vertix-bot/src/ui/v2/dynamic-channel/region/`.

**`B-07` — the screen.** Five files, each the v2 sibling of its v3 counterpart, built on the v2
bases in `ui/v2/dynamic-channel/base/`:

| file | name |
|---|---|
| `dynamic-channel-region-embed.ts` | `VertixBot/UI-V2/DynamicChannelRegionEmbed` |
| `dynamic-channel-region-select-menu.ts` | `VertixBot/UI-V2/DynamicChannelRegionSelectMenu` |
| `dynamic-channel-bitrate-select-menu.ts` | `VertixBot/UI-V2/DynamicChannelBitrateSelectMenu` |
| `dynamic-channel-region-elements-group.ts` | `VertixBot/UI-V2/DynamicChannelRegionElementsGroup` |
| `dynamic-channel-region-component.ts` | `VertixBot/UI-V2/DynamicChannelRegionComponent` |

No button class. There is nothing to press it from.

**`B-08` — the way in.** `dynamic-channel-region-command-adapter.ts`, name
`VertixBot/UI-V2/DynamicChannelRegionCommandAdapter`, built with v2's own
`DynamicExecutionAdapterBuilder` and modelled on
[the access one](../apps/vertix-bot/src/ui/v2/dynamic-channel/permissions/dynamic-channel-permissions-access-command-adapter.ts),
which exists for the same reason: a screen a v2 member can only reach by typing.

Then two lines elsewhere:

- export it from [ui-adapters-index.ts](../apps/vertix-bot/src/ui/v2/ui-adapters-index.ts) — the v2
  module registers `Object.values()` of that file, so the export *is* the registration.
- add `adapterNameV2: "VertixBot/UI-V2/DynamicChannelRegionCommandAdapter"` to the `region` row in
  [voice-commands.ts](../apps/vertix-bot/src/commands/definitions/voice-commands.ts:115).

That second line is the whole of the routing change. The bridge picks the v2 adapter over the v3 one
by itself ([command-adapter-bridge.ts:64](../apps/vertix-bot/src/commands/base/command-adapter-bridge.ts:64)),
and stops answering with `FeatureMissingInV2Adapter` the moment the name is there. No flow class is
needed: `CommandsFlowBase.versionedFlowNameOf()` derives `…/DynamicChannelRegionCommandFlow` from
the adapter name and v2's router picks it up for the editor.

The prose at the top of `voice-commands.ts` says `region` is one of six features v2 never had. It is
five after this. **Fix the comment in the same commit** — it is the only written statement of which
features are v2's, and a stale one is how the next person concludes the work was never done.

### The service

**`B-09` — `editChannelBitrate()`, and `resolveBitrate()` under it.** Beside
[`editChannelRegion()` at 2292](../apps/vertix-bot/src/services/dynamic-channel-service.ts:2292):
skip when the value already matches, `setBitrate()` with a caught error, log through `this.log()`,
and on success write the owner's preference and `editPrimaryMessageDebounce( channel )`.

`resolveBitrate()` is the private half — `inherit` to the master channel's bitrate, anything else
through `parseInt`, both clamped to `guild.maximumBitrate`. The menu is the screen's idea of what is
allowed; the guild is the fact, and between a screen being drawn and a choice arriving a server can
lose a boost.

**Not shaped identically in one respect.** `editChannelRegion()` writes
`.catch( … ).then( () => result = true )`, and a caught rejection resolves — so it reports success
whether or not discord took the edit. This one puts `.then( () => true )` first and returns `false`
from the catch. The region method is left alone; it is a bug in its own right, not this feature's.

**`B-10` — a log line.** A `case this.editChannelBitrate:` in the switch at
[line 3180](../apps/vertix-bot/src/services/dynamic-channel-service.ts:3180), following the region
case above it — a failure line and a success line, printing kbps.

**`B-11` — reset needs nothing, and needs one thing.** Reset already writes the generator's bitrate
back, through the inherited properties (see *What exists today*). What it does not do is overwrite
the owner's **saved** bitrate, so a reset channel would come back at the owner's old value next
time. `getChannelConfiguration()` gains an `includeBitrate` option beside `includeRegion`, and
`resetChannel()` writes `userData.dynamicChannelBitrate` under it — the two call sites that pass
`includeRegion: true` ([the v3 reset adapter](../apps/vertix-bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-adapter.ts:48)
and [the reset handler](../apps/vertix-bot/src/commands/handlers/voice-reset-handler.ts:32)) pass
this too.

### The data

**`B-12` — one field, two places.** `dynamicChannelBitrate: number` on
[`MasterChannelUserDataInterface`](../packages/vertix-data/src/interfaces/master-channel-user-config.ts),
defaulting to `-1` in `getStrictDataFactor()` — the same *unset* sentinel
`dynamicChannelUserLimit` uses, and unambiguous here because `0` is not a bitrate.

**`B-13` — restored on create.** In `createDynamicChannel()`, beside the
[region restore at 1681](../apps/vertix-bot/src/services/dynamic-channel-service.ts:1681):

```
if ( savedData.dynamicChannelBitrate > 0 ) {
    defaultProperties.bitrate = savedData.dynamicChannelBitrate;
}
```

Clamped to the guild maximum, for the same reason `B-09` clamps: a saved 256 kbps outlives the boost
that allowed it, and an unclamped restore fails the channel's creation rather than its bitrate.

**`B-14` — templates, optional.** `ChannelTemplateConfig`
([channel-template.ts](../packages/vertix-data/src/interfaces/channel-template.ts)) holds `region`
and would hold `bitrate` the same way. Left out of the core work: a template written before the
field exists reads back `undefined`, and every reader has to treat that as *leave it alone* rather
than as `0`. Worth its own row rather than a line in this one.

### Language

**`B-15` — seven files.** `apps/vertix-bot/assets/languages/{en,ru,el,es,fr,de,ja}.json`:

- `embeds` — the reworded v3 region embed, and the new v2 one.
- `elements.selectMenus` — placeholders for both new bitrate menus, and for the new v2 region menu,
  plus `selectOptions` for all three.

The region menu's options are translated today (`{region-us-west}` → `US West`, and its own word in
each language). The bitrate labels are numbers and a unit, so only `Generator default` carries a
translation worth making — but the options still have to be *present* in each file, or the menu
falls back to English for its one translatable row.

### Export and dashboard

**`B-16` — regenerate the catalogue.** From `apps/vertix-bot`:

```bash
bunx dotenv-cli -e ../../.env -- bun src/index-bun.ts --export-ui
```

This rewrites `exports/ui/{components,flows,adapters,meta}.json`, which is committed. The dashboard's
interface editor reads it: until it is regenerated **and deployed**, an admin cannot reword the new
menus even though a member can use them. `meta.json`'s `exportedAt` always shows in the diff.

Two things to check in the diff rather than assume: that `DynamicChannelBitrateSelectMenu` carries
all nine `selectOptions` and not an empty list (`B-03` is what makes that true), and that the
renamed v3 elements group appears under the region component.

### Tests

**`B-17` — the steps are a unit test.** Guild maximum in, offered steps out, over the nine tier
cases plus `VIP_REGIONS`. This is where the arithmetic lives and it needs no Discord to check.

**`B-18` — e2e, on the file that already covers this screen.**
[privacy-region-access.spec.ts](../packages/vertix-bot-e2e/tests/dynamic-channel/privacy-region-access.spec.ts)
gains a test that the region screen draws the bitrate menu and that a choice reaches the channel.

It asks discord rather than the screen, which needed two small additions to the harness: `bitrate`
on `IRestChannel`, and `GuildState.waitForBitrate()` beside the `waitForUserLimit()` it is modelled
on. It picks 64 kbps, the highest step every guild may use whether or not it is boosted.

**`B-19` — e2e, v2.** Half of this wrote itself. `voice-commands-v2.spec.ts` splits the `/voice`
rows into three groups **read off the command definitions**: rows with a `modalNameV2`, rows with an
`adapterNameV2`, and rows with neither, which must answer that the feature is not in v2. Adding
`adapterNameV2` in `B-08` moved `region` from the third group to the second on its own, so the
routing is asserted without a line being written.

What did need writing is the constraint itself: `v2-panel.spec.ts` now asserts that no v2 panel
button names region or bitrate, and that the panel draws no bitrate menu.

---

## Deliberately not here

- **A `/voice bitrate` subcommand.** `/voice region` opens the screen that carries it. Adding one
  means the screen's name and the command's name disagree about what the screen is for, which is a
  wording decision, not a wiring one — see the open question below.
- **A generator-level bitrate setting.** The generator's bitrate is already the channel's, inherited
  from the category. An admin sets it by setting it on the master channel. A setup screen for it is
  a separate feature and a separate spec.
- **Per-role bitrate ceilings.** "Boosters get 384" is a real request and is not this.
- **Templates** — `B-14`, deliberately deferred.

## The open question, settled

`/voice region`'s description read *"Change where your channel is hosted."* Once the screen also
carries audio quality that is half a description, so it now reads *"Change where your channel is
hosted, and how good it sounds."* A command description is not in the language files — Discord shows
the one the definition carries — so this is one line, not seven.

---

## Order of work

Each step leaves the tree working and is worth its own commit.

1. `B-19`'s no-new-button assertion, red against today's tree — the constraint, written down first.
2. The steps definition and `B-17`.
3. v3: `B-01` → `B-06`. The screen works, nothing is saved.
4. Service and data: `B-09`, `B-10`, `B-12`, `B-13`. Choices survive a restart and a new channel.
5. `B-11`. Reset stops leaving a stale preference.
6. v2: `B-07`, `B-08`, and the comment fix.
7. `B-15` — seven language files.
8. `B-16` — export, then deploy, then check the dashboard against the box rather than locally.
9. `B-18`, and `B-19` green.

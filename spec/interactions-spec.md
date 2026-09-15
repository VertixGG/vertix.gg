# How an interaction reaches a feature

Two doors onto one room. A member presses a button on a channel's interface, or types a slash
command — and both end up running the same handler, on the same adapter, against the same channel.
Getting there differs, and this is the one place that says how.

Written because it was not written anywhere: the model lived in a dozen files, and every bug in the
command work came from assuming one door behaved like the other.

---

## What each door carries

This is the whole reason the paths differ. Everything else follows from it.

| | button press | slash command |
|---|---|---|
| discord type | `MessageComponentInteraction` | `CommandInteraction` |
| `customId` | **yes** — says which entity was pressed | **no**, and never will |
| `message` | **yes** — the screen it was pressed on | **no** |
| `channel` | the channel the screen is in | wherever the member typed |
| answered by | editing the message, or replying | replying |
| time budget | 3 seconds | 3 seconds |

A press knows what it is and where it came from. A command knows neither: it is a name and a member,
typed anywhere in the guild.

### So it is declared, not sniffed

`ui/general/misc/interaction-channel-context.ts`

Interfaces used to work out where an interaction came from by reading it — `interaction.message`,
`interaction.channel`, `isPressedFromControlPanel()`. That is honest for a press and meaningless for
a command, whose location is wherever the member was standing and whose channel the bridge has
rewritten. The same command behaved differently depending on where it was typed, and nothing said
so.

Now whoever knows says so, once:

| context | what happened | names a channel |
|---|---|---|
| `channel-interface` | pressed on the interface inside a channel | yes |
| `control-panel` | pressed on the panel beside a generator | no |
| `command-in-channel` | a command, and the member's own channel was found | yes |
| `command-anywhere` | a command, and no channel was found | no |

The bridge declares one of the two command contexts the moment it resolves a channel, before the
gate runs. A press declares nothing and is inferred exactly as it always was, so no press behaviour
changed.

Two questions are asked of it, and asking them is safer than comparing — a comparison has to
remember which of four, and forgetting the newer one is how a command ends up treated like a press:

- `interactionNamesAChannel()` — can an interface act, or must it ask, offer, or say there is
  nothing? Used by the claim gate and by knock.
- `interactionCameFromAnInterface()` — does *where* this happened mean anything? Used by
  `resolveJoinToCreateChannelId()`, which otherwise let the first generator it suggested depend on
  which text channel a command was typed in.

---

## The press

`apps/vertix-bot/src/listeners/interaction-handler.ts`

1. The custom id is hashed, so it is decoded first — `UIHashService.getIdSilent()`.
2. The decoded id names an adapter. `UIService.get()` returns it.
3. `adapter.run( interaction )`.
4. `run()` splits the custom id again to get the **entity** name — which button, which menu.
5. `runEntityCallback( entityName, interaction )` calls that entity's bound handler.

The handler is bound at the adapter, by `bindButton( entityName, transition, handler )`. That is
where a feature's work lives — deciding what there is to show, and sometimes that there is nothing.

Every failure here is caught in the listener. An adapter throwing surfaces as an `error` event on
the discord client, which takes the whole bot down.

## The command

`apps/vertix-bot/src/listeners/interaction-handler.ts` → `apps/vertix-bot/src/commands/base/command-adapter-bridge.ts`

1. `Commands.find()` by name. The array is built from the definitions, not written by hand.
2. `command.run()` — awaited, inside a try/catch. A command does far more than a press before it
   answers, and an unawaited rejection is discord's "the application did not respond".
3. The bridge resolves **which channel this is about** — see below.
4. The tier gate decides whether this member may do it.
5. The bridge dispatches — see *four shapes*.

### Which channel a command is about

A press happens somewhere. A command is typed anywhere, so the channel has to be worked out:

- **owner-tier commands** mean *the channel the member owns*. Not the channel they are sitting in,
  not the generator beside them. A database question — which dynamic channel names this member as
  owner — answered the same wherever they typed it. Sitting in one of them breaks a tie; failing
  that, the newest.
- **everything else** resolves the way a press does, through
  `DynamicChannelService.resolveTargetChannel()`.

Once resolved, the channel is written onto the interaction — `applyResolvedChannelToInteraction()` —
because every adapter reads `interaction.channel` and expects it to be the voice channel it is
acting on. The press path does the same thing for the same reason.

---

## The four shapes

What a command must do to reach a feature is decided by **what that feature's button does**. Not by
the command, and not by preference. There are four, and they are not interchangeable.

| shape | when | how |
|---|---|---|
| `showModal` | the feature asks for a line of text | `adapter.showModal( modalName, interaction )` |
| `runEntity` | the work happens *before* anything is drawn | `adapter.runEntity( entityName, interaction )` |
| `ephemeral` | the adapter's own screen is the answer | `adapter.ephemeral( interaction )` |
| own handler | the feature is not an interface at all | a function in `commands/handlers/` |

**`showModal`** — rename, limit and status draw nothing until the modal comes back. Their
components return `null` from `getDefaultEmbedsGroup()`. Opening those adapters gives the member an
empty reply. A modal must never be preceded by a deferral: discord will not open one on an
interaction that has already been answered.

**`runEntity`** — knocking decides which channels can be knocked on, whether to offer a list, a
direct request, or a dead end, all before a screen exists. That decision is in the handler bound to
the button. `run()` cannot be used from a command because it reads the entity name off the custom
id; `runEntity()` is the same dispatch with the name passed in instead. **This is why handlers are
not duplicated for commands.**

**`ephemeral`** — privacy, access and region genuinely just open their screen. Their buttons call
`ephemeral()` too.

**own handler** — claiming is a vote drawn by editing the message its button sits on. A command has
no message, so it cannot be that press; `/voice claim` finds the vote and points at it instead.

### How to tell which shape a feature needs

Read what its button does in `dynamic-channel-adapter.ts`. `showModal(…)` → shape one.
`runInitial(…)` → shape two, and the entity name is the button the target adapter binds.
`ephemeral(…)` → shape three. Anything else → read it properly.

---

## Who may run it

A tier, declared per command, checked before dispatch. The same four the control panel's buttons
already enforce — commands do not invent a second authorization model, they route to the first.

| tier | means | enforced by |
|---|---|---|
| `owner` | owns the channel | `dynamicChannelRequirements()` |
| `any` | anyone | the entity's own handler |
| `in-channel` | anyone, from inside the channel | the caller's voice state |
| `admin` | manage server / channels / roles | discord's `defaultMemberPermissions`, **and** re-checked |

Admin is checked twice on purpose. Discord's permission covers a whole command group at once, so a
group holding both admin and non-admin subcommands cannot declare one — `/voice` is such a group,
`/manage` is not.

---

## Two interface versions

A generator carries the version its channels were built with. One guild can run both, so the same
command opens a different adapter depending on the channel:

- the row names `adapterNameV2`, and its `modalNameV2` or `entityNameV2` to match — reaching v2 the
  same way it reaches v3;
- a feature v2 never had names no v2 adapter, and the command says so rather than opening nothing.

The versioning service is asked for the version, never for the adapter: it forms a versioned name by
swapping the `UI-Vn` segment, and the two interfaces do not name a feature alike — v2's rename is
`DynamicChannelMetaRenameAdapter` against v3's `DynamicChannelRenameAdapter`.

---

## Traps

Every one of these cost a round trip to discord to find.

**A generator is a voice channel.** It has a chat of its own, and a database row of its own. A check
that asks only "is there a row for this channel" treats standing in a generator's chat as standing
in a channel it made — and a master's row names whoever created the generator, so they pass the
ownership check too. Ask whether it is a *master* type; do not ask whether it is a *dynamic* type,
because `internalType` defaults to `DEFAULT_CHANNEL` and a row old enough to say that is still a
real channel.

**The version fallback is the oldest version.** `determineVersion()` falls through to a strategy
that returns the first registered version — 2 — whenever the real one cannot be determined. So "this
is not a dynamic channel" silently becomes "your generator is too old for that". Never ask for a
version without first establishing there is one to read.

**`permissionsFor( member )` is effective permissions.** An administrator has every permission on
every channel. A list filtered by "can this member connect" is empty for exactly the people most
likely to be looking at it, and one filtered by "can this member see it" contains the hidden
channels nobody should be shown. Ask the channel what it is — `getChannelVisibilityState()`,
`getChannelState()` — not the member what they can do.

**`getPressedChannelId()` prefers `interaction.message.channelId`**, specifically to survive the
channel being rewritten onto the interaction — and a command has no message, so it falls straight
through to the rewritten `channelId`. The guard is bypassed for commands by construction, which is
why nothing decides behaviour from it any more: read the declared context instead. What is left of
that module is a lookup, not a judgement.

**Which generator made the channel you are in says nothing about the channel you want.** A guild can
run several. Knocking, inviting and owning all read the whole guild; scoping them to the generator a
member happens to be standing under hid everything else from them.

---

## Where things live

| | |
|---|---|
| `commands/definitions/` | every command, as data. Two readers: the builder, and `CommandsFlow` |
| `commands/base/command-adapter-bridge.ts` | resolve channel → gate → dispatch |
| `commands/base/command-tier-gate.ts` | tier → the check the buttons already use |
| `commands/handlers/` | the commands that are not an interface opening |
| `ui/general/<notice>/` | what a command says when it opens nothing |
| `ui/general/misc/interaction-channel-context.ts` | what an interaction is, declared rather than sniffed |
| `utils/join-to-create-channel.ts` | the channel to send a member to for one of their own |
| `spec/commands-spec.md` | which commands exist, and why the ones that do not, do not |

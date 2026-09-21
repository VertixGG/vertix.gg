# Billing spec

> **Status: built, except the SKUs and the e2e.** Everything below is in the working tree. The
> Discord facts were read off the developer documentation and the installed discord.js, not recalled.
> Two things are deliberately not done and are called out at the end: the SKUs themselves, which are
> created in Discord's dashboard rather than in code, and `M-13`.

Two limits that do not exist today:

1. A generator makes at most **20 live rooms** at once.
2. A server's generators past its allowance **stop making rooms** until it pays.

> **What an interaction is and how it reaches a feature is `spec/interactions-spec.md`.** This file
> is about what a server is allowed, and where that is asked.

---

## What exists today

|  | today |
|---|---|
| Generators per guild | `maxMasterChannels`, default **2** — [guild-config.ts](../packages/vertix-data/src/config/guild-config.ts) |
| Where that is enforced | **creation only** — the bot's setup flow, and `findMasterChannelLimitRefusal()` in the API |
| Raising it for a guild | by hand, as a settings row on the guild |
| Rooms per generator | **no limit at all** |
| Payment | **none.** No `Subscription` model, no checkout, no webhook |
| Discord entitlements | the `entitlement*` events appear once, in a debug logging list in [vertix.ts](../apps/vertix-bot/src/vertix.ts:55). Nothing consumes them |

Two consequences. There is no ongoing check anywhere — a generator, once made, works forever, so
enforcement is a new idea rather than a tightened number. And **no server is over its allowance
today**, so nothing has to be grandfathered and no migration is needed; the rules below bite on the
next generator anybody makes.

---

## Discord's rules

Read off the developer docs and `discord.js@14.27.0`. Three of these shape the design.

| | |
|---|---|
| SKU types | user subscription, guild subscription, consumable, durable |
| Scope | a **guild subscription** grants benefits to everyone in one server — the right scope here |
| **An app may publish user subscriptions or guild subscriptions, never both** | so this is a guild-subscription app, permanently |
| SKUs per app | 50 |
| **No quantity on an entitlement** | a guild holds at most one active entitlement per SKU, and nothing stacks |
| Reading them | `client.application.entitlements.fetch( { guild, excludeEnded: true } )`, or the `entitlements` field on any interaction payload |
| Testing | `entitlements.createTest( { sku, guild } )` — a real entitlement without real money |

**The quantity rule is why the pricing changed.** "$1 a month per generator" needed one SKU bought
N times, and Discord has no such thing. It could have been a ladder — `+1 generator $1`, `+2 $2` —
with the guild on one rung; **settled as a few fixed tiers instead.**

**Cancellation fires no entitlement event.** The docs are explicit: when somebody cancels, the app
gets `SUBSCRIPTION_UPDATE` with `status: 2 (ending)` and nothing else until the period actually
ends. Anything built on `entitlementDelete` alone would go on serving a cancelled server until it
happened to restart — see `M-07`.

---

## The tiers

Numbers to settle; everything below reads them from one place, so changing them is changing one
table.

| tier | generators | on top of free | price | SKU |
|---|---|---|---|---|
| Free | 2 | — | — | none |
| Plus | 4 | +2 | $2 / month | `DISCORD_SKU_PLUS` |
| Pro | 9 | +7 | $4 / month | `DISCORD_SKU_PRO` |
| Ultimate | unlimited | — | $10 / month | `DISCORD_SKU_ULTIMATE` |

Free stays at 2, which is what `maxMasterChannels` already defaults to, so a server that never pays
sees exactly what it sees today — and every tier is a total rather than an addition, because a total
is what there is to enforce against. The site quotes the addition, because "seven more than I have"
is the question somebody comparing plans is actually asking.

**Unlimited is `Infinity`**, so `Math.max` and `<` mean what they say and no arithmetic has to know
it is special. It does not survive JSON, which matters at exactly one place - the IPC answer the
dashboard reads - where it is converted to `null` deliberately. `formatMasterChannelAllowance()` is
what every screen prints it through, because the one that does not is the one that shows somebody
the word `Infinity`.

---

## The rows

### The room cap

**`M-01` — one number, in the config.** `maxActiveDynamicChannels`, default `20`, on
`GuildConfigDefaultsInterface` beside `maxMasterChannels`. Guild-wide rather than per generator, for
the same reason the one beside it is: an allowance is a property of what a server is entitled to,
not of how one of its generators was set up.

**`M-02` — counting the live rooms.** `ChannelModel` already links a room to its generator through
`ownerChannelId`, so the count is a `channel.count()` on `ownerChannelId` plus
`internalType: DYNAMIC_CHANNEL`.

Count the rows, not the category. A category holds the generator's own channel and its control
panel as well as its rooms, and it is shared with whatever else an admin put there — measuring it
would make the cap drift with things that are not rooms. The rows are also what the cleanup worker
keeps honest, so a room Discord lost is already not counted.

**`M-03` — the refusal.** In `onJoinMasterChannel()`
([master-channel-service.ts:404](../apps/vertix-bot/src/services/master-channel-service.ts:404)),
before `createDynamicChannel()`: over the cap, no room is made and the member is told, left standing
in the generator.

That handler already refuses people — it rate-limits somebody spinning up rooms too fast and DMs
them a warning — so this is a second reason on a path that has one. The notice belongs with the
existing `ChannelCreateFailedAdapter`, which already distinguishes a full category; this is a second
reason on that embed rather than a screen of its own.

**`M-04` — scaling pools carry it too. Settled: applied.** A pool that can make unlimited rooms is
the obvious way around a per-generator cap, and 20 is already below Discord's ceiling of 50 channels
in a category, so a pool was bounded either way.

Not at the join, though: the check sits inside `createScaledChannel()`, which is the single point
all five of the pool's growth paths funnel through — a join with nowhere to put somebody, the buffer
of empty rooms it keeps ahead of demand, and the first room it is given at setup. One check rather
than five, and a member who joins a pool that still has room is placed in it as normal.

### The entitlement

**`M-05` — the SKUs, in the config.** A table mapping SKU id to the generators it grants, in
`packages/vertix-definitions/src/billing-definitions.ts`: ids from the Discord dashboard, the
allowance each carries, and the free allowance under them. Ids rather than names, because a name is
editable in Discord's dashboard and an id is not.

**`M-06` — reading what a guild has.** An `EntitlementService` on the bot, holding a guild's
allowance and answering from memory rather than asking Discord on every voice join.

Filled two ways. `entitlements.fetch( { guild, excludeEnded: true } )` when a guild is asked about
and nothing is remembered, and the `entitlementCreate` / `entitlementUpdate` / `entitlementDelete`
gateway events, which only *forget* the guild rather than piece its state together — an event can be
missed while the bot is down and an answer read fresh cannot be.

The `entitlements` field on interaction payloads is left unused. It would keep an actively-used
server fresher for free, but it is a second way in to the same cache for a saving the ten-minute
expiry already makes, and reading it wrong is how the two would come to disagree.

**`M-07` — noticing a cancellation, without the event.** `subscriptionUpdate` is the only signal a
cancellation gives, and **discord.js's `Subscription` carries no guild id** — so there is nothing to
invalidate by even if it is listened to. It is not listened to.

What is used instead is the entitlement's own ending time. An answer is cached no longer than the
soonest `endsTimestamp` among the entitlements it was built from, so the allowance drops at the
moment the subscription does whether or not anything announced it. That is strictly better than
reacting to the event: it also survives the bot being down when the event fired.

**`M-08` — what a guild is allowed.** The **higher** of the tier its entitlement grants and whatever
its settings row was granted by hand. A manual grant is what is given to a server for a reason, and
paying should never take something away.

**`M-09` — which generators are the active ones.** The first N by `createdAt`, N being `M-08`.
Nothing is stored and nobody chooses: the same generators stay active on every evaluation, and a
server that pays sees the rest wake up without touching anything.

**`M-10` — a generator past the allowance makes no rooms.** The second refusal in the same place as
`M-03`, with its own wording: the server is over its allowance, this generator is one of the extras,
and here is where to fix it. Rooms already open are left alone — nothing is deleted, nothing is
kicked, and the generator starts working again the moment the entitlement lands.

The control panel goes on answering. Renaming a room that exists is not the thing being sold.

**`M-11` — where a server can see it.** Both the setup screen and the dashboard printed the
allowance already, and both now print the resolved one: every reader of it goes through
`getMaxMasterChannels()`, including the IPC handler the dashboard asks, so the two cannot disagree
about what a server is allowed.

The setup screen's list of generators marks a paused one in its heading. The dashboard is not marked
per generator — it is told the number and greys out the way to make another, which it already did.

**No purchase button yet**, because there is no SKU to point one at. Discord draws the purchase
itself from a `premiumButton` once the SKUs exist, so this is a screen change and not a checkout.

### Tests

**`M-12` — the allowance resolution is a unit test.** Tier plus manual grant, an expired entitlement,
an entitlement ending later today, no entitlement at all. This is where the arithmetic lives and it
needs no Discord.

**`M-13` — not done, and not cheaply doable yet.** The room cap would need twenty rooms opened
against `CHANNEL_OPEN_SPACING_MS`, which is minutes of deliberate waiting for one assertion - the
suite has already had one pass at removing exactly that kind of cost. The entitlement refusal needs
a SKU to hand `createTest()`, and there is none until they are created.

The cheapest honest version, once the SKUs exist: lower `maxActiveDynamicChannels` for the test guild
via its settings row, open three rooms, assert the fourth is refused - and `createTest()` for the
paid path. Left undone rather than written slow and then disabled.

---

## Deliberately not here

- **Deleting anything.** No generator, room or setting is removed for non-payment.
- **Per-user subscriptions.** Choosing guild subscriptions rules them out permanently, for this app.
- **Proration, refunds, dunning.** Discord's, not ours.
- **The dashboard's own paywall.** Editing a generator you already have is not gated.

## Still open

- **The SKUs.** They are created in Discord's dashboard, under Monetization, and their ids go in
  `DISCORD_SKU_PLUS` and `DISCORD_SKU_PRO`. Until then `readBillingTiers()` returns nothing, the bot
  asks Discord about nothing, and every server sits on what it was granted - which is today's
  behaviour exactly.
- **The prices are quoted in two places and charged in one.** A SKU's price is set in Discord's
  dashboard and is not readable back from an entitlement, so a tier repriced there has to be
  repriced in `billing-definitions.ts` too, or the site quotes one figure while the store charges
  another.
- Whether the free tier stays at 2 once there is something to sell.
- `M-13`, once the SKUs exist.

---

## Order of work

Each step leaves the tree working.

1. `M-01`, `M-02`, `M-03` and the notice — the room cap, which needs no payment rail at all and is
   useful on its own.
2. `M-04`, once decided.
3. `M-05` and `M-12` — the tier table and the arithmetic, tested before anything reads Discord.
4. `M-06`, `M-07` — the entitlement service, logging what it resolves and enforcing nothing.
5. `M-08`, `M-09`, `M-10` — enforcement, once the logs from step 4 show the allowances coming out
   right on a live bot.
6. `M-11` — setup and dashboard.
7. `M-13`, and the SKUs created in the Discord dashboard.

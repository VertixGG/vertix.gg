# Billing spec

> **Status: the limits are built; the payment rail is being replaced.** The room cap and the
> enforcement are in `main` and provider-agnostic - they only ever ask how many generators a guild is
> allowed. What is being torn out is where that number comes from: Discord's own subscriptions, which
> **cannot be used from Israel**.

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

## Why not Discord

Discord sells guild subscriptions itself, which is what this was built against. It is not available
to us.

| | |
|---|---|
| Premium Apps are sold from | the US, the EU and the UK only |
| The eligibility checklist | nine rows, **eight green** - the ninth is "payouts set up with a valid payment method in an **eligible country**" |
| Israel | not eligible, so the SKU step never unlocks |

Worth recording because the work was done: the app is verified, team-owned, 2FA'd, has its terms and
privacy links and is not quarantined. Nothing about the app was the problem.

**Stripe is out too**, and for a wider reason - Israel is absent from Stripe's supported countries
entirely, not even in preview. So a direct card integration is not available either.

## Paddle

A merchant of record: it sells to the customer, collects and remits the sales tax, and pays us. That
is what makes it work from here - Paddle sells software businesses anywhere outside its ~29
unsupported countries, and Israel is not one of them.

| | |
|---|---|
| What a tier is | a **price** - `pri_…` - rather than a SKU |
| Attaching a guild to a purchase | `custom_data` on the checkout, which Paddle copies onto the subscription and sends back on every webhook |
| Events | `subscription.created`, `subscription.updated` (the catch-all, including renewals and cancellations), `subscription.canceled`, `subscription.paused`, `subscription.past_due` |
| Status | `active`, `trialing`, `past_due`, `paused`, `canceled` |
| When it runs out | `current_billing_period.ends_at` |
| A cancellation that has not happened yet | `scheduled_change: { action: "cancel", effective_at }` |
| Signature | `Paddle-Signature: ts=…;h1=…`, HMAC-SHA256 over `ts:rawBody`, five second tolerance, compared timing-safe |

**The cancellation design survives the move intact.** Discord fired no entitlement event on
cancellation and the answer was to cache no longer than the entitlement's own ending time. Paddle
says the same thing in its own words - a cancellation is a `scheduled_change` until the period is
up, and `current_billing_period.ends_at` is when it actually stops. Same rule, same field, different
provider.

## The tiers

Numbers to settle; everything below reads them from one place, so changing them is changing one
table.

| tier | generators | on top of free | price | price id |
|---|---|---|---|---|
| Free | 2 | — | — | none |
| Plus | 4 | +2 | $2 / month | `PADDLE_PRICE_PLUS` |
| Pro | 9 | +7 | $4 / month | `PADDLE_PRICE_PRO` |
| Ultimate | unlimited | — | $10 / month | `PADDLE_PRICE_ULTIMATE` |

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

### The subscription

**`M-05` — the tiers name a Paddle price.** The table in
`packages/vertix-definitions/src/billing-definitions.ts` stays as it is; the `skuId` field becomes a
`priceId`, read from the environment for the same reason - a price belongs to one Paddle account and
the sandbox is a different account from the live one.

**`M-14` — a row per subscription.** `Subscription` on the bot schema: the guild it covers, the
Paddle subscription id, the price id it is on, its status, and when the paid period ends. Written
only by the webhook and read only by the service.

Keyed by guild rather than by customer. A customer is a person and may pay for several servers; what
is being sold is an allowance for one server, and that is what has to be looked up on a voice join.

**`M-15` — the webhook.** A route on `vertix-api`, because the bot has no public surface and should
not grow one.

It verifies before it reads: HMAC-SHA256 over `ts:rawBody` with the notification destination's
secret, compared timing-safe, and rejected if `ts` is more than five seconds old. That needs the
**raw** body - a JSON parser that has already run makes the signature unverifiable, so the route
takes the body unparsed.

`subscription.updated` alone would very nearly do, being the catch-all, but `created`, `canceled`,
`paused` and `past_due` are handled as well: they carry the same subscription object, and handling
them is a `switch` rather than a second implementation.

**`M-16` — where a checkout starts.** From the dashboard, which is already logged in with Discord
and already knows which guild is being managed - so the guild id goes into `custom_data` without
anybody being asked "which server is this for?", which is the question Discord's own store would
have had to ask.

A checkout that arrives with no guild id is a purchase nobody can be given anything for. The
dashboard is the only thing that opens one, so that is a bug rather than a case to handle - but it
is logged loudly rather than dropped, because the money is real.

**`M-06` — reading what a guild has.** The same `EntitlementService`, with `readEntitledSkuIds()`
replaced by a read of the row from `M-14`. Everything above it is untouched: the allowance is still
the higher of the grant and the tier, the coverage is still oldest-first, and both refusals are
already written.

A row counts only while it is `active` or `trialing`, and only until `ends_at`. `past_due` is a
payment that failed rather than a subscription that ended, and Paddle retries it - but it is not
paid, so it is not an allowance.

**`M-07` — noticing a cancellation, still without waiting for an event.** The cached answer expires
no later than `ends_at`, exactly as it did against Discord. A cancellation scheduled for the end of
the period changes nothing until then, which is what the customer paid for.

**`M-08`, `M-09`, `M-10`, `M-11` — unchanged.** They never knew where the number came from.

**`M-17` — the Discord entitlement code comes out.** `readEntitledSkuIds()`, the
`entitlementCreate`/`Update`/`Delete` listener and its registration. Left in, it is a second source
of truth that can never be right.

### Tests

**`M-12` — the allowance resolution is a unit test.** Already written and still correct: tier plus
manual grant, an unknown price id, nothing configured to sell. It never knew who was selling.

**`M-18` — the signature check is a unit test.** A body and a secret in, a verdict out: a good
signature, a tampered body, a timestamp six seconds old, a header that is not the right shape. This
is the one piece of new code that money depends on and it needs no network to test.

**`M-13` — still not doable cheaply.** The room cap would need twenty rooms opened against
`CHANNEL_OPEN_SPACING_MS`. The paid path is more testable than it was, though: Paddle has a sandbox,
so a webhook can be replayed at the API without anybody paying anything.

## Deliberately not here

- **Deleting anything.** No generator, room or setting is removed for non-payment.
- **Per-user subscriptions.** Choosing guild subscriptions rules them out permanently, for this app.
- **Proration, refunds, dunning.** Discord's, not ours.
- **The dashboard's own paywall.** Editing a generator you already have is not gated.

## Still open

- **A Paddle account, and three prices in it.** Their ids go in the environment, sandbox first.
- **Prices are quoted in two places and charged in one.** A price set in Paddle is not read back by
  anything here, so a tier repriced there has to be repriced in `billing-definitions.ts` too.
- Whether the free tier stays at 2 once there is something to sell.
- `M-13`, once the sandbox is set up.

---

## Order of work

Each step leaves the tree working.

1. `M-17` — take the Discord entitlement code out, so there is one source of truth at every moment.
2. `M-05`, `M-14` — the price table and the row it is matched against.
3. `M-15`, `M-18` — the webhook and its signature check, logging what it would write and writing
   nothing.
4. Turn the writes on, against the Paddle sandbox.
5. `M-06`, `M-07` — the service reads the row, still enforcing nothing beyond what it enforces today.
6. `M-16` — the dashboard opens a checkout.
7. `M-13`, and the live prices.

**Already done and not repeated here:** the room cap (`M-01` to `M-04`), the enforcement and both
refusals (`M-08` to `M-11`), and the plans page. None of them are affected by the change of
provider - which is the point of the allowance having been one number all along.

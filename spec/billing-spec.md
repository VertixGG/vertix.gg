# Billing spec

> **Status: live since 2026-10-03.** Proven end to end against the Paddle sandbox first - a real
> purchase went through checkout, the webhook, the row and back out as an allowance, and a real
> cancellation was recorded. Production now runs Paddle's live account: the box's `.env` holds the
> live key, webhook secret, client-side token and price, and the website and dashboard are built from
> `.env.production.local`. Paddle approved the account on 2026-10-04, and the first live purchase went
> through that day - checkout, webhook, row and the dashboard's Pro, with working management links.

Two limits, both now enforced:

1. A generator makes at most **20 live rooms** at once.
2. A server's generators past its allowance **stop making rooms** until it pays.

> **What an interaction is and how it reaches a feature is `spec/interactions-spec.md`.** This file
> is about what a server is allowed, and where that is asked.

---

## What exists today

|  | today |
|---|---|
| Generators per guild | `maxMasterChannels`, default **2** — [guild-config.ts](../packages/vertix-data/src/config/guild-config.ts) |
| Rooms per generator | `maxActiveDynamicChannels`, default **20** |
| Where the allowance is decided | [entitlement-service.ts](../apps/vertix-bot/src/services/entitlement-service.ts) — the higher of the grant and the tier paid for |
| Where it is enforced | `onJoinMasterChannel()` and `createScaledChannel()`, both answering through `ChannelCreateFailedAdapter` |
| Payment | **Paddle**, working in sandbox: checkout from the dashboard, signed webhook, `Subscription` row |
| Seeing and cancelling | the dashboard's Subscription page, with Paddle's own hosted pages behind it |
| Discord entitlements | gone — the listener and its registration were removed |

The allowance is asked for on every join rather than cached anywhere, and the row it reads carries
its own expiry, so nothing has to come and tell the bot when a subscription lapses.

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
| Ordering | `occurred_at` on the event. Arrival order is not it — Paddle retries, and a retried older event can land after a newer one |
| Cancel and change-card links | **not on the webhook.** `GET /subscriptions/{id}` only, and not to be stored: they carry temporary tokens |

**Two things about Paddle that had to be learned by looking rather than assuming**, both recorded
here because each cost a wrong implementation:

A checkout fails with a bare `Something went wrong` when the account has no **default payment link**
set, and refuses to save one until the domain it names is approved. Nothing in the failure says so.

`management_urls` is **not in the webhook payload**. A real delivered `subscription.created` carries
`custom_data`, `current_billing_period`, `scheduled_change` and `occurred_at`, and no management
urls at all. They live on the API, behind a key holding `subscription.read` **and** customer portal
session (write) — the second is what makes the link authenticated rather than a bare portal address.

**The cancellation design survives the move intact.** Discord fired no entitlement event on
cancellation and the answer was to cache no longer than the entitlement's own ending time. Paddle
says the same thing in its own words - a cancellation is a `scheduled_change` until the period is
up, and `current_billing_period.ends_at` is when it actually stops. Same rule, same field, different
provider.

## The tiers

One paid plan. Everything below reads it from one place, so changing it is changing one table.

| tier | generators | bot profile in the server | price | price id |
|---|---|---|---|---|
| Free | 2 | the bot's own | — | none |
| Pro | unlimited | its own name, avatar, banner and bio | $4 / month | `PADDLE_PRICE_PRO` |

Monthly only. There is no yearly price, and that is a decision rather than an omission.

**The bot profile is per server.** Discord's `Modify Current Member` scopes it to the one guild, so a
Pro server changes how the bot looks there and nowhere else. It is decided by
`resolveCanBrand()` from the prices paid — a grant raises generators and nothing else — and applied,
swept and taken off again by `GuildBrandingService`. AGENTS.md, "Server Branding (Pro)", has the
parts that bite: two tables because two bots share the database, and the image check before
`editMe()` that is a security boundary rather than a nicety.

Free stays at 2, which is what `maxMasterChannels` already defaults to, so a server that never pays
sees exactly what it sees today — and a tier is a total rather than an addition, because a total is
what there is to enforce against.

**There were three** — Plus (4 generators, $2), Pro (9, $4) and Ultimate (unlimited, $10). They were
folded into one, at Ultimate's allowance and Pro's price, before live billing launched, so no real
payer held Plus or Ultimate. `PADDLE_PRICE_PLUS` and `PADDLE_PRICE_ULTIMATE` are no longer read: a
subscription naming either price is one this deployment does not know, and resolves to no tier —
the grant, and "Unrecognised plan" on the dashboard — exactly as any unknown price already did.
`PADDLE_PRICE_PRO` kept its key and its price, and `?plan=pro` links kept their slug, so nothing
already pointing at Pro moved.

**Unlimited is `Infinity`**, so `Math.max` and `<` mean what they say and no arithmetic has to know
it is special. It does not survive JSON, which matters at exactly one place - the IPC answer the
dashboard reads - where it is converted to `null` deliberately. `formatMasterChannelAllowance()` is
what every screen prints it through, because the one that does not is the one that shows somebody
the word `Infinity`.

---

## The rows

### The room cap

**`M-01` — one number, in the config. Done.** `maxActiveDynamicChannels`, default `20`, on
`GuildConfigDefaultsInterface` beside `maxMasterChannels`. Guild-wide rather than per generator, for
the same reason the one beside it is: an allowance is a property of what a server is entitled to,
not of how one of its generators was set up.

**`M-02` — counting the live rooms. Done.** `ChannelModel` already links a room to its generator through
`ownerChannelId`, so the count is a `channel.count()` on `ownerChannelId` plus
`internalType: DYNAMIC_CHANNEL`.

Count the rows, not the category. A category holds the generator's own channel and its control
panel as well as its rooms, and it is shared with whatever else an admin put there — measuring it
would make the cap drift with things that are not rooms. The rows are also what the cleanup worker
keeps honest, so a room Discord lost is already not counted.

**`M-03` — the refusal. Done.** In `onJoinMasterChannel()`
([master-channel-service.ts:404](../apps/vertix-bot/src/services/master-channel-service.ts:404)),
before `createDynamicChannel()`: over the cap, no room is made and the member is told, left standing
in the generator.

That handler already refuses people — it rate-limits somebody spinning up rooms too fast and DMs
them a warning — so this is a second reason on a path that has one. The notice belongs with the
existing `ChannelCreateFailedAdapter`, which already distinguishes a full category; this is a second
reason on that embed rather than a screen of its own.

**`M-04` — scaling pools carry it too. Done.** A pool that can make unlimited rooms is
the obvious way around a per-generator cap, and 20 is already below Discord's ceiling of 50 channels
in a category, so a pool was bounded either way.

Not at the join, though: the check sits inside `createScaledChannel()`, which is the single point
all five of the pool's growth paths funnel through — a join with nowhere to put somebody, the buffer
of empty rooms it keeps ahead of demand, and the first room it is given at setup. One check rather
than five, and a member who joins a pool that still has room is placed in it as normal.

### The subscription

**`M-05` — the tiers name a Paddle price. Done.** One table in
`packages/vertix-definitions/src/billing-definitions.ts`, price ids read from the environment,
because a price belongs to one Paddle account and the sandbox is a different account from the live
one. A tier whose id is not in the environment is dropped rather than carried with an empty id — an
empty id would match a subscription that names no price and hand the tier to everybody.

**`M-14` — a row per subscription. Done.** `Subscription` on the bot schema, keyed by guild rather
than by customer: a customer is a person and may pay for several servers, and what is sold is an
allowance for one server. Written only by the webhook, read only by the service and the API.

**`M-15` — the webhook. Done.** A route on `vertix-api`, because the bot has no public surface and
should not grow one. It verifies before it reads, over the **raw** body — a JSON parser that has
already run makes the signature unverifiable. A failed write answers 500 so Paddle retries: a
payment that reached us and not the database is the failure somebody discovers by not getting what
they paid for.

**`M-16` — where a checkout starts. Done.** From the dashboard, which is already signed in with
Discord and already knows which guild is open, so the guild id goes into `custom_data` without
anybody being asked which server this is for. **Proven**: a real sandbox purchase came back through
the webhook carrying the right guild id, which was the one assumption nothing else could test.

A checkout arriving with no guild id is a purchase nobody can be given anything for. The dashboard
is the only thing that opens one, so that is a bug rather than a case — logged loudly, because the
money is real.

**`M-06` — reading what a guild has. Done.** The allowance is the higher of the grant and the tier
paid for; the coverage is oldest-first. A grant is given for a reason and paying should not be able
to take it away.

Creating a generator asks the same question. `createMasterChannel()` used to ask the grant, while
the setup screen in front of it asked the entitlement - so a server paying for Pro was shown the
wizard and refused at its last step, and the dashboard's create, which does not wait for the bot's
answer, reported that refusal as a success. `isReachedMasterLimit()` now takes the limit from its
caller rather than falling back to the grant. Three tests pin it; putting the grant back fails the
one where a Pro server creates past the free two.

**`M-07` — noticing a cancellation without waiting for an event. Done.** The period already paid for
decides it *before* the status does, so a cancelled subscription runs out on its own and no event
has to arrive to end it. The status is the fallback for a row with no period, and it errs generous:
a renewal whose event went missing leaves `active` against a stale date, and the strict reading
would take a plan from somebody who is paying.

**`M-17` — the Discord entitlement code comes out. Done.** A source of truth that can never be right
is worse than none.

**`M-19` — a late event cannot undo a newer one. Done.** The row is replaced wholesale, which is
what makes a repeated delivery harmless — Paddle sends the entire subscription every time, not a
diff. What a wholesale replace does not survive is a *delayed* event: a retry of an older one
landing after a newer one would bring a cancelled subscription back to life. Decided on
`occurred_at`, never on arrival. Equal timestamps are applied (the same event twice, and the write
is idempotent); an event carrying no timestamp is applied too, because refusing on missing ordering
information would lose a real subscription to a shape nobody predicted.

**`M-20` — the management links are fetched, never stored. Done.** See the correction above: they
are not on the webhook, and Paddle says not to keep them. A stored one is a link that stops working
at a moment nobody chose, on the screen somebody is using to stop paying. Without `PADDLE_API_KEY`
the lookup answers nulls and the buttons are simply not offered; a failed lookup is logged rather
than raised, because the plan, the renewal date and the allowance are all still true without it.

**`M-21` — a guild can only be acted on by somebody who owns it. Done.** The guild routes were never
missing a check — they compare their url's `guildId` against `session.selectedGuild`. What they
rested on was a value the caller picked: `POST /auth/select-guild` wrote that straight out of the
request body. Selection now asks Discord, and the stored name and icon come from Discord's answer
rather than the body, since they are drawn in the sidebar.

The owned-guild list is cached on the session for five minutes, and the listing route fills it —
Discord rate limits `/users/@me/guilds`, and listing then selecting is two calls inside a second.
When Discord cannot be reached at all, a list up to an hour old is used rather than failing.

**`M-22` — a server can see what it pays for. Done.** `GET /subscription/:guildId`, guarded by
ownership, answering the plan, the renewal or cancellation date, the allowance already spelled the
way a screen prints it, and Paddle's management links. The dashboard draws it as **Subscription** in
the sidebar; arriving with `?plan=…` opens that checkout unless the server already holds it.

The allowance crosses the wire as words rather than a number because Pro is `Infinity`,
`JSON.stringify` turns that into `null`, and a number meaning unlimited is indistinguishable from
one meaning nothing was found.

### Tests

**`M-12` — the allowance resolution. Done.** Tier plus manual grant, an unknown price id, a retired
one whose key is still in the environment, Pro with no ceiling, nothing configured to sell, and the
entitling rule: a cancelled subscription lasting out its period and stopping after, a stale
`active` still honoured.

**`M-18` — the signature check. Done.** A body and a secret in, a verdict out: a good signature, a
tampered body, a timestamp six seconds old, a header that is not the right shape, and a body that
was parsed and re-serialised on the way in — the mistake a JSON body parser makes for you.

**`M-23` — the allowance reaches the right generators. Done.** Sixteen tests over
`EntitlementService`, which had no coverage at all while the money path had plenty. The ordering is
the part worth pinning: the oldest keep working and the extras stop, nobody chooses and nothing is
stored, so an allowance that reaches the wrong generators is worse than one that reaches none.
Checked by breaking it — swapping `slice( 0, allowed )` for `slice( -allowed )` fails five of them.

**`M-13` — the room cap. Done, and not the way it was scoped.** This was written off as too
expensive because an end-to-end version needs twenty rooms opened against
`CHANNEL_OPEN_SPACING_MS`. That is still true, and it was the wrong thing to measure: the rule is
two questions asked in a particular order, and neither of them needs a room to exist.

The decision moved out of `onJoinMasterChannel` into `findChannelCreateRefusal` — two hundred lines
of Discord state were the reason it looked untestable, and none of that is what decides this.
Eight tests: the twentieth room still made and the twenty-first refused, the guild's own limit
carried rather than the default, and the plan refused ahead of the cap when both are true — checked
by asking whether the rooms were counted at all, which they are not.

Checked by breaking it twice. `>=` to `>` fails two; asking the cap before the plan fails two.

**`M-24` — `vertix-api` has a test harness. Done.** It had none at all, which was fine while it was
routes over a database and stopped being fine when the thing deciding whether you may act on
somebody else's server started living there. Registered in **both** runners, because a package in
neither passes by never running.

Twenty-four tests. Ownership refused for a guild somebody is only a member of; a stale sign-in
reported as its own outcome rather than a refusal; the five-minute list answering without touching
Discord, and the hour-long stale window used when Discord cannot be reached and not used past it.
Checked by dropping the `owner` filter — treating membership as ownership, which is the actual
vulnerability — which fails four.

## Deliberately not here

- **Deleting anything.** No generator, room or setting is removed for non-payment.
- **Per-user subscriptions.** Choosing guild subscriptions rules them out permanently, for this app.
- **Proration, refunds, dunning.** Paddle's, not ours.
- **The dashboard's own paywall.** Editing a generator you already have is not gated, and neither is
  the interface editor. The bot profile is the one thing on the dashboard that needs Pro.

## Still open

**Live since 2026-10-03.** Going live took no code beyond the build's environment (below). What was
set, and what is still open:

| | state |
|---|---|
| Seller verification — identity | done (Sumsub verified 2026-10-03) |
| Payouts — a bank account or Payoneer | **open, the owner's**: nothing is paid out until it is set |
| Domain approval | `voicechannels.online` approved; the checkout runs on its `/checkout`, because `dashboard.` was refused |
| The default payment link | `https://voicechannels.online/pricing` |
| The live catalogue | Pro $4/month `pri_01m3278jhg48qzf6t9pb0akmfg`; Plus and Ultimate archived |
| The notification destination | `https://api.voicechannels.online/api/webhooks/paddle`, the five subscription events |
| The live API key | `subscription.read`, `customer_portal_session.write`, plus `notification_setting.read` and `client_token.read` so the go-live script could read the webhook secret and the token with it. **Expires 2027-10-03** - replace it before then, or the cancel and change-card links quietly disappear |
| The box's `.env` | the five `PADDLE_*` values live, `PADDLE_PRICE_PLUS` and `PADDLE_PRICE_ULTIMATE` dropped, the sandbox file kept in `~/vertix-env-backups/` |
| The api **and both bot shards** restarted | the bots read `PADDLE_PRICE_PRO` too - an allowance is a price id the bot recognises |
| Paddle's own account review | done 2026-10-04. Until then every live checkout failed with `transaction_checkout_not_enabled` ("Something went wrong") |
| A first live purchase | done 2026-10-04 with a single-use 100%-off code (since archived): `subscription.created recorded`, the row on the live price, Pro on the dashboard. Paddle asks for a card or PayPal even at $0 due today |
| A first live cancellation | **open** |

**The website and dashboard are built with live values the dev servers never see.** They come from
`.env.production.local` at the repo root - git-ignored, written on the machine that deploys - which
`scripts/base-deploy.js` hands to the build as its environment. Vite cannot be left to find it: bun
copies `.env` into every process it starts, and `loadEnv()` with an empty prefix lets the environment
win over every file, so the sandbox values would beat it. A deploy without that file refuses to run,
because the build it would make opens Paddle's sandbox checkout in production.

**The dashboard's price id is baked in at build time**, through vite `define`, so a change of the
price is not complete until the dashboard is rebuilt and redeployed. A config-only change leaves the
old price id in the bundle.

Also open:

- **Prices are charged in one place and quoted from another.** Nothing reads Paddle's number back,
  so a tier repriced there has to be repriced in `billing-definitions.ts` too. The pricing page, the
  comparison post and the dashboard read that table; two places cannot and quote it by hand - the
  `/pricing` description in the website's `site-meta.ts`, which the sitemap step imports as plain
  data, and the dashboard's no-script `index.html`.
- The one sandbox subscription row, the VoiceChannels server's, stopped granting at the cutover and
  was replaced by that server's live purchase on 2026-10-04 - the row is one per guild.
- Archiving Plus and Ultimate's prices in the sandbox catalogue too (the live ones are archived).
  Nothing here sells them any more, and a subscription naming one resolves to no tier.
- Whether the free tier stays at 2 once there is something to sell.
- Resuming a scheduled cancellation. Buying the same plan again would create a *second* subscription
  and charge for it immediately; resuming is `scheduled_change: null` and needs `subscription.write`.
  Until then, `?plan=…` deliberately does not auto-open a checkout for a plan already held.

---

## Order of work

Steps 1 to 7 are done — the Discord code out, the price table and row, the webhook and its signature
check, the writes turned on against the sandbox, the service reading the row, the dashboard opening
a checkout, and the sandbox purchase that proved `custom_data` survives the trip.

The cutover to live is done too (2026-10-03): verification, the default payment link, the live API
key, the swapped environment, the api and both bot shards restarted, and both sites rebuilt.

What is left, in order:

1. Payouts.
2. A real cancellation on live (the purchase is done).
**Already done and not repeated here:** the room cap (`M-01` to `M-04`), the enforcement and both
refusals (`M-08` to `M-11`), and the plans page. None of them were affected by the change of
provider — which is the point of the allowance having been one number all along.

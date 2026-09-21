import ReactMarkdown from "react-markdown";

import { BILLING_FREE_MAX_MASTER_CHANNELS } from "@vertix.gg/definitions/src/billing-definitions";

/**
 * What happens when somebody wants their money back.
 *
 * Its own page because paddle asks for one before it will approve a domain to sell from, and
 * because the two policies already here are about using the bot rather than paying for it.
 *
 * The free allowance is interpolated rather than written out: it is quoted on the pricing page and
 * enforced by the bot from the same constant, and a refund policy stating a third number would be
 * the one people read after deciding to stop paying.
 */
const markdown = `
# Refund Policy

This policy covers the paid plans for VoiceChannels. Using the bot for free is not affected by
anything here.

## 1. Who you are buying from

Our order process is conducted by our online reseller **Paddle.com**, which is the Merchant of
Record for all our orders. Paddle provides all customer service enquiries and handles returns.
Your receipt and your card or bank statement will show Paddle rather than VoiceChannels.

## 2. Refunds

If a plan is not what you expected, you may request a full refund **within 14 days** of the
payment. You do not need to give a reason.

Refunds are returned to the original payment method. The time it takes to appear is set by your
bank, not by us.

## 3. Cancelling

You can cancel at any time from the Plans page in the dashboard. Cancelling stops the next
payment; it does not end the plan immediately.

A cancelled plan keeps working until the end of the period already paid for. We do not refund the
unused remainder of a period outside the 14 day window above, because the plan continues to work
for the whole of it.

## 4. What happens to your server afterwards

**Nothing is ever deleted.** When a plan ends, the server returns to the free allowance of
${ BILLING_FREE_MAX_MASTER_CHANNELS } generators. The generators that were set up first keep
working, and any beyond the free allowance stop making new rooms until you subscribe again, at
which point they start again on their own. Rooms that already exist are left alone.

## 5. Failed, duplicated or unrecognised charges

If you have been charged twice, charged after cancelling, or charged for something you do not
recognise, contact us and we will refund it in full. This is not limited to 14 days.

## 6. How to ask

Either route reaches us:

- Paddle buyer support, via the link on your receipt
- [VoiceChannels Support](https://discord.gg/dEwKeQefUU) on Discord

Please include the email address used for the purchase, or your Discord server id.

## 7. Your statutory rights

If you are a consumer in the EU or the UK, you have a statutory right to cancel a purchase within
14 days. This policy is in addition to those rights and does not limit them.
`;

export default function RefundPolicy() {
    return (
        <div className="vc-container vc-page-panel">
            <ReactMarkdown children={ markdown }/>
        </div>
    );
}

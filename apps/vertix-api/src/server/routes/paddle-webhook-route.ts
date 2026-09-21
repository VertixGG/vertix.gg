import process from "process";

import { verifyPaddleSignature } from "@vertix.gg/utils/src/paddle-signature";

import { API_ROUTES } from "@vertix.gg/api/src/server/constants";

import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";

/**
 * What paddle sends, as much of it as this cares about.
 *
 * Deliberately partial. Paddle's payload is large and grows, and a shape written out in full here
 * would be a second copy of their schema to keep in step - these are the fields an allowance is
 * decided from and nothing else.
 */
interface IPaddleSubscriptionEvent {
    event_type: string;
    data?: {
        id?: string;
        status?: string;
        customer_id?: string;
        custom_data?: { guildId?: string } | null;
        items?: Array<{ price?: { id?: string } }>;
        current_billing_period?: { ends_at?: string } | null;
        scheduled_change?: { action?: string; effective_at?: string } | null;
    };
}

/** The events that say something about whether a server is paid up. */
const SUBSCRIPTION_EVENTS = new Set( [
    "subscription.created",
    "subscription.updated",
    "subscription.canceled",
    "subscription.paused",
    "subscription.past_due"
] );

/**
 * Function readSubscription() :: The allowance-deciding half of a paddle event.
 *
 * A subscription carries its items as a list because paddle allows several prices on one; this takes
 * the first, since what is sold here is one plan and a second price on it would be a thing nobody
 * set up.
 */
function readSubscription( event: IPaddleSubscriptionEvent ) {
    const data = event.data ?? {};

    const scheduledCancel = "cancel" === data.scheduled_change?.action
        ? data.scheduled_change?.effective_at ?? null
        : null;

    return {
        guildId: data.custom_data?.guildId ?? null,
        paddleSubscriptionId: data.id ?? null,
        paddleCustomerId: data.customer_id ?? null,
        priceId: data.items?.[ 0 ]?.price?.id ?? null,
        status: data.status ?? null,
        currentPeriodEnd: data.current_billing_period?.ends_at ?? null,
        scheduledToCancelAt: scheduledCancel
    };
}

/**
 * Paddle telling us what a server has paid for.
 *
 * On the api rather than the bot because the bot has no public surface and should not grow one to
 * receive this. What it learns is written where the bot reads it.
 *
 * **Nothing is written yet.** This is the half that can be got wrong quietly - a signature check
 * that passes everything, a field read from the wrong place - so it runs first against the paddle
 * sandbox and says what it would have written. The writes go in once the log shows the right thing.
 */
const paddleWebhookRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    /**
     * The body, exactly as it arrived.
     *
     * A signature is made over the bytes paddle sent, so a body that has been through a json parser
     * and back cannot be verified however correct it looks - the key order and the spacing would be
     * ours rather than theirs. Registered inside this plugin, so every other route on the api goes
     * on receiving parsed json as before.
     */
    fastify.addContentTypeParser(
        "application/json",
        { parseAs: "string" },
        ( _request: FastifyRequest, body: string, done ) => done( null, body )
    );

    fastify.post( API_ROUTES.PADDLE_WEBHOOK, async( request, reply ) => {
        const secret = process.env.PADDLE_WEBHOOK_SECRET ?? "";

        if ( ! secret.length ) {
            request.log.error( "Paddle webhook arrived with no PADDLE_WEBHOOK_SECRET configured" );

            // Not an error paddle can do anything about, and answering 200 would have it stop
            // retrying something we would want once the secret is set.
            return reply.code( 503 ).send( { error: "not configured" } );
        }

        const rawBody = "string" === typeof request.body ? request.body : "";

        const signature = verifyPaddleSignature( {
            header: request.headers[ "paddle-signature" ] as string | undefined,
            rawBody,
            secret
        } );

        if ( ! signature.isValid ) {
            request.log.warn( `Paddle webhook refused: ${ signature.reason }` );

            // The reason stays in the log. Told which of the three it was, somebody guessing learns
            // whether they have the secret wrong or only the clock.
            return reply.code( 401 ).send( { error: "invalid signature" } );
        }

        let event: IPaddleSubscriptionEvent;

        try {
            event = JSON.parse( rawBody ) as IPaddleSubscriptionEvent;
        } catch {
            request.log.warn( "Paddle webhook signed correctly but its body is not json" );

            return reply.code( 400 ).send( { error: "malformed body" } );
        }

        if ( ! SUBSCRIPTION_EVENTS.has( event.event_type ) ) {
            // Paddle sends more than this asked for, and an event we do not act on is not a
            // failure - answered 200 so it is not retried for ever.
            request.log.info( `Paddle webhook ignored: ${ event.event_type }` );

            return reply.send( { ok: true } );
        }

        const subscription = readSubscription( event );

        if ( ! subscription.guildId ) {
            // A purchase nobody can be given anything for. The dashboard is the only thing that
            // opens a checkout and it always attaches the guild, so this is a bug rather than a
            // case - logged loudly because the money is real.
            request.log.error(
                `Paddle ${ event.event_type } carries no guildId - subscription ` +
                `'${ subscription.paddleSubscriptionId }' cannot be applied to any server`
            );

            return reply.send( { ok: true } );
        }

        request.log.info(
            `Paddle ${ event.event_type } would write: guild '${ subscription.guildId }' ` +
            `subscription '${ subscription.paddleSubscriptionId }' price '${ subscription.priceId }' ` +
            `status '${ subscription.status }' until '${ subscription.currentPeriodEnd }'` +
            ( subscription.scheduledToCancelAt ? ` cancelling at '${ subscription.scheduledToCancelAt }'` : "" )
        );

        return reply.send( { ok: true } );
    } );
};

export default paddleWebhookRoutePlugin;

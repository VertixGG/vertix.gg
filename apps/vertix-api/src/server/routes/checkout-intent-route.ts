import process from "process";

import { readBillingTiers } from "@vertix.gg/definitions/src/billing-definitions";

import { API_ROUTES, HTTP_STATUS } from "@vertix.gg/api/src/server/constants";

import { requireGuildOwner } from "@vertix.gg/api/src/server/middleware/guild-access";

import {
    mintCheckoutIntent,
    readCheckoutIntent
} from "@vertix.gg/api/src/server/services/checkout-intent-service";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

const WEBSITE_URL = process.env.WEBSITE_URL || "https://voicechannels.online";

interface CreateParams {
    guildId: string;
}

interface CreateBody {
    slug?: string;
}

interface ReadQuery {
    token?: string;
}

async function handleCreateCheckoutIntent(
    request: FastifyRequest<{ Params: CreateParams; Body: CreateBody }>,
    reply: FastifyReply
) {
    const { guildId } = request.params;

    if ( ! await requireGuildOwner( request, reply, guildId ) ) {
        return reply;
    }

    try {
        const slug = request.body?.slug?.trim();
        const tier = readBillingTiers( process.env ).find( ( candidate ) => candidate.slug === slug );

        if ( ! tier ) {
            return reply.status( HTTP_STATUS.BAD_REQUEST ).send( { error: "Unknown plan" } );
        }

        const token = mintCheckoutIntent( guildId, tier.priceId, tier.slug );

        return {
            token,
            checkoutUrl: `${ WEBSITE_URL }/checkout?token=${ encodeURIComponent( token ) }`
        };
    } catch( error ) {
        handleError( handleCreateCheckoutIntent, error, reply, "Failed to start the checkout" );
    }
}

async function handleReadCheckoutIntent(
    request: FastifyRequest<{ Querystring: ReadQuery }>,
    reply: FastifyReply
) {
    const intent = readCheckoutIntent( request.query?.token?.trim() ?? "" );

    if ( ! intent ) {
        // One answer for expired, tampered with and absent. The page that asks can only do one
        // thing about any of them, which is send the person back to pick the plan again.
        return reply.status( HTTP_STATUS.BAD_REQUEST ).send( { error: "This checkout link is no longer valid" } );
    }

    return {
        guildId: intent.guildId,
        priceId: intent.priceId,
        slug: intent.slug
    };
}

/**
 * Hands a checkout from the dashboard to the site that is allowed to open one.
 *
 * Paddle approves the domains a checkout may be launched from, and it approved the marketing site
 * rather than the dashboard's subdomain. The dashboard is still where a plan is chosen - it knows
 * who is signed in and which server they own - so it asks here for a token saying so, and the site
 * exchanges that token for the guild and price it should open. Nothing about the guild is taken
 * from the address bar on the way.
 *
 * Minting needs the session and the guild's owner. Reading needs neither: the token is the proof,
 * and the site holding one has no session to offer.
 */
export const checkoutIntentCreateRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.post( API_ROUTES.CHECKOUT_INTENT_CREATE, handleCreateCheckoutIntent );
};

/**
 * Registered outside the authenticated group, deliberately.
 *
 * The site redeeming a token is a different origin with no session to send, which is the whole
 * reason the token exists - requiring one here would mean nothing could ever read it.
 */
export const checkoutIntentReadRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get( API_ROUTES.CHECKOUT_INTENT_READ, handleReadCheckoutIntent );
};

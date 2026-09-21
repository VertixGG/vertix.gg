import process from "process";

import {
    formatMasterChannelAllowance,
    isSubscriptionEntitling,
    readBillingTiers
} from "@vertix.gg/definitions/src/billing-definitions";

import { SubscriptionModel } from "@vertix.gg/data/src/models/subscription-model";

import { API_ROUTES } from "@vertix.gg/api/src/server/constants";

import { requireGuildOwner } from "@vertix.gg/api/src/server/middleware/guild-access";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

interface GuildParams {
    guildId: string;
}

async function handleGetSubscription(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    const { guildId } = request.params;

    if ( ! await requireGuildOwner( request, reply, guildId ) ) {
        return reply;
    }

    try {
        const subscription = await SubscriptionModel.$.get( guildId );

        if ( ! subscription ) {
            // Not an error. Most servers have never bought anything, and the screen that asks this
            // needs to tell "nothing bought" apart from "we could not find out".
            return { subscription: null };
        }

        const tier = readBillingTiers( process.env )
            .find( ( candidate ) => candidate.priceId === subscription.priceId ) ?? null;

        return {
            subscription: {
                planName: tier?.name ?? null,
                planSlug: tier?.slug ?? null,

                /**
                 * Already the words a screen prints - `Unlimited` or a number - because the top
                 * tier's allowance is `Infinity`, and `JSON.stringify` turns that into `null`
                 * silently. Converted here deliberately rather than discovered on the other side.
                 */
                allowance: tier ? formatMasterChannelAllowance( tier.maxMasterChannels ) : null,

                status: subscription.status,
                isEntitling: isSubscriptionEntitling( subscription ),
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
                scheduledToCancelAt: subscription.scheduledToCancelAt?.toISOString() ?? null,
                updatePaymentMethodUrl: subscription.updatePaymentMethodUrl,
                cancelUrl: subscription.cancelUrl
            }
        };
    } catch( error ) {
        handleError( handleGetSubscription, error, reply, "Failed to fetch subscription" );
    }
}

/**
 * What a server is paying for, for the server's owner.
 *
 * Read from our own row rather than from paddle, so the screen does not wait on somebody else's
 * api - and so it says the same thing the bot is acting on, which is the row, not paddle.
 *
 * Carries paddle's hosted management pages. Those need no further authentication of their own, so
 * anybody holding one can cancel or change a card: this route is the thing standing in front of
 * them, which is why it asks discord who owns the guild rather than trusting the id in the url.
 */
const subscriptionRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get( API_ROUTES.SUBSCRIPTION, handleGetSubscription );
};

export default subscriptionRoutePlugin;

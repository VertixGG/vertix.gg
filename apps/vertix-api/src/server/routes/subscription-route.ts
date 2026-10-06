import process from "process";

import {
    BILLING_TRIAL_START_REFUSALS,
    formatMasterChannelAllowance,
    isSubscriptionEntitling,
    isTrialRunning,
    readBillingTiers,
    resolveTrialEndsAt,
    resolveTrialStartRefusal,
    resolveTrialTier
} from "@vertix.gg/definitions/src/billing-definitions";

import { GuildModel } from "@vertix.gg/data/src/models/guild-model";
import { SubscriptionModel } from "@vertix.gg/data/src/models/subscription-model";

import { API_ROUTES, HTTP_STATUS } from "@vertix.gg/api/src/server/constants";

import { requireGuildOwner } from "@vertix.gg/api/src/server/middleware/guild-access";

import { fetchManagementUrls } from "@vertix.gg/api/src/server/services/paddle-api-service";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

interface GuildParams {
    guildId: string;
}

/**
 * Function toTrial() :: A server's free trial as the screen prints it, or null if it never had one.
 *
 * Null as well where this deployment sells no tier with a trial, because the bot then holds the
 * server to nothing by it - a screen promising a trial the bot is not honouring would be the one
 * place the two disagree.
 */
function toTrial( trialEndsAt: Date | null, tiers: ReturnType<typeof readBillingTiers> ) {
    const tier = resolveTrialTier( tiers );

    if ( ! trialEndsAt || ! tier ) {
        return null;
    }

    return {
        planName: tier.name,
        allowance: formatMasterChannelAllowance( tier.maxMasterChannels ),
        endsAt: trialEndsAt.toISOString(),
        isRunning: isTrialRunning( trialEndsAt )
    };
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
        const [ subscription, guild ] = await Promise.all( [
            SubscriptionModel.$.get( guildId ),
            GuildModel.$.get( guildId )
        ] );

        const tiers = readBillingTiers( process.env );

        const trial = toTrial( guild?.trialEndsAt ?? null, tiers );

        if ( ! subscription ) {
            // Not an error. Most servers have never bought anything, and the screen that asks this
            // needs to tell "nothing bought" apart from "we could not find out".
            return { subscription: null, trial };
        }

        const tier = tiers.find( ( candidate ) => candidate.priceId === subscription.priceId ) ?? null;

        // Fetched live, never stored - paddle's links carry temporary tokens. Its failure is not
        // this route's failure: the plan, the renewal date and the allowance are all still true
        // without them, and losing the whole answer would be the worse trade.
        let management = { updatePaymentMethodUrl: null as string | null, cancelUrl: null as string | null };

        try {
            management = await fetchManagementUrls( subscription.paddleSubscriptionId );
        } catch( error ) {
            request.log.warn(
                error,
                `Could not fetch paddle management urls for guild '${ guildId }' - the plan is shown without them`
            );
        }

        return {
            subscription: {
                planName: tier?.name ?? null,
                planSlug: tier?.slug ?? null,

                /**
                 * Already the words a screen prints - `Unlimited` or a number - because Pro's
                 * allowance is `Infinity`, and `JSON.stringify` turns that into `null` silently.
                 * Converted here deliberately rather than discovered on the other side.
                 */
                allowance: tier ? formatMasterChannelAllowance( tier.maxMasterChannels ) : null,

                status: subscription.status,
                isEntitling: isSubscriptionEntitling( subscription ),
                currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
                scheduledToCancelAt: subscription.scheduledToCancelAt?.toISOString() ?? null,
                updatePaymentMethodUrl: management.updatePaymentMethodUrl,
                cancelUrl: management.cancelUrl
            },
            trial
        };
    } catch( error ) {
        handleError( handleGetSubscription, error, reply, "Failed to fetch subscription" );
    }
}

/**
 * Function handleStartTrial() :: Start a server's free trial, for its owner, if it can have one.
 *
 * The owner asks for it from the dashboard; nothing the bot sees starts one. Refused with the
 * reason, which the dashboard says back - and a refusal is a conflict rather than a failure, since
 * asking again changes nothing. The write itself still refuses a second trial, so two presses at
 * once start one.
 */
async function handleStartTrial(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    const { guildId } = request.params;

    if ( ! await requireGuildOwner( request, reply, guildId ) ) {
        return reply;
    }

    try {
        const [ subscription, guild ] = await Promise.all( [
            SubscriptionModel.$.get( guildId ),
            GuildModel.$.get( guildId )
        ] );

        const tiers = readBillingTiers( process.env );

        const refusal = resolveTrialStartRefusal( {
            tiers,
            paidPriceIds: subscription && isSubscriptionEntitling( subscription ) ? [ subscription.priceId ] : [],
            trialEndsAt: guild?.trialEndsAt ?? null,
            isBotInServer: true === guild?.isInGuild
        } );

        const endsAt = resolveTrialEndsAt( { startedAt: new Date(), tiers } );

        if ( refusal || ! endsAt ) {
            return reply.status( HTTP_STATUS.CONFLICT ).send( { error: refusal ?? BILLING_TRIAL_START_REFUSALS.NOT_OFFERED } );
        }

        if ( ! await GuildModel.$.startTrial( guildId, endsAt ) ) {
            return reply.status( HTTP_STATUS.CONFLICT ).send( { error: BILLING_TRIAL_START_REFUSALS.ALREADY_USED } );
        }

        request.log.info( `Guild '${ guildId }' - free trial started by its owner, runs until '${ endsAt.toISOString() }'` );

        return { trial: toTrial( endsAt, tiers ) };
    } catch( error ) {
        handleError( handleStartTrial, error, reply, "Failed to start the trial" );
    }
}

/**
 * What a server is paying for, and the free trial it is on or has had, for the server's owner.
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
    fastify.post( API_ROUTES.SUBSCRIPTION_TRIAL, handleStartTrial );
};

export default subscriptionRoutePlugin;

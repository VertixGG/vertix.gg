import process from "process";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import { readBillingTiers, resolveMaxMasterChannels } from "@vertix.gg/definitions/src/billing-definitions";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

/**
 * How long an answer from discord is trusted before it is asked for again.
 *
 * Ten minutes rather than a request per voice join: a busy generator is joined many times a minute
 * and an allowance changes a few times in a server's life. An entitlement that ends sooner than
 * this shortens it - see `readEntitledSkuIds()`.
 */
const ENTITLEMENT_CACHE_MS = 10 * 60 * 1000;

interface IEntitlementCacheEntry {
    skuIds: string[];
    expiresAt: number;
}

/**
 * What a server is allowed, and which of its generators that reaches.
 *
 * Discord is the only place an entitlement lives - nothing here is written down, and there is no
 * subscription of our own to reconcile with. What this adds is remembering the answer, because the
 * question is asked on every join of every generator and answered by an http request.
 *
 * **A cancellation arrives as no event at all.** Discord's own documentation is explicit: cancelling
 * fires `SUBSCRIPTION_UPDATE` and nothing on the entitlement until the period actually runs out, and
 * a `Subscription` carries no guild id to invalidate by. So expiry is not waited for as an event -
 * an entitlement carries the moment it ends, and an answer is cached no longer than that. The
 * allowance drops when the subscription does, whether or not anything told us.
 */
export class EntitlementService extends ServiceWithDependenciesBase<{
    appService: AppService;
}> {
    private readonly debugger: Debugger;

    private readonly tiers: IBillingTier[];

    private readonly cache = new Map<string, IEntitlementCacheEntry>();

    public static getName() {
        return "VertixBot/Services/Entitlement";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", EntitlementService.getName() ) );

        this.tiers = readBillingTiers( process.env );

        this.debugger.log(
            this.constructor,
            `Selling ${ this.tiers.length } tier(s): ${ this.tiers.map( ( tier ) => tier.name ).join( ", " ) || "none" }`
        );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App"
        };
    }

    /**
     * Function getMaxMasterChannels() :: How many generators this guild may have.
     *
     * The one place the question is answered, so the bot's own refusal, the setup screen and the
     * dashboard cannot disagree about what a server is allowed.
     */
    public async getMaxMasterChannels( guildId: string ): Promise<number> {
        const granted = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels;

        // Nothing to sell means nothing to ask discord about, which is also the state every
        // deployment is in until the SKUs exist.
        if ( ! this.tiers.length ) {
            return granted;
        }

        return resolveMaxMasterChannels( {
            granted,
            entitledSkuIds: await this.readEntitledSkuIds( guildId ),
            tiers: this.tiers
        } );
    }

    /**
     * Function isMasterChannelCovered() :: Whether this generator is one the allowance reaches.
     *
     * The oldest generators keep working, and the ones past the allowance are the extras. Nobody
     * chooses and nothing is stored: a server that pays sees the rest wake up without touching
     * anything, and one that lapses loses the newest rather than whichever it last looked at.
     *
     * `masterChannelDbId` is the row id, which is what both kinds of generator have in common -
     * their rooms disagree about which id they store, but the row itself does not.
     */
    public async isMasterChannelCovered( guildId: string, masterChannelDbId: string ): Promise<boolean> {
        const covered = await this.getCoveredMasterChannelIds( guildId );

        // Null is a guild inside its allowance, where every generator is covered and the order was
        // never worth reading - the overwhelmingly common case.
        return null === covered || covered.has( masterChannelDbId );
    }

    /**
     * Function getCoveredMasterChannelIds() :: The generators the allowance reaches, or null for all.
     *
     * Null rather than a set of everything, so a caller marking a list can tell "this server is
     * inside its allowance" from "these particular ones are covered" without counting.
     */
    public async getCoveredMasterChannelIds( guildId: string ): Promise<Set<string> | null> {
        const allowed = await this.getMaxMasterChannels( guildId );

        const ordered = await ChannelModel.$.getMasterIdsByCreation( guildId );

        if ( ordered.length <= allowed ) {
            return null;
        }

        return new Set( ordered.slice( 0, allowed ) );
    }

    /**
     * Function forget() :: Drops what was remembered about a guild.
     *
     * Called when discord says an entitlement changed, so a server that has just paid is not left
     * waiting out the cache before its generators come back.
     */
    public forget( guildId: string ) {
        this.cache.delete( guildId );

        this.debugger.log( this.forget, `Guild id: '${ guildId }' - Forgot the cached entitlements` );
    }

    /**
     * Function readEntitledSkuIds() :: The SKUs this guild holds, remembered.
     *
     * Ended entitlements are excluded by discord, and what comes back is trusted only as far as the
     * soonest of them ends - so the moment a subscription lapses is the moment the answer is asked
     * for again, without an event saying so.
     *
     * A failure answers with nothing held rather than throwing. The caller is a member joining a
     * voice channel, and a server that pays should not lose its generators because discord was
     * briefly unreachable - which is why the grant, resolved above, is the floor.
     */
    private async readEntitledSkuIds( guildId: string ): Promise<string[]> {
        const cached = this.cache.get( guildId );

        if ( cached && cached.expiresAt > Date.now() ) {
            return cached.skuIds;
        }

        const application = this.services.appService.getClient().application;

        if ( ! application ) {
            return [];
        }

        try {
            const entitlements = await application.entitlements.fetch( {
                guild: guildId,
                excludeEnded: true,
                cache: false
            } );

            const active = [ ...entitlements.values() ].filter( ( entitlement ) => entitlement.isActive() );

            const endsAt = active
                .map( ( entitlement ) => entitlement.endsTimestamp )
                .filter( ( timestamp ): timestamp is number => null !== timestamp && undefined !== timestamp );

            const skuIds = active.map( ( entitlement ) => entitlement.skuId );

            this.cache.set( guildId, {
                skuIds,
                expiresAt: Math.min( Date.now() + ENTITLEMENT_CACHE_MS, ...endsAt )
            } );

            this.debugger.log(
                this.readEntitledSkuIds,
                `Guild id: '${ guildId }' - Holds ${ skuIds.length } entitlement(s): ${ skuIds.join( ", " ) || "none" }`
            );

            return skuIds;
        } catch( error ) {
            this.logger.warn(
                this.readEntitledSkuIds,
                `Guild id: '${ guildId }' - Could not read entitlements, treating it as holding none`,
                error
            );

            return [];
        }
    }
}

export default EntitlementService;

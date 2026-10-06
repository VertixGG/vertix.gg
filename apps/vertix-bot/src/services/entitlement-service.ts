import process from "process";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";
import { GuildModel } from "@vertix.gg/data/src/models/guild-model";
import { SubscriptionModel } from "@vertix.gg/data/src/models/subscription-model";

import {
    isSubscriptionEntitling,
    isTrialWarningDue,
    readBillingTiers,
    resolveCanBrand,
    resolveMaxMasterChannels
} from "@vertix.gg/definitions/src/billing-definitions";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

/**
 * What a server is allowed, and which of its generators that reaches.
 *
 * The one place the question is answered, so the bot's own refusal, the setup screen and the
 * dashboard cannot disagree about what a server may have.
 *
 * **It used to ask discord.** Discord sells guild subscriptions itself and this read them, until it
 * turned out Premium Apps are sold from the US, the EU and the UK only - which does not include
 * where this is run from. That half is gone rather than switched off: a source of truth that can
 * never be right is worse than none at all.
 *
 * What replaces it is a subscription of our own, written by the paddle webhook and read here. A
 * server with no row, or one whose paid period has run out, is on whatever it was granted - which
 * is every server that has never bought anything, so the free path stays the one that is exercised.
 *
 * And for a while on Pro without paying: a server's owner starts its free trial from the dashboard
 * (the api's subscription route writes the date), and the trial counts exactly as paying would until
 * that date passes.
 */
export class EntitlementService extends ServiceBase {
    private readonly debugger: Debugger;

    public static getName() {
        return "VertixBot/Services/Entitlement";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", EntitlementService.getName() ) );
    }

    /**
     * Function getMaxMasterChannels() :: How many generators this guild may have.
     */
    public async getMaxMasterChannels( guildId: string ): Promise<number> {
        const granted = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels;

        const allowed = resolveMaxMasterChannels( {
            granted,
            paidPriceIds: await this.getPaidPriceIds( guildId ),
            trialEndsAt: await this.getTrialEndsAt( guildId ),
            tiers: readBillingTiers( process.env )
        } );

        this.debugger.log( this.getMaxMasterChannels, `Guild id: '${ guildId }' - Allowed '${ allowed }'` );

        return allowed;
    }

    /**
     * Function canBrand() :: Whether this guild may give the bot its own profile there.
     *
     * Paying for a plan that includes it, or on the free trial of one - a grant raises generators
     * only.
     */
    public async canBrand( guildId: string ): Promise<boolean> {
        const allowed = resolveCanBrand( {
            paidPriceIds: await this.getPaidPriceIds( guildId ),
            trialEndsAt: await this.getTrialEndsAt( guildId ),
            tiers: readBillingTiers( process.env )
        } );

        this.debugger.log( this.canBrand, `Guild id: '${ guildId }' - Can brand '${ allowed }'` );

        return allowed;
    }

    /**
     * Function shouldWarnOfTrialEnd() :: Whether this guild should be told now that its free trial is running out.
     */
    public async shouldWarnOfTrialEnd( guildId: string, now: Date = new Date() ): Promise<boolean> {
        const due = isTrialWarningDue( {
            paidPriceIds: await this.getPaidPriceIds( guildId ),
            trialEndsAt: await this.getTrialEndsAt( guildId ),
            tiers: readBillingTiers( process.env ),
            now
        } );

        this.debugger.log( this.shouldWarnOfTrialEnd, `Guild id: '${ guildId }' - Trial warning due '${ due }'` );

        return due;
    }

    /**
     * Function getMaxMasterChannelsAfterTrial() :: How many generators this guild keeps once its trial is over.
     *
     * What it is allowed with the trial taken out and everything else left as it is - the grant, and
     * whatever it pays for - which is the number a server told its trial is ending needs.
     */
    public async getMaxMasterChannelsAfterTrial( guildId: string ): Promise<number> {
        return resolveMaxMasterChannels( {
            granted: ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            paidPriceIds: await this.getPaidPriceIds( guildId ),
            tiers: readBillingTiers( process.env )
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
     * Function getPaidPriceIds() :: The prices this guild is paying for right now.
     */
    private async getPaidPriceIds( guildId: string ): Promise<string[]> {
        const subscription = await SubscriptionModel.$.get( guildId );

        // A lapsed subscription buys nothing, and the row is kept rather than cleared - it is the
        // record of what was bought, and only the question of whether it still counts is one the
        // clock answers. Nothing has to come and delete it when a month runs out.
        return subscription && isSubscriptionEntitling( subscription )
            ? [ subscription.priceId ]
            : [];
    }

    /**
     * Function getTrialEndsAt() :: When this guild's free trial runs out, or null if it never had one.
     *
     * The date and nothing else - whether it still counts is the clock's to answer, as it is for a
     * subscription, so a trial that has ended needs nobody to come and end it.
     */
    private async getTrialEndsAt( guildId: string ): Promise<Date | null> {
        return ( await GuildModel.$.get( guildId ) )?.trialEndsAt ?? null;
    }
}

export default EntitlementService;

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

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
 * What replaces it is a subscription of our own, written by the paddle webhook and read here. Until
 * that read lands, an allowance is whatever a server was granted - which is what every server is on
 * today in any case, so nothing about this is a change in behaviour yet.
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

        this.debugger.log( this.getMaxMasterChannels, `Guild id: '${ guildId }' - Allowed '${ granted }'` );

        return granted;
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
}

export default EntitlementService;

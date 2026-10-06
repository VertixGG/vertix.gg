import process from "process";

import { GuildModel } from "@vertix.gg/data/src/models/guild-model";

import {
    BILLING_TRIAL_WARNING_SWEEP_INTERVAL_MS,
    formatMasterChannelAllowance,
    readBillingTiers,
    resolveTrialTier,
    resolveTrialWarningCutoff
} from "@vertix.gg/definitions/src/billing-definitions";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";

import type { Guild } from "discord.js";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";

/**
 * Tells a server's owner, a couple of days ahead, that its free trial is about to run out.
 *
 * Nothing else happens when a trial ends - the date passes and the plan stops counting - so this is
 * the one time the server hears about it before noticing something gone. It goes to the owner, in a
 * direct message: the one person who can always pay for the server, and nobody else in it needs to
 * read it. An owner whose direct messages are closed is not told at all, and the log says so.
 *
 * Once per server, whichever process gets there first: the telling is claimed on the row before it
 * is sent, so two shards and two bots reading this database cannot all send it.
 */
export class GuildTrialWarningService extends ServiceWithDependenciesBase<{
    appService: AppService;
    entitlementService: EntitlementService;
    uiService: UIService;
}> {
    private sweepInterval?: NodeJS.Timeout;

    /** Whether a sweep is still going - the next one waits for its turn rather than running over it. */
    private isSweeping = false;

    public static getName() {
        return "VertixBot/Services/GuildTrialWarning";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            entitlementService: "VertixBot/Services/Entitlement",
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            this.scheduleSweep();
        } );
    }

    /**
     * Function sweep() :: Warn every server this process speaks for whose trial is about to run out.
     */
    public async sweep( now: Date = new Date() ): Promise<void> {
        const client = this.services.appService.getClient();

        if ( ! client?.user || this.isSweeping ) {
            return;
        }

        this.isSweeping = true;

        try {
            const trials = await GuildModel.$.getTrialsToWarn( now, resolveTrialWarningCutoff( now ) );

            for ( const { guildId, trialEndsAt } of trials ) {
                // The rows name every guild in the database; this process only speaks for its own.
                const guild = ownsGuild( guildId ) ? client.guilds.cache.get( guildId ) : undefined;

                if ( ! guild || ! trialEndsAt ) {
                    continue;
                }

                try {
                    await this.warn( guild, trialEndsAt, now );
                } catch( error ) {
                    this.logger.error( this.sweep, `Guild id: '${ guildId }' - Could not warn that its trial is ending`, error );
                }
            }
        } finally {
            this.isSweeping = false;
        }
    }

    private scheduleSweep() {
        if ( this.sweepInterval ) {
            return;
        }

        const pass = () => this.sweep().catch( ( error ) => {
            this.logger.error( this.scheduleSweep, "Trial warning sweep failed", error );
        } );

        this.sweepInterval = setInterval( pass, BILLING_TRIAL_WARNING_SWEEP_INTERVAL_MS );

        pass();
    }

    /**
     * Function warn() :: Tell one server's owner its trial is running out, if that is still due and nobody has.
     */
    private async warn( guild: Guild, trialEndsAt: Date, now: Date ) {
        const { entitlementService, uiService } = this.services;

        const tier = resolveTrialTier( readBillingTiers( process.env ) );

        if ( ! tier || ! await entitlementService.shouldWarnOfTrialEnd( guild.id, now ) ) {
            return;
        }

        const adapter = uiService.get( "VertixBot/UI-General/TrialEndingAdapter" );

        if ( ! adapter ) {
            this.logger.error( this.warn, `Guild id: '${ guild.id }' - Failed to get the trial ending adapter` );

            return;
        }

        if ( ! await GuildModel.$.claimTrialWarning( guild.id, now ) ) {
            return;
        }

        const landed = await adapter.sendToUser( guild.id, guild.ownerId, {
            guildName: guild.name,
            planName: tier.name,
            endsAt: Math.floor( trialEndsAt.getTime() / 1000 ),
            maxMasterChannels: formatMasterChannelAllowance(
                await entitlementService.getMaxMasterChannelsAfterTrial( guild.id )
            ),
            monthlyPriceUsd: tier.monthlyPriceUsd
        } );

        this.logger.info( this.warn, landed
            ? `Guild id: '${ guild.id }' - Owner '${ guild.ownerId }' told the ${ tier.name } trial ends '${ trialEndsAt.toISOString() }'`
            : `Guild id: '${ guild.id }' - Owner '${ guild.ownerId }' could not be told the ${ tier.name } trial is ending - the direct message did not go through`
        );
    }
}

export default GuildTrialWarningService;

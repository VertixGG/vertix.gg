import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { IGuildEventsSettingsPatch, TGuildEventsError } from "@vertix.gg/definitions/src/guild-events-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/** A change to a server's settings - only what it names is written. */
export type IGuildEventSettingsPatch = IGuildEventsSettingsPatch;

/**
 * What Events does in each server, and the last thing that stopped it there.
 */
export class GuildEventSettingsModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildEventSettingsModel;

    public static getName(): string {
        return "VertixData/Models/GuildEventSettingsModel";
    }

    public static getInstance(): GuildEventSettingsModel {
        if ( ! GuildEventSettingsModel.instance ) {
            GuildEventSettingsModel.instance = new GuildEventSettingsModel();
        }

        return GuildEventSettingsModel.instance;
    }

    public static get $() {
        return GuildEventSettingsModel.getInstance();
    }

    /**
     * Function get() :: A server's settings, or null if Events was never set up there.
     */
    public async get( guildId: string ) {
        return this.prisma.guildEventSettings.findUnique( { where: { guildId } } );
    }

    /**
     * Function getEnabled() :: Every server where this bot runs Events.
     *
     * Its own rows only: a server whose setup was last saved from the other bot is that bot's to run.
     */
    public async getEnabled( applicationId: string ) {
        return this.prisma.guildEventSettings.findMany( {
            where: { applicationId, enabled: true }
        } );
    }

    /**
     * Function save() :: Change a server's settings, and make this bot the one that runs them.
     *
     * What went wrong before is cleared: whoever saved has just been looking at the screen saying so.
     */
    public async save(
        guildId: string,
        applicationId: string,
        patch: IGuildEventSettingsPatch,
        updatedByUserId: string
    ) {
        this.debugger.log( this.save, `Guild id: '${ guildId }' - Saved by '${ updatedByUserId }'` );

        const data = { ... patch, applicationId, updatedByUserId, lastError: null, lastErrorAt: null };

        return this.prisma.guildEventSettings.upsert( {
            where: { guildId },
            create: { guildId, channelId: null, ... data },
            update: data
        } );
    }

    /**
     * Function markError() :: Record what stopped Events in a server, for the settings screen to show.
     */
    public async markError( guildId: string, error: TGuildEventsError ) {
        this.debugger.log( this.markError, `Guild id: '${ guildId }' - ${ error }` );

        await this.prisma.guildEventSettings.updateMany( {
            where: { guildId },
            data: { lastError: error, lastErrorAt: new Date() }
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildEventSettingsModel;

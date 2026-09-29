import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { IGuildBrandingProfile } from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * A server's bot profile, and what each bot has put on itself from it.
 *
 * Two tables behind one model, because they are one question asked from two sides: the dashboard
 * writes what a server wants, and each bot records what it has applied. They are kept apart because
 * two bots read this database - a profile is the server's, while having applied it is one bot's.
 */
export class GuildBrandingModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildBrandingModel;

    public static getName(): string {
        return "VertixData/Models/GuildBrandingModel";
    }

    public static getInstance(): GuildBrandingModel {
        if ( ! GuildBrandingModel.instance ) {
            GuildBrandingModel.instance = new GuildBrandingModel();
        }

        return GuildBrandingModel.instance;
    }

    public static get $() {
        return GuildBrandingModel.getInstance();
    }

    /**
     * Function get() :: The profile a server saved, or null if it never saved one.
     */
    public async get( guildId: string ) {
        return this.prisma.guildBranding.findUnique( { where: { guildId } } );
    }

    /**
     * Function getRevision() :: A server's saved revision, without the images, or null if it has none.
     *
     * What decides whether there is anything to do. The images are the better part of a megabyte
     * and are read only once there is - most looks at a server end at this.
     */
    public async getRevision( guildId: string ) {
        return this.prisma.guildBranding.findUnique( {
            where: { guildId },
            select: { revision: true }
        } );
    }

    /**
     * Function save() :: Replace a server's profile.
     *
     * The whole profile every time, because the form holds the whole of it - a field left null is the
     * bot's own, not "unchanged". The revision is what tells each bot the profile on it is out of date.
     *
     * `bumpRevision: false` stores the fields without telling any bot: the first half of a save split
     * in two, which must not go out alone if the second half never arrives. A row created that way is
     * at revision 0, which no bot applies.
     */
    public async save(
        guildId: string,
        profile: IGuildBrandingProfile,
        updatedByUserId: string,
        options: { bumpRevision: boolean }
    ) {
        this.debugger.log( this.save, `Guild id: '${ guildId }' - Saved by '${ updatedByUserId }'` );

        return this.prisma.guildBranding.upsert( {
            where: { guildId },
            create: { guildId, ... profile, updatedByUserId, revision: options.bumpRevision ? 1 : 0 },
            update: options.bumpRevision
                ? { ... profile, updatedByUserId, revision: { increment: 1 } }
                : { ... profile, updatedByUserId }
        } );
    }

    /**
     * Function getRevisions() :: Every saved profile's server and revision, without the images.
     *
     * The list a sweep walks. Deciding what to do with each server takes its revision and state, and
     * the images are read only for a server that is actually pushed to.
     */
    public async getRevisions() {
        return this.prisma.guildBranding.findMany( {
            select: { guildId: true, revision: true }
        } );
    }

    /**
     * Function getState() :: What this bot has put on itself in a server, or null if nothing ever.
     */
    public async getState( guildId: string, applicationId: string ) {
        return this.prisma.guildBrandingState.findUnique( {
            where: { guildId_applicationId: { guildId, applicationId } }
        } );
    }

    /**
     * Function getStatesToReconcile() :: Every server where this bot has something of a profile to keep.
     *
     * One it is wearing, or a name it still has to set or give back - the second is how a nickname the
     * bot could not return when a plan ended is returned once it may. Its own rows only: the other bot
     * sharing the database keeps its own.
     */
    public async getStatesToReconcile( applicationId: string ) {
        return this.prisma.guildBrandingState.findMany( {
            where: {
                applicationId,
                OR: [ { appliedRevision: { not: null } }, { nickPending: true } ]
            }
        } );
    }

    /**
     * Function markApplied() :: Record that this bot now wears a revision of a server's profile.
     *
     * `appliedNick` and `previousNick` say whose name the bot is wearing; `nickPending` that the name
     * the profile wants could not be set yet.
     */
    public async markApplied( guildId: string, applicationId: string, applied: {
        revision: number;
        appliedNick: boolean;
        previousNick: string | null;
        nickPending: boolean;
    } ) {
        const data = {
            appliedRevision: applied.revision,
            appliedAt: new Date(),
            appliedNick: applied.appliedNick,
            previousNick: applied.previousNick,
            nickPending: applied.nickPending,
            lastError: null,
            refusedRevision: null,
            lastAttemptAt: new Date()
        };

        await this.prisma.guildBrandingState.upsert( {
            where: { guildId_applicationId: { guildId, applicationId } },
            create: { guildId, applicationId, ... data },
            update: data
        } );
    }

    /**
     * Function markCleared() :: Record that this bot wears nothing of a server's profile.
     *
     * The saved profile is not touched: a server whose plan ran out gets it back when it pays again.
     *
     * `nickToGiveBack` is for a name the profile took that could not be returned yet - the bot lacked
     * Change Nickname. It is kept, with the name to return, until it can be.
     */
    public async markCleared( guildId: string, applicationId: string, options: { nickToGiveBack?: string | null } = {} ) {
        const isNickOwed = undefined !== options.nickToGiveBack;

        const data = {
            appliedRevision: null,
            appliedAt: null,
            appliedNick: isNickOwed,
            previousNick: isNickOwed ? options.nickToGiveBack ?? null : null,
            nickPending: isNickOwed,
            lastError: null,
            lastAttemptAt: new Date()
        };

        await this.prisma.guildBrandingState.upsert( {
            where: { guildId_applicationId: { guildId, applicationId } },
            create: { guildId, applicationId, ... data },
            update: data
        } );
    }

    /**
     * Function markError() :: Record why a push failed, for the dashboard to show.
     *
     * `refusedRevision` is for discord refusing the profile itself, rather than being unreachable -
     * a revision that will be refused again is not one a sweep should keep pushing.
     */
    public async markError( guildId: string, applicationId: string, message: string, refusedRevision: number | null = null ) {
        const data = { lastError: message, lastAttemptAt: new Date(), refusedRevision };

        await this.prisma.guildBrandingState.upsert( {
            where: { guildId_applicationId: { guildId, applicationId } },
            create: { guildId, applicationId, ... data },
            update: data
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildBrandingModel;

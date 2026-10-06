import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataBase } from "@vertix.gg/data/src/bases/model-data-base";

import type { Guild } from "discord.js";

const client = PrismaBotClient.getPrismaClient();

export class GuildModel extends ModelDataBase<typeof client.guild, typeof client.guildData> {
    private static instance: GuildModel;

    public static getName(): string {
        return "VertixData/Models/GuildModel";
    }

    public static getInstance(): GuildModel {
        if ( !GuildModel.instance ) {
            GuildModel.instance = new GuildModel();
        }

        return GuildModel.instance;
    }

    public static get $() {
        return GuildModel.getInstance();
    }

    private lastActiveUpdateCache: Map<string, number> = new Map();

    private readonly LAST_ACTIVE_THROTTLE_MS = 1000 * 60 * 5; // 5 minutes

    public constructor() {
        super( isDebugEnabled( "CACHE", GuildModel.getName() ), isDebugEnabled( "MODEL", GuildModel.getName() ) );
    }

    public async get( guildId: string ) {
        return this.prisma.guild.findUnique( { where: { guildId } } );
    }

    public async create( guild: Guild ) {
        const data = {
            guildId: guild.id,
            name: guild.name,
            isInGuild: true,
            joinedAt: guild.joinedAt
        };

        this.debugger.dumpDown( this.create, data );

        return this.prisma.guild.create( { data } );
    }

    /**
     * Function update() :: Record that the bot is in a guild, or has left it.
     *
     * Joining writes when, from discord's own join time, and clears the last leave; leaving writes when.
     * Together they are what an install is measured from - `createdAt` is only the first one ever.
     */
    public async update( guild: Guild, isInGuild: boolean ) {
        let result;

        const presence = isInGuild
            ? { joinedAt: guild.joinedAt, leftAt: null }
            : { leftAt: new Date() };

        try {
            result = await this.prisma.guild.update( {
                where: { guildId: guild.id },
                data: {
                    isInGuild,
                    lastActiveAt: new Date(),
                    ... presence
                }
            } );
        } catch( e: unknown ) {
            if ( e && typeof e === "object" && "code" in e && e.code === "P2025" ) {
                return this.logger.warn( this.update, `Guild id: '${ guild.id }' - Not found in database` );
            }

            throw e;
        }

        return result;
    }

    /**
     * Function startTrial() :: Give a server its one free trial, unless it already had it.
     *
     * A filter rather than a read and a write, so two rooms made at once cannot both start it. The
     * row outlives the bot leaving, so removing the bot and adding it back keeps the date already
     * given - a trial cannot be had twice that way. Rows written before this field existed have it
     * unset rather than null, so both are matched.
     *
     * Answers whether this call was the one that started it.
     */
    public async startTrial( guildId: string, endsAt: Date ): Promise<boolean> {
        const { count } = await this.prisma.guild.updateMany( {
            where: { guildId, OR: [ { trialEndsAt: { isSet: false } }, { trialEndsAt: null } ] },
            data: { trialEndsAt: endsAt }
        } );

        return count > 0;
    }

    public async isExisting( guild: Guild ) {
        return this.prisma.guild.findUnique( {
            where: { guildId: guild.id }
        } );
    }

    public async updateLastActive( guildId: string ): Promise<boolean> {
        const now = Date.now();
        const lastUpdate = this.lastActiveUpdateCache.get( guildId );

        if ( lastUpdate && ( now - lastUpdate ) < this.LAST_ACTIVE_THROTTLE_MS ) {
            return true;
        }

        try {
            await this.prisma.guild.update( {
                where: { guildId },
                data: { lastActiveAt: new Date() }
            } );

            this.lastActiveUpdateCache.set( guildId, now );

            return true;
        } catch( e ) {
            if ( e && typeof e === "object" && "code" in e ) {
                if ( e.code === "P2025" ) {
                    this.logger.warn( this.updateLastActive, `Guild id: '${ guildId }' - Not found in database` );

                    return false;
                }

                if ( e.code === "P2034" ) {
                    this.logger.warn( this.updateLastActive, `Guild id: '${ guildId }' - Write conflict / Deadlock, skipping update` );

                    return true;
                }
            }

            this.logger.error( this.updateLastActive, `Guild id: '${ guildId }' - Unexpected error:`, e );

            return true;
        }
    }

    protected getClient() {
        return client;
    }

    protected getDataModel(): typeof client.guildData {
        return client.guildData;
    }

    protected getOwnerModel(): typeof client.guild {
        return client.guild;
    }

    protected getOwnerIdFieldName(): string {
        return "guildId";
    }
}

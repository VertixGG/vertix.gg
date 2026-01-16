import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelDataBase } from "@vertix.gg/base/src/bases/model-data-base";

import type { Guild } from "discord.js";

const client = PrismaBotClient.getPrismaClient();

export class GuildModel extends ModelDataBase<typeof client.guild, typeof client.guildData> {
    private static instance: GuildModel;

    public static getName(): string {
        return "VertixBase/Models/GuildModel";
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
            isInGuild: true
        };

        this.debugger.dumpDown( this.create, data );

        return this.prisma.guild.create( { data } );
    }

    public async update( guild: Guild, isInGuild: boolean ) {
        let result;

        try {
            result = await this.prisma.guild.update( {
                where: { guildId: guild.id },
                data: {
                    isInGuild,
                    lastActiveAt: new Date()
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

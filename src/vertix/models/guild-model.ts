import { Guild } from "discord.js";

import { Prisma } from "@vertix-base-prisma-bot";

import { ModelDataBase } from "@vertix-base/bases/model-data-base";

import { PrismaInstance } from "@internal/prisma";

const client = PrismaInstance.getClient();

export class GuildModel extends ModelDataBase<typeof client.guild, typeof client.guildData> {
    private static instance: GuildModel;

    public static getName(): string {
        return "Vertix/Models/GuildModel";
    }

    public static getInstance(): GuildModel {
        if ( ! GuildModel.instance ) {
            GuildModel.instance = new GuildModel();
        }

        return GuildModel.instance;
    }

    public static get $() {
        return GuildModel.getInstance();
    }

    public async get( guildId: string ) {
        return this.prisma.guild.findUnique( { where: { guildId } } );
    }

    public async create( guild: Guild ) {
        const data = {
            guildId: guild.id,
            name: guild.name,
            isInGuild: true,
        };

        this.debugger.dumpDown( this.create, data );

        return this.prisma.guild.create( { data } );
    }

    public async update( guild: Guild, isInGuild: boolean ) {
        let result;

        try {
            result = await this.prisma.guild.update( {
                where: { guildId: guild.id },
                data: { isInGuild }
            } );
        } catch ( e ) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025" ) {
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

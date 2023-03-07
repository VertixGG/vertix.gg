import ModelBase from "@internal/bases/model-base";
import { Prisma } from "@prisma/client";
import { Guild } from "discord.js";

export class GuildModel extends ModelBase {
    private static instance: GuildModel;

    private model: Prisma.guildDelegate<Prisma.RejectPerOperation>;

    public static getName(): string {
        return "Dynamico/Models/Guild";
    }

    public static getInstance(): GuildModel {
        if ( ! GuildModel.instance ) {
            GuildModel.instance = new GuildModel();
        }

        return GuildModel.instance;
    }

    constructor() {
        super();

        this.model = this.prisma.guild;
    }

    public async create( guild: Guild ) {
        return this.prisma.guild.create( {
            data: {
                guildId: guild.id,
                name: guild.name,
                isInGuild: true,
            }
        } );
    }

    public async update( guild: Guild, isInGuild: boolean ) {
        let result;

        try {
            result = await this.model.update( {
                where: { guildId: guild.id },
                data: { isInGuild }
            } );
        } catch ( e ) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025" ) {
                return this.logger.warn( this.update,"Guild not found in database" );
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
}

export default GuildModel;

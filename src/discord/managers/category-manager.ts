import { CategoryChannel, ChannelType, Guild } from "discord.js";

import PrismaBase from "@internal/bases/prisma-base";

import Logger from "@internal/modules/logger";

import { ICategoryCreateArgs } from "../interfaces/category";

export default class CategoryManager extends PrismaBase {
    private static instance: CategoryManager;

    private logger: Logger;

    public static getName(): string {
        return "Discord/Managers/CategoryManager";
    }

    public static getInstance(): CategoryManager {
        if ( ! CategoryManager.instance ) {
            CategoryManager.instance = new CategoryManager();
        }

        return CategoryManager.instance;
    }

    constructor() {
        super();

        this.logger = new Logger( this );
    }

    public async create( args: ICategoryCreateArgs ): Promise<CategoryChannel> {
        const { name, guild } = args;

        this.logger.info( this.create,
            `Creating category for guild '${ guild.name }' with name '${ name }'` );

        // Create the channel at discord.
        const category = await guild.channels.create( {
            name,
            type: ChannelType.GuildCategory,
        } );

        // Add the channel to the database.
        await this.prisma.category.create( {
            data: {
                categoryId: category.id,
                guildId: guild.id,
                name,
                createdAtDiscord: category.createdTimestamp,
            }
        } );

        return category;
    }

    public async delete( guild: Guild ) {
        if ( await this.isExisting( guild ) ) {
            this.logger.info(  this.delete,
                `Deleting all categories for guild '${ guild.name }'`);

            await this.prisma.category.deleteMany( {
                where: {
                    guildId: guild.id,
                },
            } );
        }
    }

    public async isExisting( guild: Guild ) {
        const category = await this.prisma.category.findFirst( {
            where: {
                guildId: guild.id,
            },
        } );

        return !! category;
    }
}

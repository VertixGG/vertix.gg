import { CategoryChannel, ChannelType, Guild } from "discord.js";

import CategoryModel from "@dynamico/models/category";

import InitializeBase from "@internal/bases/initialize-base";

export interface ICategoryCreateArgs {
    name: string,
    guild: Guild,
}

export class CategoryManager extends InitializeBase {
    private static instance: CategoryManager;

    private categoryModel: CategoryModel;

    public static getName(): string {
        return "Dynamico/Managers/Category";
    }

    public static getInstance(): CategoryManager {
        if ( ! CategoryManager.instance ) {
            CategoryManager.instance = new CategoryManager();
        }

        return CategoryManager.instance;
    }

    public constructor() {
        super();

        this.categoryModel = CategoryModel.getInstance();
    }

    public async onDelete( category: CategoryChannel ) {
        const { guild, name } = category;

        this.logger.info( this.onDelete,
            `Guild id: '${ guild.id }' - Deleting category name: '${ name }' guild: '${ guild.name }'`
        );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );
    }

    public async create( args: ICategoryCreateArgs ) {
        const { name, guild } = args;

        this.logger.info( this.create,
            `Guild id: '${ guild.id }' - Creating category name: '${ name }' guild: '${ guild.name }`
        );

        // Create the channel at discord.
        const category = await guild.channels.create( {
            name,
            type: ChannelType.GuildCategory,
        } );

        // Add the channel to the database.
        await this.categoryModel.create( { data: {
            categoryId: category.id,
            guildId: guild.id,
            name,
            createdAtDiscord: category.createdTimestamp,
        } } );

        return category;
    }

    public async delete( category: CategoryChannel ) {
        const { guild, name } = category;

        this.logger.info( this.delete,
            `Guild id: '${ guild.id }' - Deleting category name: '${ name }' guild: '${ guild.name }'
            ` );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );

        // Delete the channel from discord.
        await category.delete();
    }
}

export default CategoryManager;

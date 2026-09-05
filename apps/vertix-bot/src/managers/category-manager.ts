import { ChannelType } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { CategoryModel } from "@vertix.gg/bot/src/models/category-model";

import type { CategoryChannel, Guild, OverwriteResolvable } from "discord.js";

export interface ICategoryCreateArgs {
    name: string;
    guild: Guild;
    permissionOverwrites?: OverwriteResolvable[];
}

export class CategoryManager extends InitializeBase {
    private static instance: CategoryManager;

    private categoryModel: CategoryModel;

    public static getName() {
        return "VertixBot/Managers/Category";
    }

    public static get $() {
        if ( !CategoryManager.instance ) {
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

        this.logger.info(
            this.onDelete,
            `Guild id: '${ guild.id }' - Deleting category name: '${ name }', guild: '${ guild.name }'`
        );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );
    }

    public async create( args: ICategoryCreateArgs ) {
        const { name, guild, permissionOverwrites } = args;

        this.logger.info(
            this.create,
            `Guild id: '${ guild.id }' - Creating category name: '${ name }', guild: '${ guild.name }'`
        );

        // Create the channel at discord.
        // A category is also a template: discord copies its overwrites onto any channel created
        // inside it without explicit ones, so leaving it open seeds open channels.
        const category = ( await guild.channels.create( {
            name,
            type: ChannelType.GuildCategory,
            ...( permissionOverwrites ? { permissionOverwrites } : {} )
        } ) ) as CategoryChannel;

        // Add the channel to the database.
        return this.categoryModel
            .create( {
                data: {
                    categoryId: category.id,
                    guildId: guild.id,
                    name,
                    createdAtDiscord: category.createdTimestamp
                }
            } )
            .then( () => category );
    }

    public async delete( category: CategoryChannel ) {
        const { guild, name } = category;

        this.logger.info(
            this.delete,
            `Guild id: '${ guild.id }' - Deleting category name: '${ name }', guild: '${ guild.name }'`
        );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );

        // Delete the channel from discord.
        await category.delete();
    }
}

import { CategoryChannel, ChannelType } from "discord.js";

import { ICategoryCreateArgs } from "../interfaces/category";

import CategoryModel from "@dynamico/models/category";

import InitializeBase from "@internal/bases/initialize-base";

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

    constructor() {
        super();

        this.categoryModel = CategoryModel.getInstance();
    }

    public async onDelete( category: CategoryChannel ) {
        const { guild, name } = category;

        this.logger.info( this.create,
            `Deleting category for guild '${ guild.name }' with name '${ name }'` );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );
    }

    public async delete( category: CategoryChannel ) {
        const { guild, name } = category;

        this.logger.info( this.create,
            `Deleting category for guild '${ guild.name }' with name '${ name }'` );

        // Delete the channel from the database.
        await this.categoryModel.delete( guild.id, category.id );

        // Delete the channel from discord.
        await category.delete();
    }

    public async create( args: ICategoryCreateArgs ) {
        const { name, guild } = args;

        this.logger.info( this.create,
            `Creating category for guild '${ guild.name }' with name '${ name }'` );

        // Create the channel at discord.
        const category = await guild.channels.create( {
            name,
            type: ChannelType.GuildCategory,
        } );

        // Add the channel to the database.
        await this.categoryModel.create( {
            categoryId: category.id,
            guildId: guild.id,
            name,
            createdAtDiscord: category.createdTimestamp,
        } );

        return category;
    }
}

export default CategoryManager;

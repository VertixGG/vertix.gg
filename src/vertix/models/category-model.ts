import { Prisma, PrismaClient } from "@vertix-base-prisma-bot";

import { ModelBase } from "@vertix-base/bases/model-base";

import { PrismaInstance } from "@internal/prisma";

export class CategoryModel extends ModelBase<PrismaClient> {
    private static instance: CategoryModel;

    public static getName(): string {
        return "Vertix/Models/CategoryModel";
    }

    public static getInstance(): CategoryModel {
        if ( ! CategoryModel.instance ) {
            CategoryModel.instance = new CategoryModel();
        }

        return CategoryModel.instance;
    }

    public static get $() {
        return CategoryModel.getInstance();
    }

    public async create( args: Prisma.CategoryCreateArgs ) {
        return this.prisma.category.create( args );
    }

    public async delete( guildId: string, guildCategoryId?: string | null ) {
        const where: any = { guildId };

        if ( guildCategoryId ) {
            where.categoryId = guildCategoryId;
        }

        return this.prisma.category.deleteMany( { where } );
    }

    protected getClient() {
        return PrismaInstance.getClient();
    }
}


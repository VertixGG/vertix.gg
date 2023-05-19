import { Prisma } from "@prisma/client";

import { ModelBase } from "@internal/bases/model-base";

export class CategoryModel extends ModelBase {
    private static instance: CategoryModel;

    public static getName(): string {
        return "Dynamico/Models/Category";
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
}


import { Prisma } from "@prisma/client";

import ModelBase from "@internal/bases/model-base";

export class CategoryModel extends ModelBase {
    private static instance: CategoryModel;

    private model: Prisma.CategoryDelegate<Prisma.RejectPerOperation>;

    public static getName(): string {
        return "Dynamico/Models/Category";
    }

    public static getInstance(): CategoryModel {
        if ( ! CategoryModel.instance ) {
            CategoryModel.instance = new CategoryModel();
        }

        return CategoryModel.instance;
    }

    public constructor() {
        super();

        this.model = this.prisma.category;
    }

    public async create( args: Prisma.CategoryCreateArgs ) {
        return this.model.create( args );
    }

    public async delete( guildId: string, guildCategoryId?: string | null ) {
        const where: any = { guildId };

        if ( guildCategoryId ) {
            where.categoryId = guildCategoryId;
        }

        return this.model.deleteMany( { where } );
    }
}

export default CategoryModel;

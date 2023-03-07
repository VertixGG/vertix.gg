import { Prisma } from "@prisma/client";

import ModelBase from "@internal/bases/model-base";

interface ICreateData { // TODO: Check if this is needed
    categoryId: string;
    guildId: string;
    name: string;
    createdAtDiscord: number;
}

export class CategoryModel extends ModelBase {
    private static instance: CategoryModel;

    private model: Prisma.categoryDelegate<Prisma.RejectPerOperation>;

    public static getName(): string {
        return "Dynamico/Models/Category";
    }

    public static getInstance(): CategoryModel {
        if ( ! CategoryModel.instance ) {
            CategoryModel.instance = new CategoryModel();
        }

        return CategoryModel.instance;
    }

    constructor() {
        super();

        this.model = this.prisma.category;
    }

    public async create( data: ICreateData ) {
        return this.model.create( { data } );
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

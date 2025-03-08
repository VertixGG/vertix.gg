import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/base/src/bases/model-base";

export class CategoryModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: CategoryModel;

    public static getName(): string {
        return "VertixBot/Models/CategoryModel";
    }

    public static getInstance(): CategoryModel {
        if (!CategoryModel.instance) {
            CategoryModel.instance = new CategoryModel();
        }

        return CategoryModel.instance;
    }

    public static get $() {
        return CategoryModel.getInstance();
    }

    public async create(args: PrismaBot.Prisma.CategoryCreateArgs) {
        return this.prisma.category.create(args);
    }

    public async delete(guildId: string, guildCategoryId?: string | null) {
        const where: any = { guildId };

        if (guildCategoryId) {
            where.categoryId = guildCategoryId;
        }

        return this.prisma.category.deleteMany({ where });
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

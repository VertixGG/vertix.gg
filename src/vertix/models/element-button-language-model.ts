import { Prisma } from "@vertix-bot-prisma";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

import { PrismaInstance } from "@internal/prisma";

const model = PrismaInstance.getClient().elementButtonLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class ElementButtonLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ElementButtonLanguageModel;

    public static getName(): string {
        return "Vertix/Models/ElementButtonLanguageModel";
    }

    public static getInstance(): ElementButtonLanguageModel {
        if ( ! ElementButtonLanguageModel.instance ) {
            ElementButtonLanguageModel.instance = new ElementButtonLanguageModel( false );
        }

        return ElementButtonLanguageModel.instance;
    }

    public static get $() {
        return ElementButtonLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}

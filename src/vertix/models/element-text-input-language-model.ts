import { Prisma } from "@vertix-base-prisma-bot";

import { PrismaBotInstance } from"@vertix-base/prisma/prisma-bot-instance";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

const model = PrismaBotInstance.getClient().elementTextInputLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}
export class ElementTextInputLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ElementTextInputLanguageModel;

    public static getName(): string {
        return "Vertix/Models/ElementTextInputLanguageModel";
    }

    public static getInstance(): ElementTextInputLanguageModel {
        if ( ! ElementTextInputLanguageModel.instance ) {
            ElementTextInputLanguageModel.instance = new ElementTextInputLanguageModel( false );
        }

        return ElementTextInputLanguageModel.instance;
    }

    public static get $() {
        return ElementTextInputLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}


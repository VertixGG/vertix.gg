import { Prisma } from "@vertix-base-prisma-bot";

import { PrismaBotInstance } from"@vertix-base/prisma/prisma-bot-instance";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

const model = PrismaBotInstance.getClient().embedLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class EmbedLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: EmbedLanguageModel;

    public static getName(): string {
        return "Vertix/Models/EmbedLanguageModel";
    }

    public static getInstance(): EmbedLanguageModel {
        if ( ! EmbedLanguageModel.instance ) {
            EmbedLanguageModel.instance = new EmbedLanguageModel( false );
        }

        return EmbedLanguageModel.instance;
    }

    public static get $() {
        return EmbedLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().embedLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class EmbedLanguageModel extends ModelLanguageBase<typeof model, PrismaBot.Prisma.PromiseReturnType<typeof withContent>> {
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

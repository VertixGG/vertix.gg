import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().elementButtonLanguage;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class ElementButtonLanguageModel extends ModelLanguageBase<typeof model, PrismaBot.Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ElementButtonLanguageModel;

    public static getName(): string {
        return "VertixBot/Models/ElementButtonLanguageModel";
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

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().modalLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}
export class ModalLanguageModel extends ModelLanguageBase<typeof model, PrismaBot.Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ModalLanguageModel;

    public static getName(): string {
        return "VertixBot/Models/ModalLanguageModel";
    }

    public static getInstance(): ModalLanguageModel {
        if ( ! ModalLanguageModel.instance ) {
            ModalLanguageModel.instance = new ModalLanguageModel( false );
        }

        return ModalLanguageModel.instance;
    }

    public static get $() {
        return ModalLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}


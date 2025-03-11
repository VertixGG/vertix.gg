import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().elementTextInputLanguage;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function withContent() {
    return model.findFirst( {
        include: {
            content: true
        }
    } );
}
export class ElementTextInputLanguageModel extends ModelLanguageBase<
    typeof model,
    PrismaBot.Prisma.PromiseReturnType<typeof withContent>
> {
    private static instance: ElementTextInputLanguageModel;

    public static getName(): string {
        return "VertixBot/Models/ElementTextInputLanguageModel";
    }

    public static getInstance(): ElementTextInputLanguageModel {
        if ( !ElementTextInputLanguageModel.instance ) {
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

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().markdownLanguage;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function withContent () {
    return model.findFirst( {
        include: {
            content: true
        }
    } );
}

export class MarkdownLanguageModel extends ModelLanguageBase<
    typeof model,
    PrismaBot.Prisma.PromiseReturnType<typeof withContent>
> {
    private static instance: MarkdownLanguageModel;

    public static getName (): string {
        return "VertixBot/Models/MarkdownLanguageModel";
    }

    public static getInstance (): MarkdownLanguageModel {
        if ( !MarkdownLanguageModel.instance ) {
            MarkdownLanguageModel.instance = new MarkdownLanguageModel( false );
        }

        return MarkdownLanguageModel.instance;
    }

    public static get $ () {
        return MarkdownLanguageModel.getInstance();
    }

    protected getModel () {
        return model;
    }
}

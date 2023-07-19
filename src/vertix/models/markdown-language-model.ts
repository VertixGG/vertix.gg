import { Prisma } from "@vertix-base-prisma-bot";

import { PrismaBotInstance } from"@vertix-base/prisma/prisma-bot-instance";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

const model = PrismaBotInstance.getClient().markdownLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}

export class MarkdownLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: MarkdownLanguageModel;

    public static getName(): string {
        return "Vertix/Models/MarkdownLanguageModel";
    }

    public static getInstance(): MarkdownLanguageModel {
        if ( ! MarkdownLanguageModel.instance ) {
            MarkdownLanguageModel.instance = new MarkdownLanguageModel( false );
        }

        return MarkdownLanguageModel.instance;
    }

    public static get $() {
        return MarkdownLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}


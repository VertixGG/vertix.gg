import { Prisma } from "@prisma/client";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

import { PrismaInstance } from "@internal/prisma";

const model = PrismaInstance.getClient().markdownLanguage;

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


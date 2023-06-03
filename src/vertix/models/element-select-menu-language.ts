import { Prisma } from "@prisma/client";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

import { PrismaInstance } from "@internal/prisma";

const model = PrismaInstance.getClient().elementSelectMenuLanguage;

// TODO: All `withContent` should be like that.
async function withContent() {
    return model.findFirst( {
        select: {
            content: {
                select: {
                    selectOptions: true,
                    placeholder: true,
                }
            },
        }
    } );
}

export class ElementSelectMenuLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ElementSelectMenuLanguageModel;

    public static getName(): string {
        return "Vertix/Models/ElementSelectMenuLanguageModel";
    }

    public static getInstance(): ElementSelectMenuLanguageModel {
        if ( ! ElementSelectMenuLanguageModel.instance ) {
            ElementSelectMenuLanguageModel.instance = new ElementSelectMenuLanguageModel( false );
        }

        return ElementSelectMenuLanguageModel.instance;
    }

    public static get $() {
        return ElementSelectMenuLanguageModel.getInstance();
    }

    protected getModel() {
        return model;
    }
}


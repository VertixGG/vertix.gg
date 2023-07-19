import { Prisma } from "@vertix-base-prisma-bot";

import { PrismaBotInstance } from"@vertix-base/prisma/prisma-bot-instance";

import { ModelLanguageBase } from "@vertix/bases/model-language-base";

const model = PrismaBotInstance.getClient().modalLanguage;

async function withContent() {
    return model.findFirst( {
        include: {
            content: true,
        }
    } );
}
export class ModalLanguageModel extends ModelLanguageBase<typeof model, Prisma.PromiseReturnType<typeof withContent>> {
    private static instance: ModalLanguageModel;

    public static getName(): string {
        return "Vertix/Models/ModalLanguageModel";
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


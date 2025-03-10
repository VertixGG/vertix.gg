import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelLanguageBase } from "@vertix.gg/bot/src/bases/model-language-base";

const model = PrismaBotClient.getPrismaClient().elementSelectMenuLanguage;

// TODO: All `withContent` should be like that.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function withContent () {
    return model.findFirst( {
        select: {
            content: {
                select: {
                    selectOptions: true,
                    placeholder: true,
                    options: true
                }
            }
        }
    } );
}

export class ElementSelectMenuLanguageModel extends ModelLanguageBase<
    typeof model,
    PrismaBot.Prisma.PromiseReturnType<typeof withContent>
> {
    private static instance: ElementSelectMenuLanguageModel;

    public static getName (): string {
        return "VertixBot/Models/ElementSelectMenuLanguageModel";
    }

    public static getInstance (): ElementSelectMenuLanguageModel {
        if ( !ElementSelectMenuLanguageModel.instance ) {
            ElementSelectMenuLanguageModel.instance = new ElementSelectMenuLanguageModel( false );
        }

        return ElementSelectMenuLanguageModel.instance;
    }

    public static get $ () {
        return ElementSelectMenuLanguageModel.getInstance();
    }

    protected getModel () {
        return model;
    }
}

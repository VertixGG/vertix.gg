import "@vertix.gg/prisma/bot-client";

import { UIPortableBase } from "@vertix.gg/gui/src/bases/ui-portable-base";

import type { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import type { UIArgs, UIEntityTypes, UIPortableSchemaBase, UIType } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIModalLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";

export interface UIModalSchema extends UIPortableSchemaBase {
    attributes: {
        title: string;
        custom_id?: string;
    };
}

// TODO: test.
export abstract class UIModalBase extends UIPortableBase<UIModalSchema> {
    declare private uiInputElements: UIElementInputBase[][];

    private content: UIModalLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIModalBase";
    }

    public static getType(): UIType {
        return "modal";
    }

    public static validate() {
        this.ensureEntities( this.getInputElements().flat(), true );
    }

    public static getInputElements(): ( typeof UIElementInputBase )[] | ( typeof UIElementInputBase )[][] {
        return [];
    }

    public constructor() {
        super();

        this.uiInputElements = [];
    }

    public async build( args?: UIArgs ) {
        this.content = await this.uiService.getUILanguageManager().getModalTranslatedContent( this, args?._language );

        return super.build( args );
    }

    public async getTranslatableContent(): Promise<PrismaBot.ModalContentLanguage> {
        return {
            title: this.getTitle()
        };
    }

    protected abstract getTitle(): string;

    protected async getSchemaInternal() {
        return {
            name: this.getName(),
            type: this.getStaticThis().getType(),
            attributes: {
                title: this.content?.title || this.getTitle()
            },
            entities: this.uiInputElements.map( ( row ) => row.map( ( element ) => element.getSchema() ) )
        };
    }

    protected async buildDynamicEntities( args?: UIArgs ) {
        await this.buildInputElements( args );
    }

    protected async buildStaticEntities() {
        await this.buildInputElements( undefined, true );
    }

    private async buildInputElements( args?: UIArgs, onlyStatic = false ) {
        const elements = this.getStaticThis().getInputElements(),
            isMultiRow = Array.isArray( elements[ 0 ] ),
            elementsRows = isMultiRow
                ? ( elements as ( typeof UIElementInputBase )[][] )
                : [ elements as ( typeof UIElementInputBase )[] ];

        const isEmpty = isMultiRow ? !elementsRows.length : elementsRows.every( ( row ) => !row.length );

        if ( isEmpty ) {
            this.uiInputElements.length = 0;
            return;
        }

        let y = 0;
        for ( const elementsRow of elementsRows ) {
            if ( undefined === this.uiInputElements[ y ] ) {
                this.uiInputElements[ y ] = [];
            }

            await this.buildEntities( this.uiInputElements[ y ], elementsRow as UIEntityTypes, onlyStatic, args );
            y++;
        }
    }

    private getStaticThis() {
        return this.constructor as typeof UIModalBase;
    }
}

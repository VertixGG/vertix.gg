import { UIPortableBase } from "@vertix/ui-v2/_base/ui-portable-base";
import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";

import { UIArgs, UIModalLanguageContent, UIPortableSchemaBase, UIType } from "@vertix/ui-v2/_base/ui-definitions";
import { ModalContentLanguage } from "@prisma/client";
import { UILanguageManager } from "@vertix/ui-v2/ui-language-manager";

interface UIModalSchema extends UIPortableSchemaBase {
    attributes: {
        title: string,
        // customId?: string,
    }
}

// TODO: test.
export abstract class UIModalBase extends UIPortableBase<UIModalSchema> {
    declare private uiInputElements: UIElementInputBase[][];

    private content: UIModalLanguageContent | undefined;

    public static getName() {
        return "Vertix/UI-V2/UIModalBase";
    }

    public static getType(): UIType {
        return "modal";
    }

    public static validate() {
        this.ensureEntities( this.getInputElements().flat(), true );
    }

    public static getInputElements(): typeof UIElementInputBase[] | typeof UIElementInputBase[][] {
        return [];
    }

    public constructor() {
        super();

        this.uiInputElements = [];
    }

    public async build( args?: UIArgs ) {
        this.content = await UILanguageManager.$.getModalTranslatedContent( this, args?._language );

        return super.build( args );
    }

    public async getTranslatableContent(): Promise<ModalContentLanguage> {
        return {
            title: this.getTitle(),
        };
    }

    protected abstract getTitle(): string;

    protected async getSchemaInternal() {
        return {
            name: this.getName(),
            type: this.getStaticThis().getType(),
            attributes: {
                title: this.content?.title || this.getTitle(),
            },
            entities: this.uiInputElements.map( row => row.map( element => element.getSchema() ) )
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
            elementsRows = isMultiRow ?
                elements as typeof UIElementInputBase[][] :
                [ elements as typeof UIElementInputBase[] ];

        let y = 0;
        for ( const elementsRow of elementsRows ) {
            let x = 0;

            if ( undefined === this.uiInputElements[ y ] ) {
                this.uiInputElements[ y ] = [];
            }

            for ( const Element of elementsRow ) {
                this.uiInputElements[ y ][ x ] =
                    await this.buildEntity(
                        this.uiInputElements[ y ][ x ],
                        Element,
                        onlyStatic,
                        args
                    ) as UIElementInputBase;
                x++;
            }
        }
    }

    private getStaticThis() {
        return this.constructor as typeof UIModalBase;
    }
}

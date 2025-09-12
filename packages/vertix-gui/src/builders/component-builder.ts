
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import type {  UIInstancesTypes , UIElementsConstructor, UIElementsTypes, UIEmbedTypes, UIComponentTypeConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import type { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

export class ComponentBuilder {
    private name: string;
    private instanceType: UIInstancesTypes | null = null;
    private elementsGroups: ( typeof UIElementsGroupBase )[] = [];
    private embedsGroups: ( typeof UIEmbedsGroupBase )[] = [];
    private modals: ( typeof UIModalBase )[] = [];
    private elements: UIElementsTypes | UIElementsConstructor = [];
    private embeds: UIEmbedTypes = [];
    private markdowns: ( typeof UIMarkdownBase )[] = [];

    private defaultElementsGroup: string | null = null;
    private defaultEmbedsGroup: string | null = null;
    private defaultMarkdownsGroup: string | null = null;

    public constructor( name: string ) {
        this.name = name;
    }

    public setInstanceType( type: UIInstancesTypes ): this {
        this.instanceType = type;
        return this;
    }

    public addElementsGroup( group: typeof UIElementsGroupBase ): this {
        this.elementsGroups.push( group );
        return this;
    }

    public addEmbedsGroup( group: typeof UIEmbedsGroupBase ): this {
        this.embedsGroups.push( group );
        return this;
    }

    public addEmbedsSingleGroup( embed: typeof UIEmbedBase ): this {
        this.embedsGroups.push( UIEmbedsGroupBase.createSingleGroup( embed ) );
        return this;
    }

    public setDefaultElementsGroup( name: string ): this {
        this.defaultElementsGroup = name;
        return this;
    }

    public setDefaultEmbedsGroup( name: string ): this {
        this.defaultEmbedsGroup = name;
        return this;
    }

    public setDefaultMarkdownsGroup( name: string ): this {
        this.defaultMarkdownsGroup = name;
        return this;
    }

    public addModal( modal: typeof UIModalBase ): this {
        this.modals.push( modal );
        return this;
    }

    public addElements( elements: ( typeof UIElementBase )[] | { new (): UIElementBase<any> }[] ): this {
        ( this.elements as ( ( typeof UIElementBase )[] | { new (): UIElementBase<any> }[] )[] ).push( elements );
        return this;
    }

    public addEmbed( embed: typeof UIEmbedBase ): this {
        this.embeds.push( embed );
        return this;
    }

    public addMarkdown( markdown: typeof UIMarkdownBase ): this {
        this.markdowns.push( markdown );
        return this;
    }

    public build(): UIComponentTypeConstructor {
        const builder = this;
        return class GeneratedComponent extends UIComponentBase {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                if ( builder.instanceType === null ) {
                    throw new Error( `Instance type is not defined for '${ builder.name }'` );
                }
                return builder.instanceType;
            }

            public static getElementsGroups() {
                return builder.elementsGroups;
            }

            public static getEmbedsGroups() {
                return builder.embedsGroups;
            }
            public static getDefaultElementsGroup() {
                return builder.defaultElementsGroup;
            }

            public static getDefaultEmbedsGroup() {
                return builder.defaultEmbedsGroup;
            }

            public static getDefaultMarkdownsGroup() {
                return builder.defaultMarkdownsGroup;
            }

            public static getModals() {
                return builder.modals;
            }

            public static getElements() {
                return builder.elements;
            }

            public static getEmbeds() {
                return builder.embeds;
            }

            public static getMarkdowns() {
                return builder.markdowns;
            }
        };
    }
}

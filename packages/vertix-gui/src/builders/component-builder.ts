import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import type { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";
import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";
import type { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

export class ComponentBuilder {
    private name: string;
    private instanceType: UIInstancesTypes = UIInstancesTypes.Dynamic;
    private elementsGroups: ( typeof UIElementsGroupBase )[] = [];
    private embedsGroups: ( typeof UIEmbedsGroupBase )[] = [];
    private modals: ( typeof UIModalBase )[] = [];
    private defaultElementsGroup: string | null = null;
    private defaultEmbedsGroup: string  | null = null;

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

    public addModal( modal: typeof UIModalBase ): this {
        this.modals.push( modal );
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

    public build(): typeof UIComponentBase {
        const builder = this;
        return class GeneratedComponent extends UIComponentBase {
            public static getName() {
                return builder.name;
            }

            public static getInstanceType() {
                return builder.instanceType;
            }

            public static getElementsGroups() {
                return builder.elementsGroups;
            }

            public static getEmbedsGroups() {
                return builder.embedsGroups;
            }

            public static getModals() {
                return builder.modals;
            }

            public static getDefaultElementsGroup() {
                return builder.defaultElementsGroup;
            }

            public static getDefaultEmbedsGroup() {
                return builder.defaultEmbedsGroup;
            }
        };
    }
}

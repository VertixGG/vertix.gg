import { UIComponentBase } from "@vertix.gg/gui/src/bases/ui-component-base";

import type { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIMockGeneratorUtilComponentBuilder {
    private name!: string;
    private instanceType!: UIInstancesTypes;
    private elements: any[] = [];
    private embeds: any[] = [];
    private modals: any[] = [];
    private elementsGroups: any[] = [];
    private defaultElementsGroup: string = "";
    private embedsGroups: any[] = [];
    private defaultEmbedsGroup: string = "";

    public withName( name: string ) {
        this.name = name;
        return this;
    }

    public withInstanceType( instanceType: UIInstancesTypes ) {
        this.instanceType = instanceType;
        return this;
    }

    public withElements( ...elements: any[] ) {
        this.elements = elements;
        return this;
    }

    public withEmbeds( ...embeds: any[] ) {
        this.embeds = embeds;
        return this;
    }

    public withModals( ...modals: any[] ) {
        this.modals = modals;
        return this;
    }

    public withElementsGroups( ...elementsGroups: any[] ) {
        this.elementsGroups = elementsGroups;
        return this;
    }

    public withDefaultElementsGroup( defaultElementsGroup: string ) {
        this.defaultElementsGroup = defaultElementsGroup;
        return this;
    }

    public withEmbedsGroups( ...embedsGroups: any[] ) {
        this.embedsGroups = embedsGroups;
        return this;
    }

    public withDefaultEmbedsGroup( defaultEmbedsGroup: string ) {
        this.defaultEmbedsGroup = defaultEmbedsGroup;
        return this;
    }

    public build() {
        const name = this.name;
        const instanceType = this.instanceType;
        const elements = this.elements;
        const embeds = this.embeds;
        const modals = this.modals;
        const elementsGroups = this.elementsGroups;
        const defaultElementsGroup = this.defaultElementsGroup;
        const embedsGroups = this.embedsGroups;
        const defaultEmbedsGroup = this.defaultEmbedsGroup;

        return class extends UIComponentBase {
            public static getName() {
                return name;
            }

            public static getInstanceType() {
                return instanceType;
            }

            protected static getElements() {
                return elements;
            }

            protected static getEmbeds() {
                return embeds;
            }

            protected static getModals() {
                return modals;
            }

            public static getElementsGroups() {
                return elementsGroups;
            }

            public static getDefaultElementsGroup() {
                return defaultElementsGroup;
            }

            public static getEmbedsGroups() {
                return embedsGroups;
            }

            public static getDefaultEmbedsGroup() {
                return defaultEmbedsGroup;
            }
        };
    }
}

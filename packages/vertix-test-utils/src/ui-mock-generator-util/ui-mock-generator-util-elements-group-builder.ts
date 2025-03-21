import { UIElementsGroupBase } from "@vertix.gg/gui/src/bases/ui-elements-group-base";

export class UIMockGeneratorUtilElementsGroupBuilder {
    private name!: string;
    private items: any[] = [];

    public withName( name: string ) {
        this.name = name;
        return this;
    }

    public withItems( ...items: any[] ) {
        this.items = items;
        return this;
    }

    public build() {
        const name = this.name;
        const items = this.items;

        return class extends UIElementsGroupBase {
            public static getName() {
                return name;
            }

            public static getItems() {
                return items;
            }
        };
    }
}

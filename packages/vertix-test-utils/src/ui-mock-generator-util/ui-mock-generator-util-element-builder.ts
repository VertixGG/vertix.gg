import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIMockGeneratorUtilElementBuilder {
    private name!: string;
    private instanceType!: UIInstancesTypes;

    public withName( name: string ) {
        this.name = name;
        return this;
    }

    public withInstanceType( instanceType: UIInstancesTypes ) {
        this.instanceType = instanceType;
        return this;
    }

    public build() {
        let name = this.name;
        const instanceType = this.instanceType;

        return class extends UIElementBase<any> {
            public static getName() {
                return name;
            }

            public static getInstanceType() {
                return instanceType;
            }

            public async getTranslatableContent(): Promise<any> {
                return {};
            }

            protected async getAttributes() {
                return {};
            }

            public static set __name( newName: string ) {
                name = newName;
            }
        };
    }
}

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import type { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIMockGeneratorUtilEmbedBuilder {
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
        const name = this.name;
        const instanceType = this.instanceType;

        return class extends UIEmbedBase {
            public static getName() {
                return name;
            }

            public static getInstanceType() {
                return instanceType;
            }
        };
    }
}

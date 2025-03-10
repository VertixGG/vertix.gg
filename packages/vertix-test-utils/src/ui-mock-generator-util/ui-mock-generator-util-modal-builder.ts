import { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIMockGeneratorUtilModalBuilder {
    private name!: string;
    private instanceType!: UIInstancesTypes;
    private title!: string;

    public withName ( name: string ) {
        this.name = name;
        return this;
    }

    public withInstanceType ( instanceType: UIInstancesTypes ) {
        this.instanceType = instanceType;
        return this;
    }

    public withTitle ( title: string ) {
        this.title = title;
        return this;
    }

    public build () {
        const name = this.name;
        const instanceType = this.instanceType;
        const title = this.title;

        return class extends UIModalBase {
            public static getName () {
                return name;
            }

            public static getInstanceType () {
                return instanceType;
            }

            protected getTitle () {
                return title;
            }
        };
    }
}

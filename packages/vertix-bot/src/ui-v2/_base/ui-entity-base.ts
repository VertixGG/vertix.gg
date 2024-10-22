import { UIInstanceTypeBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-instance-type-base";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

/**
 * Defines a base class for UI entities that provides a consistent interface for retrieving schema information.
 * Child classes can extend this base class and implement the `getAttributes()`
 * method to provide the attribute definitions for their respective UI entities.
 */
export abstract class UIEntityBase extends UIInstanceTypeBase {
    declare protected schema: UIEntitySchemaBase;

    protected uiArgs: UIArgs | undefined;

    public static getName() {
        return "VertixBot/UI-V2/UIEntityBase";
    }

    public getSchema() {
        return this.schema;
    }

    public async build( uiArgs?: UIArgs ) {
        this.uiArgs = uiArgs;

        this.schema = await this.getSchemaInternal();

        return this.schema;
    }

    protected abstract getAttributes(): Promise<{ [ name: string ]: any }>;

    protected async isAvailable?(): Promise<boolean>;

    protected async getSchemaInternal(): Promise<UIEntitySchemaBase> {
        return {
            name: this.getName(),
            type: ( this.constructor as typeof UIEntityBase ).getType(),
            attributes: await this.getAttributes(),
            isAvailable: this.isAvailable ? await this.isAvailable() : true,
        };
    }
}

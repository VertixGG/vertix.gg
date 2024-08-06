import { UIInstanceTypeBase } from "@vertix.gg/gui/src/bases/ui-instance-type-base";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Defines a base class for UI entities that provides a consistent interface for retrieving schema information.
 * Child classes can extend this base class and implement the `getAttributes()`
 * method to provide the attribute definitions for their respective UI entities.
 */
export abstract class UIEntityBase extends UIInstanceTypeBase {
    declare protected schema: UIEntitySchemaBase;

    private uiArgsInternal: UIArgs | undefined;

    public static getName() {
        return "VertixGUI/UIEntityBase";
    }

    public getSchema() {
        return this.schema;
    }

    public async build( uiArgs?: UIArgs ) {
        this.uiArgsInternal = uiArgs;

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

    protected get uiArgs() {
        return this.uiArgsInternal;
    }

    protected set uiArgs( value: UIArgs | undefined ) {
        this.uiArgsInternal = value;
    }
}

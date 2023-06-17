import { APIBaseComponent, ComponentType } from "discord.js";

import { UIType } from "@vertix/ui-v2/_base/ui-definitions";
import { UITemplateBase } from "@vertix/ui-v2/_base/ui-template-base";

import { ForceMethodImplementation } from "@internal/errors";

export abstract class UIElementBase<T extends APIBaseComponent<ComponentType>> extends UITemplateBase {
    public static getName() {
        return "Vertix/UI-V2/UIElementBase";
    }

    public static getType(): UIType {
        return "element";
    }

    public static getComponentType(): ComponentType {
        throw new ForceMethodImplementation( this, this.getComponentType.name );
    }

    public abstract getTranslatableContent(): Promise<any>;

    protected abstract getAttributes(): Promise<T>;
}

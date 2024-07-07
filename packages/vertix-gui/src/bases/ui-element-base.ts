import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UITemplateBase } from "@vertix.gg/gui/src/bases/ui-template-base";

import type { APIBaseComponent, ComponentType } from "discord.js";

import type { UIType } from "@vertix.gg/gui/src/bases/ui-definitions";

export abstract class UIElementBase<T extends APIBaseComponent<ComponentType>> extends UITemplateBase {
    public static getName() {
        return "VertixGUI/UIElementBase";
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

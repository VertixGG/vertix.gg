import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UITemplateBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-template-base";

import type { APIBaseComponent, ComponentType } from "discord.js";

import type { UIType } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export abstract class UIElementBase<T extends APIBaseComponent<ComponentType>> extends UITemplateBase {
    public static getName() {
        return "VertixBot/UI-V2/UIElementBase";
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

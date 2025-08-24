import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UITemplateBase } from "@vertix.gg/gui/src/bases/ui-template-base";

import type { APIBaseComponent, ComponentType } from "discord.js";

import type { UIType, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

export abstract class UIElementBase<T extends APIBaseComponent<ComponentType>, TArgs extends UIArgs = UIArgs> extends UITemplateBase<TArgs> {
    protected readonly uiLanguageManager: UILanguageManagerInterface;

    public static getName() {
        return "VertixGUI/UIElementBase";
    }

    public static getType(): UIType {
        return "element";
    }

    public constructor() {
        super();

        this.uiLanguageManager = this.uiService.getUILanguageManager();
    }

    public static getComponentType(): ComponentType {
        throw new ForceMethodImplementation( this, this.getComponentType.name );
    }

    public abstract getTranslatableContent(): Promise<any>;

    protected abstract getAttributes(): Promise<T>;
}

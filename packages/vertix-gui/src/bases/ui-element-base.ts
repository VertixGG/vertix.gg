import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { UITemplateBase } from "@vertix.gg/gui/src/bases/ui-template-base";

import type { APIBaseComponent, ComponentType } from "discord.js";

import type { ElementOverride } from "@vertix.gg/definitions/src/ui-customization-definitions";
import type { UIType } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UILanguageManagerInterface } from "@vertix.gg/gui/src/interfaces/language-manager-interface";

export abstract class UIElementBase<T extends APIBaseComponent<ComponentType>> extends UITemplateBase {
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

    protected async fetchElementOverride(): Promise<ElementOverride | null> {
        const guildId = this.uiArgs?._guildId as string | undefined;
        const customizationKey = this.uiArgs?._customizationKey as string | undefined;
        const languageCode = this.uiArgs?._language as string | undefined;

        if ( !guildId || !customizationKey ) {
            return null;
        }

        try {
            const provider = this.uiService.getCustomizationProvider();
            const customization = await provider.getComponentCustomization( guildId, customizationKey, languageCode );

            if ( !customization?.elementOverrides ) {
                return null;
            }

            const elementName = ( this.constructor as typeof UIElementBase ).getName();
            return customization.elementOverrides[ elementName ] ?? null;
        } catch {
            return null;
        }
    }
}

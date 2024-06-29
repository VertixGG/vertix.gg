import { ComponentType } from "discord.js";

import { UIElementBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-element-base";

import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type { APIUserSelectComponent } from "discord.js";
import type { UIElementSelectMenuLanguageContent } from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

export abstract class UIElementUserSelectMenu extends UIElementBase<APIUserSelectComponent> {
    private content: UIElementSelectMenuLanguageContent | undefined;

    public static getName() {
        return "VertixBot/UI-V2/UIElementUserSelectMenu";
    }

    public static getComponentType(): ComponentType {
        return ComponentType.UserSelect;
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await UILanguageManager.$.getSelectMenuTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementSelectMenuLanguageContent> {
        return {
            placeholder: await this.getPlaceholder?.(),
        };
    }

    protected async getPlaceholder?(): Promise<string>;

    /**
     * @default 1
     */
    protected async getMinValues?(): Promise<number|undefined>;

    /**
     * @default 1
     */
    protected async getMaxValues?(): Promise<number|undefined>;

    /**
     * @default false
     */
    protected async isDisabled?(): Promise<boolean>;

    protected async getCustomId?(): Promise<string>;

    protected async getAttributes() {
        const custom_id = await this.getCustomId?.() || "",
            placeholder = this.content?.placeholder || await this.getPlaceholder?.(),
            min_values = await this.getMinValues?.(),
            max_values = await this.getMaxValues?.(),
            disabled = await this.isDisabled?.(),
            result = {
                type: UIElementUserSelectMenu.getComponentType(),
                custom_id,
            } as APIUserSelectComponent;

        if ( placeholder ) {
            result.placeholder = placeholder;
        }

        if ( 0 === min_values || min_values ) {
            result.min_values = min_values;
        }

        if ( max_values ) {
            result.max_values = max_values;
        }

        if ( disabled ) {
            result.disabled = disabled;
        }

        return result;
    }
}

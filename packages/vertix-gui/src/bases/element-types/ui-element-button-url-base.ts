import { ButtonStyle, ComponentType } from "discord.js";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { APIButtonComponentWithURL } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIElementButtonLanguageContent } from "@vertix.gg/gui/src/bases/ui-language-definitions";

export abstract class UIElementButtonUrlBase extends UIElementBase<APIButtonComponentWithURL> {
    private content: UIElementButtonLanguageContent | undefined;

    public static getName() {
        return "VertixGUI/UIElementButtonUrlBase";
    }

    public static getComponentType() {
        return ComponentType.Button;
    }

    /**
     * Function build() :: Look the label up in the server's language before drawing.
     *
     * A link button's label is snapshotted into the language files like any other button's, and
     * was never read back out of them - every link button spoke English whatever the server spoke.
     */
    public async build( uiArgs?: UIArgs ) {
        this.content = await this.uiLanguageManager.getButtonTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementButtonLanguageContent> {
        return {
            label: await this.getLabel()
        };
    }

    protected abstract getLabel(): Promise<string>;

    protected abstract getURL(): Promise<string>;

    protected async isDisabled?(): Promise<boolean>;

    protected async getAttributes() {
        const type = Number( UIElementButtonUrlBase.getComponentType() ),
            label = this.content?.label || await this.getLabel(),
            style = Number( ButtonStyle.Link ),
            disabled = await this.isDisabled?.(),
            url = await this.getURL();

        const result = {
            type,
            label,
            style,
            url
        } as APIButtonComponentWithURL;

        if ( disabled ) {
            result.disabled = disabled;
        }

        // Apply guild-specific element overrides
        const override = await this.fetchElementOverride();
        if ( override ) {
            if ( override.label !== undefined && override.label.length > 0 ) {
                result.label = override.label;
            }

            if ( override.url !== undefined && override.url.length > 0 ) {
                result.url = override.url;
            }

            if ( override.disabled !== undefined ) {
                result.disabled = override.disabled;
            }
        }

        return result;
    }
}

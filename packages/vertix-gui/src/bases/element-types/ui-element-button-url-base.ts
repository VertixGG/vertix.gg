import { ButtonStyle, ComponentType } from "discord.js";

import { UIElementBase } from "@vertix.gg/gui/src/bases/ui-element-base";

import type { APIButtonComponentWithURL } from "discord.js";

export abstract class UIElementButtonUrlBase extends UIElementBase<APIButtonComponentWithURL> {
    public static getName() {
        return "VertixGUI/UIElementButtonUrlBase";
    }

    public static getComponentType() {
        return ComponentType.Button;
    }

    public async getTranslatableContent(): Promise<any> {
        return {
            label: await this.getLabel()
        };
    }

    protected abstract getLabel(): Promise<string>;

    protected abstract getURL(): Promise<string>;

    protected async isDisabled?(): Promise<boolean>;

    protected async getAttributes() {
        const type = Number( UIElementButtonUrlBase.getComponentType() ),
            label = await this.getLabel(),
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

        return result;
    }
}

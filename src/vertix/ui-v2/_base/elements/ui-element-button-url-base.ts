import { APIButtonComponentWithURL, ButtonStyle, ComponentType } from "discord.js";

import { UIElementBase } from "@vertix/ui-v2/_base/ui-element-base";

export abstract class UIElementButtonUrlBase extends UIElementBase<APIButtonComponentWithURL> {
    public static getName() {
        return "Vertix/UI-V2/UIElementButtonUrlBase";
    }

    public async getTranslatableContent(): Promise<any> {
        return {
            label: await this.getLabel(),
        };
    }

    protected abstract getLabel(): Promise<string>;

    protected abstract getURL(): Promise<string>;

    protected async isDisabled?(): Promise<boolean>;

    protected async getAttributes() {
        const type = Number( ComponentType.Button ),
            label = await this.getLabel(),
            style = Number( ButtonStyle.Link ),
            disabled = await this.isDisabled?.(),
            url = await this.getURL();

        const result = {
            type,
            label,
            style,
            url,
        } as APIButtonComponentWithURL;

        if ( disabled ) {
            result.disabled = disabled;
        }

        return result;
    }
}

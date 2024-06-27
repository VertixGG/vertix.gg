import {
    ButtonStyle,
    ComponentType,
    parseEmoji,
} from "discord.js";

import { UIElementBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-element-base";

import { UILanguageManager } from "@vertix.gg/bot/src/ui-v2/ui-language-manager";

import type { UIArgs, UIBaseTemplateOptions, UIButtonStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";
import type {
    APIButtonComponentWithCustomId,
    APIMessageComponentEmoji } from "discord.js";
import type { UIElementButtonLanguageContent } from "@vertix.gg/bot/src/ui-v2/_base/ui-language-definitions";

export abstract class UIElementButtonBase extends UIElementBase<APIButtonComponentWithCustomId> {
    private content: UIElementButtonLanguageContent | undefined;

    public static getName() {
        return "VertixBot/UI-V2/UIElementButtonBase";
    }

    public static getComponentType(): ComponentType {
        return ComponentType.Button;
    }

    public async build( uiArgs?: UIArgs ) {
        this.content = await UILanguageManager.$.getButtonTranslatedContent( this, uiArgs?._language );

        return super.build( uiArgs );
    }

    public async getTranslatableContent(): Promise<UIElementButtonLanguageContent> {
        const result: UIElementButtonLanguageContent = {
                label: await this.getLabel(),
            },
            options = this.getOptions();

        if ( Object.keys( options ).length ) {
            result.options = options;
        }

        return result;
    }

    protected abstract getLabel(): Promise<string>;

    protected abstract getStyle(): Promise<UIButtonStyleTypes>

    protected async getEmoji?(): Promise<string>;

    protected async isDisabled?(): Promise<boolean>;

    protected getCustomId?(): Promise<string>;

    protected async getAttributes() {
        let style: ButtonStyle;

        switch ( await this.getStyle() ) {
            case "primary":
                style = ButtonStyle.Primary;
                break;
            case "secondary":
                style = ButtonStyle.Secondary;
                break;
            case "success":
                style = ButtonStyle.Success;
                break;
            case "danger":
                style = ButtonStyle.Danger;
                break;

            default:
                throw new Error( "Invalid style" );
        }

        const type = Number( UIElementButtonBase.getComponentType() ),
            label = await this.getLabelInternal(),
            emoji = await this.getEmoji?.(),
            disabled = await this.isDisabled?.(),
            custom_id = await this.getCustomId?.() || "";

        const result = {
            type,
            label,
            style,
            custom_id,
        } as APIButtonComponentWithCustomId;

        if ( emoji ) {
            result.emoji = parseEmoji( emoji ) as APIMessageComponentEmoji;
        }

        if ( disabled ) {
            result.disabled = disabled;
        }

        return result;
    }

    protected getOptions(): UIBaseTemplateOptions {
        return {};
    }

    protected async getLogic(): Promise<{ [ key: string ]: any }> {
        return {};
    }

    private async getLabelInternal() {
        const options = this.content?.options || this.getOptions(),
            logic = await this.getLogic(),
            label = await this.content?.label || await this.getLabel();

        if ( Object.keys( options ).length === 0 && Object.keys( logic ).length === 0 ) {
            return label;
        }

        const result = this.composeTemplate(
            { label },
            await this.getLogic(),
            options,
        );

        return result.label;
    }
}

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { V2_ELEMENT_TO_V3_BUTTON_ID } from "@vertix.gg/utils/src/button-ids";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/require-id";

export abstract class DynamicChannelButtonBase extends UIElementButtonBase implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelButtonBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public abstract getId(): number;

    public abstract getSortId(): number;

    public abstract getLabel(): Promise<string>;

    public abstract getEmoji(): Promise<string>;

    public abstract getLabelForMenu(): Promise<string>;

    public abstract getLabelForEmbed(): string;

    public abstract getEmojiForEmbed(): string;

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async isDisabled(): Promise<boolean> {
        switch ( await DynamicChannelVoteManager.$.getState( this.uiArgs?.channelId ) ) {
            case "active":
            case "starting":
                return true;
        }

        return false;
    }

    /**
     * Whether this generator's set carries this button.
     *
     * A set holds this button's own number when the buttons screen inside discord wrote it, and the
     * shared slug when the dashboard did - a generator can hold either, and a set written as slugs
     * read against the number alone came back as no buttons at all.
     */
    protected async isAvailable(): Promise<boolean> {
        const template = this.uiArgs?.dynamicChannelButtonsTemplate;

        if ( ! template?.length ) {
            return false;
        }

        const id = this.getId(),
            slug = V2_ELEMENT_TO_V3_BUTTON_ID[
                ( this.constructor as typeof DynamicChannelButtonBase ).getName()
            ];

        return template.some( ( entry: string ) => parseInt( entry ) === id || ( Boolean( slug ) && entry === slug ) );
    }
}

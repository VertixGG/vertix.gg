import { ForceMethodImplementation } from "@vertix.gg/base/src/errors/index";
import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { IRequireId } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/require-id";

export abstract class DynamicChannelButtonBase extends UIElementButtonBase implements IRequireId {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelButtonBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public static getSortId(): number {
        throw new ForceMethodImplementation( this, this.getSortId.name );
    }

    protected static getSortIdAfter( ButtonType: typeof DynamicChannelButtonBase ) {
        return ButtonType.getSortId() + 1;
    }

    public get $$() {
        return this.constructor as typeof DynamicChannelButtonBase;
    }

    public abstract getId(): string;

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
     * Whether a generator that curated nothing carries this button.
     *
     * Apart from `isAvailable()`, which reads the set a generator already has - this one decides
     * what goes into that set when it is first written. A button that can do nothing until an
     * admin has configured something else says no, and is offered as an unchecked box in the
     * buttons screen rather than drawn on every panel as a control that answers with an apology.
     */
    public isInDefaultSet(): boolean {
        return true;
    }

    protected async isAvailable(): Promise<boolean> {
        if ( this.uiArgs?.dynamicChannelButtonsTemplate?.length ) {
            return this.uiArgs.dynamicChannelButtonsTemplate.some( ( i: string ) => i === this.getId() );
        }

        return false;
    }

    protected async isLabelOmitted(): Promise<boolean> {
        return true;
    }
}

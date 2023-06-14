import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";

import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { IRequireId } from "@vertix/ui-v2/dynamic-channel/base/require-id";

import { DynamicChannelVoteManager } from "@vertix/managers/dynamic-channel-vote-manager";

export abstract class DynamicChannelButtonBase extends UIElementButtonBase implements IRequireId {
    public static getName() {
        return "Vertix/UI-V2/DynamicChannelButtonBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    // TODO: Add unique verification.
    public abstract getId(): number;

    public abstract getLabel(): Promise<string>;

    public abstract getEmoji(): Promise<string>;

    public abstract getLabelForMenu(): Promise<string>;

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

    protected async isAvailable(): Promise<boolean> {
        if ( this.uiArgs?.dynamicChannelButtonsTemplate?.length ) {
            return this.uiArgs.dynamicChannelButtonsTemplate.some(
                ( i: any ) => parseInt( i ) === this.getId()
            );
        }

        return false;
    }
}

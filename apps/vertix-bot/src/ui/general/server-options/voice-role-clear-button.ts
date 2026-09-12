import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Empties the voice role, so members are given nothing for being in a channel.
 */
export class VoiceRoleClearButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/VoiceRoleClearButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Clear" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "danger" );
    }

    protected async getEmoji(): Promise<string> {
        return "🧹";
    }
}

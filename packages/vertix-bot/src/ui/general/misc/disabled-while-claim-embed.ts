import { Colors } from "discord.js";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DisabledWhileClaimEmbed extends UIEmbedBase {
    public static getName () {
        return "VertixBot/UI-General/DisabledWhileClaimEmbed";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle (): string {
        return "😈 The action is disabled";
    }

    protected getDescription (): string {
        return (
            "The action is disabled while the claim is in progress.\n\n" + "Please wait until the claim is completed."
        );
    }

    protected getColor (): number {
        return Colors.Red;
    }
}

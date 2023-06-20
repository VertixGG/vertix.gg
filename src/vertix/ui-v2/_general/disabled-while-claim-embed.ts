import { Colors } from "discord.js";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class DisabledWhileClaimEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V2/DisabledWhileClaimEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle(): string {
        return "😈 The action is disabled";
    }

    protected getDescription(): string {
        return "The action is disabled while the claim is in progress.\n\n" +
            "Please wait until the claim is completed.";
    }

    protected getColor(): number {
        return Colors.Red;
    }
}

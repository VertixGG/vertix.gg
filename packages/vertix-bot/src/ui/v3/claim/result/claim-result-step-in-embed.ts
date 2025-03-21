import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Shown when the user successfully put himself forward as a potential owner of the channel.
 */
export class ClaimResultStepInEmbed extends UIEmbedBase {
    public static getName() {
        return "Vertix/UI-V3/ClaimResultStepInEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getTitle() {
        return "😈  Channel might be yours";
    }

    protected getDescription() {
        return "You've put yourself forward as a potential owner of this channel.\n" + "Good luck!\n";
    }
}

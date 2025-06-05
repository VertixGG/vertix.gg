import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingStep2Embed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingStep2Embed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return VERTIX_DEFAULT_COLOR_BRAND;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle(): string {
        return "Step 2: Select a Category";
    }

    protected getDescription(): string {
        return (
            "Choose an existing category or create a new one for your auto-scaling voice channels.\n\n" +
            "The selected category will house your Master Scaling Channel and all auto-created voice channels.\n\n" +
            "After selecting a category, click **( `Next ▶` )** to continue to the scaling settings configuration."
        );
    }

    protected getLogic( args: UIArgs ) {
        const fields = [];

        // Show selected category if available
        if ( args.selectedCategoryName ) {
            fields.push( {
                name: "Selected Category",
                value: args.selectedCategoryName,
                inline: true
            } );
        }

        return {
            fields
        };
    }
}

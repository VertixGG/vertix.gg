import { Colors } from "discord.js";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SomethingWentWrongEmbed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-V2/SomethingWentWrongEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle(): string {
        return "🤷 Oops, an issue has occurred";
    }

    protected getDescription(): string {
        return "Something went wrong";
    }

    protected getColor(): number {
        return Colors.Red;
    }
}

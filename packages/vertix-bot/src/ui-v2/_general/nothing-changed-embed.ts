import { Colors } from "discord.js";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class NothingChangedEmbed extends UIEmbedBase {
    public static getName() {
        return "VertixBot/UI-V2/NothingChangedEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected getTitle(): string {
        return "🤷  Nothing changed";
    }

    protected getDescription(): string {
        return "This is may occur when you try to change something that is not changeable or is the same as before.";
    }

    protected getColor(): number {
        return Colors.Red;
    }
}

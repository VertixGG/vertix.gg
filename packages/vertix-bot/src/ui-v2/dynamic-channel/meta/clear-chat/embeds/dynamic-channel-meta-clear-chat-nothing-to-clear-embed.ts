import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelMetaClearChatNothingToClearEmbed extends UIEmbedBase {
    public static getName(): string {
        return "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClearEmbed";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor(): number {
        return 0xC5AC63; // Broom like.
    }

    protected getTitle(): string {
        return "🧹  There are no messages available to clear";
    }

    protected getDescription(): string {
        return "Keep in mind, that only non-embeds messages can be deleted.";
    }
}

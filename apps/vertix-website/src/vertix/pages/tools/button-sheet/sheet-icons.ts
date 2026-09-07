import ChannelPermissions from "@assets/svg/ChannelPermissions.svg?raw";
import ChannelPrivacy from "@assets/svg/ChannelPrivacy.svg?raw";
import ChannelRegion from "@assets/svg/ChannelRegion.svg?raw";
import ChannelRename from "@assets/svg/ChannelRename.svg?raw";
import ChannelTemplates from "@assets/svg/ChannelTemplates.svg?raw";
import ClaimChannel from "@assets/svg/ClaimChannel.svg?raw";
import ClearChat from "@assets/svg/ClearChat.svg?raw";
import EditChannelMessage from "@assets/svg/EditChannelMessage.svg?raw";
import ResetChannel from "@assets/svg/ResetChannel.svg?raw";
import TransferChannel from "@assets/svg/TransferChannel.svg?raw";
import UserLimit from "@assets/svg/UserLimit.svg?raw";

/**
 * The bot's own emoji artwork, keyed by the base name the bot registers it under - the same name
 * that comes back inside `<emoji name='...'>` in the UI export.
 */
const ICON_SOURCE: Readonly<Record<string, string>> = {
    ChannelPermissions,
    ChannelPrivacy,
    ChannelRegion,
    ChannelRename,
    ChannelTemplates,
    ClaimChannel,
    ClearChat,
    EditChannelMessage,
    ResetChannel,
    TransferChannel,
    UserLimit
};

/**
 * Function iconSource() :: The artwork as raw svg markup.
 *
 * The sheet inlines each icon into one document rather than referencing it, so what is wanted here
 * is the markup itself. The eleven files share 103 element ids between them, so the caller is
 * responsible for namespacing before they meet - see `inlineIcon` in `sheet-svg`.
 */
export function iconSource( baseName: string ): string | null {
    return ICON_SOURCE[ baseName ] ?? null;
}

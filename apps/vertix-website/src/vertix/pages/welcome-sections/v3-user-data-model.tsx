
import ChannelRenameEmoji from "@vertix.gg/assets/svg/ChannelRename.svg";
import UserLimitEmoji from "@vertix.gg/assets/svg/UserLimit.svg";
import ChannelPermissionsEmoji from "@vertix.gg/assets/svg/ChannelPermissions.svg";
import ChannelPrivacyEmoji from "@vertix.gg/assets/svg/ChannelPrivacy.svg";
import ChannelRegionEmoji from "@vertix.gg/assets/svg/ChannelRegion.svg";
import EditChannelMessageEmoji from "@vertix.gg/assets/svg/EditChannelMessage.svg";
import ClearChatEmoji from "@vertix.gg/assets/svg/ClearChat.svg";
import ResetChannelEmoji from "@vertix.gg/assets/svg/ResetChannel.svg";
import TransferChannelEmoji from "@vertix.gg/assets/svg/TransferChannel.svg";
import ClaimChannelEmoji from "@vertix.gg/assets/svg/ClaimChannel.svg";
import ChannelTemplatesEmoji from "@vertix.gg/assets/svg/ChannelTemplates.svg";

const DiscordEmoji: React.FC<{ src: string; alt: string }> = ( { src, alt } ) => (
    <img src={ src } alt={ alt } className="discord-emoji" draggable={ false } style={ { width: "1.2em", height: "1.2em", verticalAlign: "middle", marginRight: "0.3em" } } />
);

export default function V3DataModels() {
    return (
        <div className="mb-4">
            <div className="row g-4 mt-2">
                <div className="col-md-6">
                    <ul className="list-unstyled fs-5 text-secondary">
                        <li className="mb-3"><DiscordEmoji src={ ChannelRenameEmoji } alt="Rename" /> <strong>Rename</strong> - Change your channel name.</li>
                        <li className="mb-3"><DiscordEmoji src={ UserLimitEmoji } alt="Limit" /> <strong>User Limit</strong> - Set maximum members.</li>
                        <li className="mb-3"><DiscordEmoji src={ ClearChatEmoji } alt="Clear Chat" /> <strong>Clear Chat</strong> - Wipe channel messages.</li>
                        <li className="mb-3"><DiscordEmoji src={ ResetChannelEmoji } alt="Reset" /> <strong>Reset</strong> - Restore default settings.</li>
                        <li className="mb-3"><DiscordEmoji src={ ChannelRegionEmoji } alt="Region" /> <strong>Region</strong> - Pick voice server region.</li>
                        <li className="mb-3"><DiscordEmoji src={ ChannelTemplatesEmoji } alt="Templates" /> <strong>Templates</strong> - Save and load channel presets.</li>
                    </ul>
                </div>
                <div className="col-md-6">
                    <ul className="list-unstyled fs-5 text-secondary">
                        <li className="mb-3"><DiscordEmoji src={ ChannelPermissionsEmoji } alt="Permissions" /> <strong>Permissions</strong> - Manage user access.</li>
                        <li className="mb-3"><DiscordEmoji src={ ChannelPrivacyEmoji } alt="Privacy" /> <strong>Privacy</strong> - Toggle public or private.</li>
                        <li className="mb-3"><DiscordEmoji src={ EditChannelMessageEmoji } alt="Edit" /> <strong>Edit Primary Message</strong> - Customize the interface.</li>
                        <li className="mb-3"><DiscordEmoji src={ TransferChannelEmoji } alt="Transfer" /> <strong>Transfer</strong> - Give ownership to another user.</li>
                        <li className="mb-3"><DiscordEmoji src={ ClaimChannelEmoji } alt="Claim" /> <strong>Claim</strong> - Take over inactive channels.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

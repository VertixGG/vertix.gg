import { useCustomEmojiSrc } from "@vertix.gg/discord-ui";

// The button artwork is resolved from Discord (see `loadEmojiManifest`), so each icon is looked up
// by its emoji name rather than imported from the repo. `useCustomEmojiSrc()` subscribes the icon
// to the manifest and repaints it once the artwork lands, so an icon that is not resolved yet just
// renders nothing until then.
const DiscordEmoji: React.FC<{ name: string; alt: string }> = ( { name, alt } ) => {
    const src = useCustomEmojiSrc( name );

    if ( ! src ) {
        return null;
    }

    return (
        <img src={ src } alt={ alt } className="discord-emoji" draggable={ false } style={ { width: "1.2em", height: "1.2em", verticalAlign: "middle", marginRight: "0.3em" } } />
    );
};

export default function V3DataModels() {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-12 gap-6 mt-2">
                <div className="col-span-12 md:col-span-6">
                    <ul className="list-none pl-0 text-h5 text-vc-ice-dim">
                        <li className="mb-4"><DiscordEmoji name="ChannelRename" alt="Rename" /> <strong>Rename</strong> - Change your channel name.</li>
                        <li className="mb-4"><DiscordEmoji name="UserLimit" alt="Limit" /> <strong>User Limit</strong> - Set maximum members.</li>
                        <li className="mb-4"><DiscordEmoji name="ClearChat" alt="Clear Chat" /> <strong>Clear Chat</strong> - Wipe channel messages.</li>
                        <li className="mb-4"><DiscordEmoji name="ResetChannel" alt="Reset" /> <strong>Reset</strong> - Restore default settings.</li>
                        <li className="mb-4"><DiscordEmoji name="ChannelRegion" alt="Region" /> <strong>Region</strong> - Pick voice server region.</li>
                        <li className="mb-4"><DiscordEmoji name="ChannelTemplates" alt="Templates" /> <strong>Templates</strong> - Save and load channel presets.</li>
                    </ul>
                </div>
                <div className="col-span-12 md:col-span-6">
                    <ul className="list-none pl-0 text-h5 text-vc-ice-dim">
                        <li className="mb-4"><DiscordEmoji name="ChannelPermissions" alt="Permissions" /> <strong>Permissions</strong> - Manage user access.</li>
                        <li className="mb-4"><DiscordEmoji name="ChannelPrivacy" alt="Privacy" /> <strong>Privacy</strong> - Toggle public or private.</li>
                        <li className="mb-4"><DiscordEmoji name="EditChannelMessage" alt="Edit" /> <strong>Edit Primary Message</strong> - Customize the interface.</li>
                        <li className="mb-4"><DiscordEmoji name="TransferChannel" alt="Transfer" /> <strong>Transfer</strong> - Give ownership to another user.</li>
                        <li className="mb-4"><DiscordEmoji name="ClaimChannel" alt="Claim" /> <strong>Claim</strong> - Take over inactive channels.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

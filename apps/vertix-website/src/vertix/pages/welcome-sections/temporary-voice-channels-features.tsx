import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import V3DataModels from "./v3-user-data-model";

import "../../components/discord/discord-chat-container.css";

export default function TemporaryVoiceChannelsFeatures() {
    return (
        <div className="mb-12">
            <h4 id="temporary-voice-channels-features">Temporary Voice Channels V2 Features</h4>
            <div className="mb-6">
                <div className="discord-chat-container m-0" style={ { minHeight: "300px" } }>
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 5:52 PM"
                        mentionUsername="doctor-helper"
                        componentName="VertixBot/UI-V2/DynamicChannel"
                        variables={ {
                            name: "leonidvinikov's Channel",
                            limit: "🖐️ Unlimited",
                            state: "🌐 **Public**",
                            visibilityState: "🐵 **Shown**",
                            region: "**Automatic**",
                        } }
                        elementOverrides={ {
                            "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                            "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                            "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                            "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { disabled: false, label: "Claim" },
                            "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                            "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                            "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                            "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset" },
                            "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                        } }
                    />
                </div>
            </div>
            <div className="grid grid-cols-12 gap-6 mt-2">
                <div className="col-span-12 md:col-span-6">
                    <ul className="list-none pl-0 text-h5 text-vc-ice-dim">
                        <li className="mb-4">✏️ <strong>Rename</strong> - Give your space a unique name.</li>
                        <li className="mb-4">✋ <strong>Limit</strong> - Control how many people can join.</li>
                        <li className="mb-4">🚫 <strong>Privacy</strong> - Switch between Public and Private.</li>
                        <li className="mb-4">🙈 <strong>Visibility</strong> - Hide your channel from the list.</li>
                    </ul>
                </div>
                <div className="col-span-12 md:col-span-6">
                    <ul className="list-none pl-0 text-h5 text-vc-ice-dim">
                        <li className="mb-4">👥 <strong>Access</strong> - Manage who's allowed or blocked.</li>
                        <li className="mb-4">🔃 <strong>Reset</strong> - Start fresh with default settings.</li>
                        <li className="mb-4">🔀 <strong>Transfer</strong> - Hand over ownership to a friend.</li>
                        <li className="mb-4">😈 <strong>Claim</strong> - Take over inactive channels automatically.</li>
                    </ul>
                </div>
            </div>

            <hr className="my-12" />

            <h4 id="temporary-voice-channels-v3" className="mb-6">Experience the Future: Temporary Voice Channels V3 🚀</h4>
            <p className="text-h5 text-vc-ice-dim mb-6">
                V3 brings a more modern, intuitive, and lightning-fast interface to your Discord server.
            </p>

            <div className="mb-6">

                <div className="discord-chat-container m-0" style={ { minHeight: "300px" } }>
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 5:52 PM"
                        mentionUsername="doctor-helper"
                        componentName="VertixBot/UI-V3/DynamicChannel"
                        variables={ {
                            title: "༄ Manage your Dynamic Channel",
                            description: "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\nPlease be advised that the privilege to make alterations is vested solely of the channel owner.",
                            name: "leonidvinikov's Channel",
                            limit: "Unlimited",
                            state: "🌐 Public",
                            region: "Automatic",
                            renameEmoji: "<:ChannelRename:1272447740034682952>",
                            limitEmoji: "<:UserLimit:1269654650206818316>",
                            privacyEmoji: "<:ChannelPrivacy:1269655669984985158>",
                            regionEmoji: "<:ChannelRegion:1272451511322017804>",
                        } }
                        elementOverrides={ {
                            "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true },
                        } }
                    />
                </div>
            </div>

            <V3DataModels />
        </div>
    );
}
